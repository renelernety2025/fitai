import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

interface ScoreBreakdown {
  consistency: number;
  strength: number;
  cardio: number;
  nutrition: number;
  recovery: number;
}

export interface FitnessScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  trend: 'improving' | 'stable' | 'declining';
  previousScore: number | null;
  percentile: number;
}

@Injectable()
export class FitnessScoreService {
  private readonly logger = new Logger(FitnessScoreService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async calculateScore(userId: string): Promise<FitnessScoreResult> {
    const cacheKey = `fitness-score:${userId}`;
    const cached = await this.cache.get<FitnessScoreResult>(cacheKey);
    if (cached) return cached;

    const breakdown = await this.computeBreakdown(userId);
    const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const previousScore = await this.getPreviousScore(userId);
    const trend = this.computeTrend(score, previousScore);
    const percentile = await this.computePercentile(score);

    await this.saveHistory(userId, score, breakdown);

    const result: FitnessScoreResult = {
      score,
      breakdown,
      trend,
      previousScore,
      percentile,
    };

    await this.cache.set(cacheKey, result, 86400);
    return result;
  }

  async getHistory(userId: string): Promise<any[]> {
    const rows = await this.prisma.fitnessScoreHistory.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return rows.map((r) => ({
      date: r.date,
      score: r.score,
      breakdown: r.breakdown,
    }));
  }

  private async computeBreakdown(
    userId: string,
  ): Promise<ScoreBreakdown> {
    const [consistency, strength, cardio, nutrition, recovery] =
      await Promise.all([
        this.computeConsistency(userId),
        this.computeStrength(userId),
        this.computeCardio(userId),
        this.computeNutrition(userId),
        this.computeRecovery(userId),
      ]);
    return { consistency, strength, cardio, nutrition, recovery };
  }

  private async computeConsistency(userId: string): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sessions = await this.prisma.workoutSession.count({
      where: { userId, startedAt: { gte: weekAgo } },
    });

    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });
    const streak = progress?.currentStreak ?? 0;

    let score = 0;
    if (sessions >= 7) score = 20;
    else if (sessions >= 5) score = 18;
    else if (sessions >= 3) score = 14;
    else if (sessions >= 1) score = 8;

    if (streak > 30) score = Math.min(20, score + 2);
    return score;
  }

  private async computeStrength(userId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const histories = await this.prisma.exerciseHistory.findMany({
      where: { userId },
      select: { bestWeight: true, date: true },
    });

    if (histories.length === 0) return 0;

    const recentPRs = histories.filter(
      (h) => h.date >= thirtyDaysAgo && (h.bestWeight ?? 0) > 0,
    );
    const prCount = recentPRs.length;

    if (prCount >= 5) return 20;
    if (prCount >= 3) return 15;
    if (prCount >= 1) return 10;
    return 4;
  }

  private async computeCardio(userId: string): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sessions = await this.prisma.workoutSession.findMany({
      where: { userId, startedAt: { gte: weekAgo } },
      select: { durationSeconds: true },
    });

    const count = sessions.length;
    const totalMinutes = sessions.reduce(
      (acc, s) => acc + (s.durationSeconds || 0) / 60,
      0,
    );

    if (count >= 3 && totalMinutes >= 90) return 20;
    if (count >= 3) return 15;
    if (count >= 1) return 10;
    return 0;
  }

  private async computeNutrition(userId: string): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const logs = await this.prisma.foodLog.groupBy({
      by: ['date'],
      where: {
        userId,
        date: { gte: weekAgo },
      },
    });

    const daysLogged = logs.length;
    if (daysLogged >= 7) return 20;
    if (daysLogged >= 4) return 14;
    if (daysLogged >= 1) return 8;
    return 0;
  }

  private async computeRecovery(userId: string): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const checkIns = await this.prisma.dailyCheckIn.findMany({
      where: { userId, date: { gte: weekAgo } },
      select: {
        sleepHours: true,
        stress: true,
        energy: true,
      },
    });

    if (checkIns.length === 0) return 0;

    const frequency = checkIns.length;
    const avgSleep =
      checkIns.reduce((a, c) => a + (c.sleepHours ?? 0), 0) /
      checkIns.length;
    const avgStress =
      checkIns.reduce((a, c) => a + (c.stress ?? 3), 0) /
      checkIns.length;

    let score = 0;
    // Frequency component (0-8)
    if (frequency >= 7) score += 8;
    else if (frequency >= 4) score += 5;
    else score += 2;

    // Sleep component (0-7): 7+ hrs is good
    if (avgSleep >= 7.5) score += 7;
    else if (avgSleep >= 6.5) score += 4;
    else score += 2;

    // Stress component (0-5): lower is better (1-5 scale)
    if (avgStress <= 2) score += 5;
    else if (avgStress <= 3) score += 3;
    else score += 1;

    return Math.min(20, score);
  }

  private async getPreviousScore(
    userId: string,
  ): Promise<number | null> {
    const prev = await this.prisma.fitnessScoreHistory.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return prev?.score ?? null;
  }

  private computeTrend(
    current: number,
    previous: number | null,
  ): 'improving' | 'stable' | 'declining' {
    if (previous === null) return 'stable';
    const diff = current - previous;
    if (diff >= 3) return 'improving';
    if (diff <= -3) return 'declining';
    return 'stable';
  }

  private async computePercentile(score: number): Promise<number> {
    const totalUsers = await this.prisma.user.count();
    if (totalUsers <= 1) return 1;

    const latest = await this.prisma.fitnessScoreHistory.findMany({
      distinct: ['userId'],
      orderBy: { date: 'desc' },
      select: { score: true },
    });

    if (latest.length === 0) return 1;

    const belowCount = latest.filter((r) => r.score < score).length;
    const pct = Math.round((belowCount / latest.length) * 100);
    return Math.max(1, 100 - pct);
  }

  private async saveHistory(
    userId: string,
    score: number,
    breakdown: ScoreBreakdown,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.fitnessScoreHistory.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      update: { score, breakdown: breakdown as any },
      create: { userId, date: today, score, breakdown: breakdown as any },
    });
  }
}
