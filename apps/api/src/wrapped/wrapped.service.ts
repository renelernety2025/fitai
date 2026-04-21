import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class WrappedService {
  private readonly logger = new Logger(WrappedService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getWrapped(
    userId: string,
    period: 'monthly' | 'yearly',
    month?: string,
  ) {
    const { start, end, label } = this.buildDateRange(period, month);
    const cacheKey = `wrapped:${userId}:${label}`;

    return this.cache.getOrSet(cacheKey, 86400, () =>
      this.computeWrapped(userId, start, end, label),
    );
  }

  private buildDateRange(
    period: 'monthly' | 'yearly',
    month?: string,
  ): { start: Date; end: Date; label: string } {
    if (period === 'monthly') {
      if (!month) throw new BadRequestException('month required for monthly');
      const start = new Date(`${month}-01T00:00:00Z`);
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);
      return { start, end, label: `monthly-${month}` };
    }
    const now = new Date();
    const start = new Date(now);
    start.setUTCFullYear(start.getUTCFullYear() - 1);
    return { start, end: now, label: `yearly-${now.getUTCFullYear()}` };
  }

  private async computeWrapped(
    userId: string,
    start: Date,
    end: Date,
    label: string,
  ) {
    const dateFilter = { gte: start, lt: end };

    const [sessions, sets, checkIns, foodLogs, progress] =
      await Promise.all([
        this.prisma.gymSession.findMany({
          where: { userId, startedAt: dateFilter },
        }),
        this.prisma.exerciseSet.findMany({
          where: {
            gymSession: { userId, startedAt: dateFilter },
            status: 'COMPLETED',
          },
          include: { exercise: true },
        }),
        this.prisma.dailyCheckIn.findMany({
          where: { userId, date: dateFilter },
        }),
        this.prisma.foodLog.count({
          where: { userId, date: dateFilter },
        }),
        this.prisma.userProgress.findUnique({ where: { userId } }),
      ]);

    const totalWorkouts = sessions.length;
    const totalSeconds = sessions.reduce(
      (sum, s) => sum + (s.durationSeconds || 0),
      0,
    );
    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
    const totalReps = sets.reduce(
      (sum, s) => sum + (s.actualReps || 0),
      0,
    );
    const totalVolume = sets.reduce(
      (sum, s) => sum + (s.actualReps || 0) * (s.actualWeight || 0),
      0,
    );

    const setsWithExercise = sets as Array<
      (typeof sets)[number] & { exercise: { name: string } }
    >;
    const topExercises = this.computeTopExercises(setsWithExercise);
    const avgFormScore = this.computeAvgForm(sets);
    const prCount = await this.computePrCount(userId, start, end);
    const mostActiveDay = this.computeMostActiveDay(sessions);
    const avgRecoveryScore = this.computeAvgRecovery(checkIns);
    const aiSummary = await this.generateAiSummary(
      totalWorkouts,
      totalHours,
      totalVolume,
      prCount,
    );

    return {
      period: label,
      totalWorkouts,
      totalHours,
      totalVolume: Math.round(totalVolume),
      totalReps,
      topExercises,
      longestStreak: progress?.longestStreak || 0,
      totalXP: progress?.totalXP || 0,
      avgFormScore,
      prCount,
      totalCheckIns: checkIns.length,
      avgRecoveryScore,
      mostActiveDay,
      aiSummary,
    };
  }

  private computeTopExercises(
    sets: Array<{ exercise: { name: string } }>,
  ): Array<{ name: string; count: number }> {
    const freq = new Map<string, number>();
    for (const s of sets) {
      const name = s.exercise?.name || 'Unknown';
      freq.set(name, (freq.get(name) || 0) + 1);
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }

  private computeAvgForm(
    sets: Array<{ formScore?: number | null }>,
  ): number {
    const scored = sets.filter((s) => s.formScore != null);
    if (!scored.length) return 0;
    const sum = scored.reduce((s, e) => s + (e.formScore || 0), 0);
    return Math.round(sum / scored.length);
  }

  private async computePrCount(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    const histories = await this.prisma.exerciseHistory.findMany({
      where: { userId, date: { gte: start, lt: end } },
    });
    const maxByExercise = new Map<string, number>();
    for (const h of histories) {
      const current = maxByExercise.get(h.exerciseId) || 0;
      if ((h.bestWeight || 0) > current) {
        maxByExercise.set(h.exerciseId, h.bestWeight || 0);
      }
    }
    return maxByExercise.size;
  }

  private computeMostActiveDay(
    sessions: Array<{ startedAt: Date }>,
  ): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = new Array(7).fill(0);
    for (const s of sessions) {
      counts[new Date(s.startedAt).getUTCDay()]++;
    }
    const maxIdx = counts.indexOf(Math.max(...counts));
    return days[maxIdx];
  }

  private computeAvgRecovery(
    checkIns: Array<{
      energy?: number | null;
      soreness?: number | null;
      sleepQuality?: number | null;
    }>,
  ): number {
    if (!checkIns.length) return 0;
    let sum = 0;
    for (const c of checkIns) {
      const energy = (c.energy || 3) * 20;
      const soreness = (5 - (c.soreness || 3)) * 20;
      const sleep = (c.sleepQuality || 3) * 20;
      sum += Math.round((energy + soreness + sleep) / 3);
    }
    return Math.round(sum / checkIns.length);
  }

  private async generateAiSummary(
    workouts: number,
    hours: number,
    volume: number,
    prs: number,
  ): Promise<string> {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return this.fallbackSummary(workouts, hours);

    try {
      const prompt = `You are a Czech fitness coach. Write 2-3 motivational sentences summarizing this period: ${workouts} workouts, ${hours}h, ${Math.round(volume)}kg volume, ${prs} PRs. In Czech, max 200 chars.`;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      return data?.content?.[0]?.text || this.fallbackSummary(workouts, hours);
    } catch (e: any) {
      this.logger.warn(`AI summary failed: ${e.message}`);
      return this.fallbackSummary(workouts, hours);
    }
  }

  private fallbackSummary(workouts: number, hours: number): string {
    if (workouts === 0) return 'Zacni trenat a uvidis vysledky!';
    return `Skvela prace! ${workouts} treninku za ${hours}h. Pokracuj dal!`;
  }
}
