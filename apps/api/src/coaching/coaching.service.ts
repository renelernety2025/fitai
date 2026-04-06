import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ElevenLabsService } from './elevenlabs.service';
import { buildCoachingSystemPrompt, buildCoachingUserMessage, type CoachingContext } from './coaching-prompt';
import { checkSafetyRules } from './safety-rules';

interface FeedbackRequest {
  userId: string;
  sessionType: 'video' | 'gym';
  sessionId: string;
  exerciseName: string;
  currentPhase: string;
  formScore: number;
  repCount: number;
  targetReps: number;
  jointAngles: { joint: string; angle: number }[];
  recentErrors: string[];
}

@Injectable()
export class CoachingService {
  private readonly logger = new Logger(CoachingService.name);

  constructor(
    private prisma: PrismaService,
    private elevenLabs: ElevenLabsService,
  ) {}

  async generateFeedback(req: FeedbackRequest) {
    // 1. Safety check first
    const safetyAlerts = checkSafetyRules(req.jointAngles, req.exerciseName);

    // Log critical safety events
    for (const alert of safetyAlerts.filter((a) => a.severity === 'critical')) {
      await this.prisma.safetyEvent.create({
        data: {
          userId: req.userId,
          sessionType: req.sessionType,
          sessionId: req.sessionId,
          jointName: alert.joint,
          measuredAngle: alert.measuredAngle,
          safeMin: 0,
          safeMax: 0,
          exerciseName: req.exerciseName,
          severity: alert.severity,
        },
      }).catch(() => {});
    }

    // If critical safety, return immediately without Claude
    if (safetyAlerts.some((a) => a.severity === 'critical')) {
      const msg = safetyAlerts.find((a) => a.severity === 'critical')!.messageCs;
      const audio = await this.elevenLabs.synthesize(msg);
      return {
        message: msg,
        priority: 'safety' as const,
        audioBase64: audio?.audioBase64 ?? null,
      };
    }

    // 2. Build coaching context
    const ctx = await this.buildContext(req, safetyAlerts.map((a) => a.messageCs));

    // 3. Generate with Claude
    const message = await this.callClaude(ctx);

    // 4. Determine priority
    let priority: 'safety' | 'correction' | 'encouragement' | 'info' = 'info';
    if (safetyAlerts.length > 0) priority = 'safety';
    else if (req.formScore < 60) priority = 'correction';
    else if (req.formScore >= 80) priority = 'encouragement';
    else priority = 'correction';

    // 5. Synthesize speech
    const audio = await this.elevenLabs.synthesize(message);

    // 6. Log message
    await this.logMessage(req.userId, req.sessionType, req.sessionId, message, priority);

    return {
      message,
      priority,
      audioBase64: audio?.audioBase64 ?? null,
    };
  }

  async logSafetyEvent(data: {
    userId: string;
    sessionType: string;
    sessionId: string;
    jointName: string;
    measuredAngle: number;
    exerciseName: string;
    severity: string;
  }) {
    return this.prisma.safetyEvent.create({
      data: { ...data, safeMin: 0, safeMax: 0 },
    });
  }

  async precache() {
    return this.elevenLabs.precacheCommonPhrases();
  }

  async synthesize(text: string) {
    const audio = await this.elevenLabs.synthesize(text);
    return { text, audioBase64: audio?.audioBase64 ?? null, fallbackToWebSpeech: !audio };
  }

  private async buildContext(
    req: FeedbackRequest,
    safetyAlerts: string[],
  ): Promise<CoachingContext> {
    const user = await this.prisma.user.findUnique({ where: { id: req.userId } });
    const progress = await this.prisma.userProgress.findUnique({ where: { userId: req.userId } });

    // Get weak joints from safety events
    const recentSafety = await this.prisma.safetyEvent.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const jointCounts = new Map<string, number>();
    recentSafety.forEach((e) => jointCounts.set(e.jointName, (jointCounts.get(e.jointName) || 0) + 1));
    const weakJoints = [...jointCounts.entries()]
      .filter(([, count]) => count >= 3)
      .map(([joint]) => joint);

    // Get recent coaching messages
    const recentMessages = await this.prisma.coachingMessage.findMany({
      where: { coachingSession: { userId: req.userId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const daysSince = progress?.lastWorkoutDate
      ? Math.floor((Date.now() - progress.lastWorkoutDate.getTime()) / 86400000)
      : null;

    return {
      userName: user?.name ?? 'Cvičenci',
      level: progress ? String(progress.totalXP >= 2000 ? 'Legenda' : progress.totalXP >= 1000 ? 'Mistr' : progress.totalXP >= 500 ? 'Expert' : progress.totalXP >= 200 ? 'Pokročilý' : 'Začátečník') : 'Začátečník',
      totalXP: progress?.totalXP ?? 0,
      currentStreak: progress?.currentStreak ?? 0,
      daysSinceLastWorkout: daysSince,
      weakJoints,
      currentExercise: req.exerciseName,
      currentPhase: req.currentPhase,
      recentFormScores: [req.formScore],
      repCount: req.repCount,
      targetReps: req.targetReps,
      safetyAlerts,
      recentMessages: recentMessages.map((m) => m.content).reverse(),
    };
  }

  private async callClaude(ctx: CoachingContext): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      this.logger.warn('No ANTHROPIC_API_KEY — using static feedback');
      return this.getStaticFeedback(ctx);
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk').default;
      const client = new Anthropic({ apiKey });

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        system: buildCoachingSystemPrompt(ctx),
        messages: [{ role: 'user', content: buildCoachingUserMessage(ctx) }],
      });

      const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
      return text || this.getStaticFeedback(ctx);
    } catch (err: any) {
      this.logger.error(`Claude coaching failed: ${err.message}`);
      return this.getStaticFeedback(ctx);
    }
  }

  private getStaticFeedback(ctx: CoachingContext): string {
    if (ctx.safetyAlerts.length > 0) return ctx.safetyAlerts[0];
    if (ctx.recentFormScores[0] >= 80) {
      const praises = ['Výborně!', 'Skvělá forma!', 'Perfektní!', 'Super práce!', 'Tak držet!'];
      return praises[Math.floor(Math.random() * praises.length)];
    }
    if (ctx.recentFormScores[0] >= 50) {
      return 'Soustřeď se na formu.';
    }
    return 'Zkontroluj pozici, forma potřebuje zlepšit.';
  }

  private async logMessage(userId: string, sessionType: string, sessionId: string, content: string, priority: string) {
    let session = await this.prisma.coachingSession.findFirst({
      where: { userId, sessionType, sessionId },
    });
    if (!session) {
      session = await this.prisma.coachingSession.create({
        data: { userId, sessionType, sessionId },
      });
    }

    await this.prisma.coachingMessage.create({
      data: {
        coachingSessionId: session.id,
        role: 'assistant',
        content,
        priority,
      },
    });

    await this.prisma.coachingSession.update({
      where: { id: session.id },
      data: { messagesCount: { increment: 1 } },
    });
  }
}
