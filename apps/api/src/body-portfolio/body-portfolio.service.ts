import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface CategoryScore {
  name: string;
  score: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

@Injectable()
export class BodyPortfolioService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getPortfolio(userId: string) {
    return this.cache.getOrSet(
      `body-portfolio:${userId}`,
      3600,
      () => this.computePortfolio(userId),
    );
  }

  private async computePortfolio(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      exerciseHistory,
      progress,
      recentSessions,
      olderSessions,
      checkIns,
      olderCheckIns,
    ] = await Promise.all([
      this.prisma.exerciseHistory.findMany({
        where: { userId },
        include: { exercise: true },
      }),
      this.prisma.userProgress.findUnique({ where: { userId } }),
      this.prisma.gymSession.findMany({
        where: { userId, startedAt: { gte: thirtyDaysAgo } },
        include: { exerciseSets: true },
      }),
      this.prisma.gymSession.findMany({
        where: {
          userId,
          startedAt: {
            gte: new Date(thirtyDaysAgo.getTime() - 30 * 86400000),
            lt: thirtyDaysAgo,
          },
        },
        include: { exerciseSets: true },
      }),
      this.prisma.dailyCheckIn.findMany({
        where: { userId, date: { gte: thirtyDaysAgo } },
      }),
      this.prisma.dailyCheckIn.findMany({
        where: {
          userId,
          date: {
            gte: new Date(thirtyDaysAgo.getTime() - 30 * 86400000),
            lt: thirtyDaysAgo,
          },
        },
      }),
    ]);

    const strength = this.calcStrength(exerciseHistory);
    const endurance = this.calcEndurance(progress);
    const form = this.calcForm(recentSessions);
    const nutrition = this.calcNutrition(checkIns);
    const mobility = this.calcMobility(recentSessions);

    const oldStrength = this.calcStrength(exerciseHistory, true);
    const oldForm = this.calcForm(olderSessions);
    const oldNutrition = this.calcNutrition(olderCheckIns);

    const categories: CategoryScore[] = [
      this.buildCategory('Strength', strength, oldStrength),
      this.buildCategory('Endurance', endurance, endurance * 0.9),
      this.buildCategory('Form', form, oldForm),
      this.buildCategory('Nutrition', nutrition, oldNutrition),
      this.buildCategory('Mobility', mobility, mobility * 0.95),
    ];

    const overall = Math.round(
      strength * 0.3 + endurance * 0.2 + form * 0.25 +
      nutrition * 0.15 + mobility * 0.1,
    );

    return { overall, categories, generatedAt: now.toISOString() };
  }

  private calcStrength(
    history: any[],
    _older = false,
  ): number {
    const compounds = history.filter(
      (h) => h.exercise?.category === 'compound',
    );
    if (!compounds.length) return 0;
    const avgBest =
      compounds.reduce((s, h) => s + (h.bestWeight || 0), 0) /
      compounds.length;
    return Math.min(100, Math.round(avgBest / 1.5));
  }

  private calcEndurance(progress: any): number {
    if (!progress) return 0;
    const streakPart = Math.min(50, (progress.currentStreak || 0) * 5);
    const sessionPart = Math.min(
      50,
      (progress.totalSessions || 0) * 0.5,
    );
    return Math.min(100, streakPart + sessionPart);
  }

  private calcForm(sessions: any[]): number {
    if (!sessions.length) return 0;
    const allSets = sessions.flatMap((s: any) => s.exerciseSets || []);
    if (!allSets.length) return 0;
    const avg =
      allSets.reduce(
        (s: number, set: any) => s + (set.formScore || 0),
        0,
      ) / allSets.length;
    return Math.min(100, Math.round(avg));
  }

  private calcNutrition(checkIns: any[]): number {
    if (!checkIns.length) return 0;
    const consistency = Math.min(60, checkIns.length * 2);
    const avgRecovery =
      checkIns.reduce((s, c) => {
        const sleep = Math.max(0, 10 - Math.abs((c.sleepHours || 7) - 8) * 5);
        const energy = ((c.energy || 3) / 5) * 10;
        return s + sleep + energy;
      }, 0) / checkIns.length;
    return Math.min(100, Math.round(consistency + avgRecovery));
  }

  private calcMobility(sessions: any[]): number {
    if (!sessions.length) return 30;
    const mobilityCount = sessions.filter(
      (s: any) => s.notes?.toLowerCase().includes('stretch') ||
        s.notes?.toLowerCase().includes('mobility'),
    ).length;
    return Math.min(100, 30 + mobilityCount * 15);
  }

  private buildCategory(
    name: string,
    current: number,
    previous: number,
  ): CategoryScore {
    const change = Math.round(current - previous);
    const trend = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';
    return { name, score: current, change, trend };
  }
}
