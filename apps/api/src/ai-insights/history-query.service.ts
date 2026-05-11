import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

const CONTEXT_LIMIT = 10;
const CACHE_TTL_SECONDS = 24 * 3600;
const REEMBED_BATCH = 50;
const REEMBED_LIMIT_PER_RUN = 100;

interface PendingSession {
  id: string;
  startedAt: Date;
  durationSeconds: number;
  accuracyScore: number;
  gymSessionId: string | null;
}

interface RankedSession {
  id: string;
  startedAt: Date;
  durationSeconds: number;
  accuracyScore: number;
  distance: number;
}

interface SessionContext {
  date: string;
  durationMinutes: number;
  accuracyScore: number;
  exercises: Array<{ name: string; topWeight: number; reps: number }>;
}

@Injectable()
export class HistoryQueryService {
  private readonly logger = new Logger(HistoryQueryService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    private embeddings: EmbeddingsService,
  ) {}

  async query(userId: string, userQuery: string) {
    const hash = createHash('md5').update(userQuery.trim().toLowerCase()).digest('hex');
    const cacheKey = `ai-insights:history-query:${userId}:${hash}`;
    return this.cache.getOrSet(cacheKey, CACHE_TTL_SECONDS, () => this.run(userId, userQuery));
  }

  private async run(userId: string, userQuery: string) {
    const ranked = await this.rankSessions(userId, userQuery);
    if (!ranked.length) {
      return { answer: 'V historii zatím není dostatek tréninků k analýze.', source: 'empty', contextSize: 0 };
    }
    const context = await this.buildContext(ranked);
    const answer = await this.askClaude(userQuery, context);
    return { answer, source: 'claude', contextSize: context.length };
  }

  private async rankSessions(userId: string, userQuery: string): Promise<RankedSession[]> {
    const embedding = await this.embeddings.embed(userQuery);
    const vector = this.embeddings.toVectorString(embedding);
    return this.prisma.$queryRaw<RankedSession[]>(Prisma.sql`
      SELECT id, "startedAt", "durationSeconds", "accuracyScore",
             embedding <=> ${vector}::vector AS distance
      FROM "WorkoutSession"
      WHERE "userId" = ${userId} AND embedding IS NOT NULL AND "completedAt" IS NOT NULL
      ORDER BY distance ASC
      LIMIT ${CONTEXT_LIMIT}
    `);
  }

  private async buildContext(ranked: RankedSession[]): Promise<SessionContext[]> {
    const ids = ranked.map((r) => r.id);
    const sessions = await this.prisma.workoutSession.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        startedAt: true,
        durationSeconds: true,
        accuracyScore: true,
        gymSession: {
          select: {
            exerciseSets: {
              where: { isWarmup: false },
              select: { actualReps: true, actualWeight: true, exercise: { select: { nameCs: true } } },
            },
          },
        },
      },
    });
    return sessions
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .map((s) => ({
        date: s.startedAt.toISOString().slice(0, 10),
        durationMinutes: Math.round(s.durationSeconds / 60),
        accuracyScore: Math.round(s.accuracyScore),
        exercises: this.summarizeExercises(s.gymSession?.exerciseSets ?? []),
      }));
  }

  private summarizeExercises(
    sets: Array<{ actualReps: number; actualWeight: number; exercise: { nameCs: string } }>,
  ) {
    const byName = new Map<string, { topWeight: number; reps: number }>();
    for (const set of sets) {
      const name = set.exercise.nameCs;
      const cur = byName.get(name);
      if (!cur || set.actualWeight > cur.topWeight) {
        byName.set(name, { topWeight: set.actualWeight, reps: set.actualReps });
      }
    }
    return Array.from(byName.entries()).map(([name, v]) => ({ name, ...v }));
  }

  private async askClaude(userQuery: string, context: SessionContext[]): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return this.fallbackSummary(context);

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });
      const ctxText = context
        .map(
          (c) =>
            `${c.date} (${c.durationMinutes}min, forma ${c.accuracyScore}%): ${c.exercises
              .map((e) => `${e.name} ${e.topWeight}kg×${e.reps}`)
              .join('; ')}`,
        )
        .join('\n');
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        system: `Jsi AI fitness analytik. Odpovídej česky, konkrétně, podle dat. Max 5 vět. Nikdy si nevymýšlej čísla, pracuj jen s tím, co máš v kontextu.\n\nHistorie tréninků uživatele (top ${context.length} relevantních):\n${ctxText}`,
        messages: [{ role: 'user', content: userQuery }],
      });
      return response.content[0]?.type === 'text' ? response.content[0].text.trim() : this.fallbackSummary(context);
    } catch (err) {
      this.logger.warn(`history-query Claude error: ${(err as Error).message}`);
      return this.fallbackSummary(context);
    }
  }

  private fallbackSummary(context: SessionContext[]): string {
    if (!context.length) return 'V historii zatím není dostatek tréninků.';
    const dates = context.map((c) => c.date).slice(0, 5).join(', ');
    return `Nalezl jsem ${context.length} relevantních tréninků (např. ${dates}). AI analýza není momentálně dostupná.`;
  }

  /** Weekly cron: embed completed WorkoutSessions still missing embeddings. */
  @Cron('0 3 * * 0')
  async reembedRecentSessions(): Promise<void> {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn('Skipping re-embed cron: OPENAI_API_KEY not set');
      return;
    }
    const pending = await this.prisma.$queryRaw<PendingSession[]>(Prisma.sql`
      SELECT id, "startedAt", "durationSeconds", "accuracyScore", "gymSessionId"
      FROM "WorkoutSession"
      WHERE embedding IS NULL AND "completedAt" IS NOT NULL
      ORDER BY "startedAt" DESC
      LIMIT ${REEMBED_LIMIT_PER_RUN}
    `);
    if (!pending.length) return;
    const texts = await Promise.all(pending.map((s) => this.buildSessionText(s)));
    for (let i = 0; i < pending.length; i += REEMBED_BATCH) {
      const slice = pending.slice(i, i + REEMBED_BATCH);
      const embeddings = await this.embeddings.embedBatch(texts.slice(i, i + REEMBED_BATCH));
      await Promise.all(slice.map((s, j) => this.updateSessionEmbedding(s.id, embeddings[j])));
    }
    this.logger.log(`Re-embedded ${pending.length} workout sessions`);
  }

  private async buildSessionText(s: PendingSession): Promise<string> {
    const sets = s.gymSessionId
      ? await this.prisma.exerciseSet.findMany({
          where: { gymSessionId: s.gymSessionId, isWarmup: false },
          select: { actualWeight: true, actualReps: true, exercise: { select: { nameCs: true } } },
        })
      : [];
    const summary = sets
      .slice(0, 10)
      .map((set) => `${set.exercise.nameCs} ${set.actualWeight}kg×${set.actualReps}`)
      .join(', ');
    const date = s.startedAt.toISOString().slice(0, 10);
    const minutes = Math.round(s.durationSeconds / 60);
    const form = Math.round(s.accuracyScore);
    return `Trénink ${date}, doba ${minutes}min, forma ${form}%. ${summary || 'video workout'}.`;
  }

  private async updateSessionEmbedding(id: string, embedding: number[]): Promise<void> {
    const vector = this.embeddings.toVectorString(embedding);
    await this.prisma.$executeRaw(Prisma.sql`
      UPDATE "WorkoutSession" SET embedding = ${vector}::vector WHERE id = ${id}
    `);
  }
}
