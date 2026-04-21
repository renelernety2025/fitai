import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertJournalDto } from './dto/upsert-journal.dto';

export interface DayData {
  date: string;
  journalEntry: any | null;
  gymSession: any | null;
}

export interface Milestone {
  type: string;
  label: string;
  date: string | null;
  achieved: boolean;
}

/** In-memory cache for monthly AI summaries (24h TTL). */
const summaryCache = new Map<
  string,
  { data: string; expiresAt: number }
>();

@Injectable()
export class WorkoutJournalService {
  private readonly logger = new Logger(WorkoutJournalService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private prisma: PrismaService) {
    this.bucket =
      process.env.S3_BUCKET_ASSETS || 'fitai-assets-production';
    const region = process.env.AWS_REGION || 'eu-west-1';
    this.s3 = new S3Client({
      region,
      requestChecksumCalculation: 'WHEN_REQUIRED' as any,
      responseChecksumValidation: 'WHEN_REQUIRED' as any,
    } as any);
  }

  // ── getMonth ──

  async getMonth(
    userId: string,
    month: string,
  ): Promise<{ days: any[] }> {
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException(
        'Invalid month format. Use YYYY-MM.',
      );
    }
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const [entries, sessions] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where: {
          userId,
          date: { gte: start, lt: end },
        },
        include: { photos: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.gymSession.findMany({
        where: {
          userId,
          startedAt: { gte: start, lt: end },
        },
        include: {
          exerciseSets: {
            include: { exercise: { select: { name: true, nameCs: true } } },
            orderBy: { setNumber: 'asc' },
          },
          workoutPlan: { select: { name: true, nameCs: true } },
        },
        orderBy: { startedAt: 'asc' },
      }),
    ]);

    const entryByDate = new Map<string, any>();
    for (const e of entries) {
      entryByDate.set(toDateStr(e.date), e);
    }

    const sessionByDate = new Map<string, any>();
    for (const s of sessions) {
      const key = toDateStr(s.startedAt);
      if (!sessionByDate.has(key)) {
        sessionByDate.set(key, s);
      }
    }

    const allDates = new Set([
      ...entryByDate.keys(),
      ...sessionByDate.keys(),
    ]);

    const days = [...allDates]
      .sort()
      .map((date) => {
        const raw = sessionByDate.get(date);
        let gymSession = null;
        if (raw) {
          // Aggregate exercise sets into summary per exercise
          const exMap = new Map<string, { exerciseName: string; sets: number; totalReps: number; avgWeight: number; avgFormScore: number; avgRpe: number }>();
          for (const s of raw.exerciseSets || []) {
            const name = s.exercise?.nameCs || s.exercise?.name || 'Unknown';
            const existing = exMap.get(name);
            if (existing) {
              existing.sets++;
              existing.totalReps += s.actualReps || 0;
              existing.avgWeight = (existing.avgWeight * (existing.sets - 1) + (s.actualWeight || 0)) / existing.sets;
              existing.avgFormScore = (existing.avgFormScore * (existing.sets - 1) + (s.formScore || 0)) / existing.sets;
              existing.avgRpe = (existing.avgRpe * (existing.sets - 1) + (s.rpe || 0)) / existing.sets;
            } else {
              exMap.set(name, {
                exerciseName: name,
                sets: 1,
                totalReps: s.actualReps || 0,
                avgWeight: s.actualWeight || 0,
                avgFormScore: s.formScore || 0,
                avgRpe: s.rpe || 0,
              });
            }
          }
          gymSession = {
            id: raw.id,
            startedAt: raw.startedAt,
            completedAt: raw.completedAt,
            totalReps: raw.totalReps,
            averageFormScore: raw.averageFormScore,
            durationSeconds: raw.durationSeconds,
            coachPersonality: raw.coachPersonality,
            workoutPlanName: raw.workoutPlan?.nameCs || raw.workoutPlan?.name || null,
            exerciseSets: [...exMap.values()],
          };
        }
        return {
          date,
          entry: entryByDate.get(date) ?? null,
          gymSession,
        };
      });
    return { days };
  }

  // ── upsertEntry ──

  async upsertEntry(
    userId: string,
    dateStr: string,
    dto: UpsertJournalDto,
  ) {
    const date = new Date(dateStr);

    if (dto.gymSessionId) {
      await this.verifySessionOwnership(
        userId,
        dto.gymSessionId,
      );
    }

    return this.prisma.journalEntry.upsert({
      where: {
        userId_date: { userId, date },
      },
      update: {
        gymSessionId: dto.gymSessionId ?? undefined,
        notes: dto.notes ?? undefined,
        rating: dto.rating ?? undefined,
        mood: (dto.mood as any) ?? undefined,
        tags: dto.tags ?? undefined,
        measurements: dto.measurements
          ? (dto.measurements as any)
          : undefined,
      },
      create: {
        userId,
        date,
        gymSessionId: dto.gymSessionId ?? null,
        notes: dto.notes ?? null,
        rating: dto.rating ?? null,
        mood: dto.mood as any ?? null,
        tags: dto.tags ?? [],
        measurements: dto.measurements
          ? (dto.measurements as any)
          : null,
      },
      include: { photos: true },
    });
  }

  // ── getPhotoUploadUrl ──

  async getPhotoUploadUrl(
    userId: string,
    dateStr: string,
    contentType: string,
  ) {
    const date = new Date(dateStr);
    const photoId = randomUUID();
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const s3Key = `journal-photos/${userId}/${photoId}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: contentType,
      Metadata: { userId },
    });
    const uploadUrl = await getSignedUrl(
      this.s3 as any,
      command as any,
      { expiresIn: 900 },
    );

    // Ensure journal entry exists for this date
    const entry = await (
      this.prisma as any
    ).journalEntry.upsert({
      where: { userId_date: { userId, date } },
      update: {},
      create: {
        userId,
        date,
        tags: [],
      },
    });

    await this.prisma.journalPhoto.create({
      data: {
        id: photoId,
        journalEntryId: entry.id,
        s3Key,
      },
    });

    return { uploadUrl, photoId, s3Key };
  }

  // ── deletePhoto ──

  async deletePhoto(userId: string, photoId: string) {
    const photo = await (
      this.prisma as any
    ).journalPhoto.findUnique({
      where: { id: photoId },
      include: { journalEntry: true },
    });
    if (!photo) throw new NotFoundException('Photo not found');
    if (photo.journalEntry.userId !== userId) {
      throw new ForbiddenException('Not your photo');
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: photo.s3Key,
        }),
      );
    } catch (e: any) {
      this.logger.warn(
        `S3 delete failed (removing DB row anyway): ${e.message}`,
      );
    }

    await this.prisma.journalPhoto.delete({
      where: { id: photoId },
    });
    return { deleted: true };
  }

  // ── getMonthlySummary ──

  async getMonthlySummary(userId: string, month: string) {
    const cacheKey = `journal-summary:${userId}:${month}`;
    const cached = summaryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { summary: cached.data, cached: true };
    }

    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const [entries, sessions] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where: { userId, date: { gte: start, lt: end } },
      }),
      this.prisma.gymSession.findMany({
        where: { userId, startedAt: { gte: start, lt: end } },
      }),
    ]);

    const summary = await this.buildMonthlySummary(
      entries,
      sessions,
      month,
    );

    summaryCache.set(cacheKey, {
      data: summary,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return { summary, cached: false };
  }

  // ── getMilestones ──

  async getMilestones(userId: string): Promise<Milestone[]> {
    const [progress, sessionCount, entryCount] =
      await Promise.all([
        this.prisma.userProgress.findUnique({
          where: { userId },
        }),
        this.prisma.gymSession.count({
          where: { userId },
        }),
        this.prisma.journalEntry.count({
          where: { userId },
        }),
      ]);

    const milestones: Milestone[] = [];
    const streak = progress?.currentStreak ?? 0;
    const totalSessions = progress?.totalSessions ?? 0;

    const sessionThresholds = [10, 50, 100, 250, 500];
    for (const t of sessionThresholds) {
      milestones.push({
        type: 'sessions',
        label: `${t}. trenink`,
        date: null,
        achieved: totalSessions >= t,
      });
    }

    const streakThresholds = [7, 14, 30, 60, 100];
    for (const t of streakThresholds) {
      milestones.push({
        type: 'streak',
        label: `${t}denni streak`,
        date: null,
        achieved: streak >= t,
      });
    }

    const journalThresholds = [10, 50, 100];
    for (const t of journalThresholds) {
      milestones.push({
        type: 'journal',
        label: `${t}. zapis v deniku`,
        date: null,
        achieved: entryCount >= t,
      });
    }

    return milestones;
  }

  // ── generateAiInsight ──

  async generateAiInsight(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const entry = await (
      this.prisma as any
    ).journalEntry.findUnique({
      where: { userId_date: { userId, date } },
      include: { photos: true },
    });
    if (!entry) {
      throw new NotFoundException(
        'No journal entry for this date',
      );
    }
    if (entry.aiInsight) {
      return { insight: entry.aiInsight, generated: false };
    }

    const weekAgo = new Date(date);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentEntries = await (
      this.prisma as any
    ).journalEntry.findMany({
      where: {
        userId,
        date: { gte: weekAgo, lte: date },
      },
      orderBy: { date: 'asc' },
    });

    const insight = await this.buildDayInsight(
      entry,
      recentEntries,
    );

    await this.prisma.journalEntry.update({
      where: { id: entry.id },
      data: { aiInsight: insight },
    });

    return { insight, generated: true };
  }

  // ── private helpers ──

  private async verifySessionOwnership(
    userId: string,
    sessionId: string,
  ) {
    const session = await (
      this.prisma as any
    ).gymSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Gym session not found');
    }
    if (session.userId !== userId) {
      throw new ForbiddenException('Not your gym session');
    }
  }

  private async buildMonthlySummary(
    entries: any[],
    sessions: any[],
    month: string,
  ): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return this.rulesSummary(entries, sessions, month);
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });

      const stats = {
        month,
        journalDays: entries.length,
        workoutDays: sessions.length,
        avgRating: avgOf(entries, 'rating'),
        moods: entries
          .filter((e: any) => e.mood)
          .map((e: any) => e.mood),
        tags: entries.flatMap((e: any) => e.tags ?? []),
      };

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Jsi fitness trenér. Shrň měsíc tréninku v češtině (3-4 věty). Data: ${JSON.stringify(stats)}. Buď konkrétní, motivační. Vrať POUZE text shrnutí, žádný JSON.`,
          },
        ],
      });

      const text =
        response.content[0].type === 'text'
          ? response.content[0].text
          : '';
      return text.trim() || this.rulesSummary(entries, sessions, month);
    } catch (e: any) {
      this.logger.error(
        `Claude monthly summary failed: ${e.message}`,
      );
      return this.rulesSummary(entries, sessions, month);
    }
  }

  private rulesSummary(
    entries: any[],
    sessions: any[],
    month: string,
  ): string {
    const parts: string[] = [];
    parts.push(
      `V mesici ${month} jsi trenoval/a ${sessions.length}x`,
    );
    if (entries.length > 0) {
      parts.push(`a zapsal/a ${entries.length} zaznamu`);
    }
    const avg = avgOf(entries, 'rating');
    if (avg > 0) {
      parts.push(
        `Prumerne hodnoceni treninku: ${avg.toFixed(1)}/5`,
      );
    }
    return parts.join('. ') + '.';
  }

  private async buildDayInsight(
    entry: any,
    recentEntries: any[],
  ): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return this.rulesDayInsight(entry);
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });

      const context = {
        date: toDateStr(entry.date),
        notes: entry.notes,
        rating: entry.rating,
        mood: entry.mood,
        tags: entry.tags,
        recentRatings: recentEntries
          .filter((e: any) => e.rating)
          .map((e: any) => e.rating),
      };

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Jsi fitness trenér. Na základě dat z deníku napiš 1-2 věty o tomto dni v češtině. Data: ${JSON.stringify(context)}. Buď konkrétní, motivační. Vrať POUZE text.`,
          },
        ],
      });

      const text =
        response.content[0].type === 'text'
          ? response.content[0].text
          : '';
      return text.trim() || this.rulesDayInsight(entry);
    } catch (e: any) {
      this.logger.error(
        `Claude day insight failed: ${e.message}`,
      );
      return this.rulesDayInsight(entry);
    }
  }

  private rulesDayInsight(entry: any): string {
    if (entry.rating && entry.rating >= 4) {
      return 'Skvely trenink! Pokracuj v nasazenem tempu.';
    }
    if (entry.mood === 'TIRED' || entry.mood === 'BAD') {
      return 'Tezsi den, ale dulezite je ze jsi to nevzdal/a.';
    }
    return 'Dalsi den, dalsi krok k cili. Tak drzet!';
  }
}

// ── util ──

function toDateStr(d: Date | string): string {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

function avgOf(arr: any[], field: string): number {
  const vals = arr
    .map((a) => a[field])
    .filter((v) => typeof v === 'number');
  if (vals.length === 0) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}
