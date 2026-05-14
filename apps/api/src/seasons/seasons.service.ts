import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

const MONTH_NAMES_CS = [
  'Lednova', 'Unorova', 'Brezenova', 'Dubnova', 'Kvetnova', 'Cervnova',
  'Cervencova', 'Srpnova', 'Zarijova', 'Rijnova', 'Listopadova', 'Prosincova',
];

const SEASON_MISSIONS = [
  { code: 'workout_5', titleCs: '5 treninku', description: 'Complete 5 workouts', type: 'weekly', targetValue: 5, xpReward: 100, orderIndex: 0 },
  { code: 'streak_3', titleCs: '3denni streak', description: '3-day training streak', type: 'daily', targetValue: 3, xpReward: 50, orderIndex: 1 },
  { code: 'log_food_7', titleCs: 'Loguj jidlo 7 dni', description: 'Log food for 7 days', type: 'weekly', targetValue: 7, xpReward: 75, orderIndex: 2 },
  { code: 'form_75', titleCs: 'Prumerna forma 75%+', description: 'Average form score 75%+', type: 'challenge', targetValue: 75, xpReward: 150, orderIndex: 3 },
  { code: 'checkin_10', titleCs: '10 check-inu', description: '10 daily check-ins', type: 'weekly', targetValue: 10, xpReward: 100, orderIndex: 4 },
  { code: 'volume_10k', titleCs: '10,000kg objem', description: '10,000kg total volume', type: 'challenge', targetValue: 10000, xpReward: 200, orderIndex: 5 },
  { code: 'workout_15', titleCs: '15 treninku', description: 'Complete 15 workouts', type: 'challenge', targetValue: 15, xpReward: 300, orderIndex: 6 },
  { code: 'journal_5', titleCs: '5 zapisu v deniku', description: '5 journal entries', type: 'weekly', targetValue: 5, xpReward: 75, orderIndex: 7 },
  { code: 'streak_7', titleCs: '7denni streak', description: '7-day training streak', type: 'challenge', targetValue: 7, xpReward: 200, orderIndex: 8 },
  { code: 'all_missions', titleCs: 'Spln vse!', description: 'Complete all other missions', type: 'challenge', targetValue: 9, xpReward: 500, orderIndex: 9 },
];

function buildCurrentMonthSeason(now: Date = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 1));
  endDate.setUTCSeconds(endDate.getUTCSeconds() - 1);
  return {
    name: `${MONTH_NAMES_CS[month]} vyzva ${year}`,
    startDate,
    endDate,
    missions: SEASON_MISSIONS,
  };
}

@Injectable()
export class SeasonsService {
  private readonly logger = new Logger(SeasonsService.name);

  constructor(private prisma: PrismaService) {}

  async getCurrentSeason() {
    const now = new Date();
    let season = await this.prisma.season.findFirst({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
      include: { missions: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!season) {
      season = await this.seedInitialSeason();
    }

    return season;
  }

  async getCurrent(userId: string) {
    const season = await this.getCurrentSeason();
    if (!season) return { active: false };

    const progress = await this.prisma.seasonProgress.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
    });

    const completions = await this.prisma.missionCompletion.findMany({
      where: {
        userId,
        missionId: { in: season.missions.map((m) => m.id) },
      },
    });
    const completedIds = new Set(completions.map((c) => c.missionId));

    const totalPossibleXP = season.missions.reduce(
      (s, m) => s + m.xpReward,
      0,
    );
    const maxLevel = Math.ceil(totalPossibleXP / 100);

    return {
      active: true,
      season: {
        id: season.id,
        name: season.name,
        startDate: season.startDate,
        endDate: season.endDate,
      },
      joined: !!progress,
      level: progress?.level || 0,
      totalXP: progress?.totalXP || 0,
      maxLevel,
      missions: season.missions.map((m) => ({
        id: m.id,
        code: m.code,
        titleCs: m.titleCs,
        type: m.type,
        targetValue: m.targetValue,
        xpReward: m.xpReward,
        completed: completedIds.has(m.id),
      })),
    };
  }

  async joinSeason(userId: string) {
    const season = await this.getCurrentSeason();
    if (!season) throw new NotFoundException('No active season');

    return this.prisma.seasonProgress.upsert({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      update: {},
      create: { userId, seasonId: season.id },
    });
  }

  async checkMissions(userId: string) {
    const season = await this.getCurrentSeason();
    if (!season) return { newlyCompleted: [] };

    const progress = await this.prisma.seasonProgress.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
    });
    if (!progress) return { newlyCompleted: [], message: 'Not joined' };

    const existing = await this.prisma.missionCompletion.findMany({
      where: {
        userId,
        missionId: { in: season.missions.map((m) => m.id) },
      },
    });
    const completedIds = new Set(existing.map((c) => c.missionId));
    const stats = await this.loadMissionStats(userId, season);
    const newlyCompleted: Array<{ code: string; titleCs: string }> = [];
    let xpEarned = 0;

    for (const mission of season.missions) {
      if (completedIds.has(mission.id)) continue;
      const value = stats[mission.code] ?? 0;
      if (value < mission.targetValue) continue;

      await this.prisma.missionCompletion.create({
        data: { userId, missionId: mission.id },
      });
      completedIds.add(mission.id);
      xpEarned += mission.xpReward;
      newlyCompleted.push({
        code: mission.code,
        titleCs: mission.titleCs,
      });
    }

    if (xpEarned > 0) {
      const newTotalXP = progress.totalXP + xpEarned;
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      await this.prisma.seasonProgress.update({
        where: { id: progress.id },
        data: { totalXP: newTotalXP, level: newLevel },
      });
    }

    return { newlyCompleted, xpEarned };
  }

  async getHistory(userId: string) {
    const progressions = await this.prisma.seasonProgress.findMany({
      where: { userId },
      include: { season: true },
      orderBy: { createdAt: 'desc' },
    });

    return progressions.map((p) => ({
      seasonName: p.season.name,
      startDate: p.season.startDate,
      endDate: p.season.endDate,
      level: p.level,
      totalXP: p.totalXP,
    }));
  }

  private async loadMissionStats(
    userId: string,
    season: { startDate: Date; endDate: Date; missions: Array<{ id: string }> },
  ): Promise<Record<string, number>> {
    const dateFilter = {
      gte: season.startDate,
      lte: season.endDate,
    };

    const [sessions, checkIns, foodLogDays, journalCount, sets, progress, completedMissions] =
      await Promise.all([
        this.prisma.gymSession.count({
          where: { userId, startedAt: dateFilter },
        }),
        this.prisma.dailyCheckIn.count({
          where: { userId, date: dateFilter },
        }),
        this.prisma.foodLog.groupBy({
          by: ['date'],
          where: { userId, date: dateFilter },
        }),
        this.prisma.journalEntry.count({
          where: { userId, date: dateFilter },
        }),
        this.prisma.exerciseSet.findMany({
          where: {
            gymSession: { userId, startedAt: dateFilter },
            status: 'COMPLETED',
          },
        }),
        this.prisma.userProgress.findUnique({ where: { userId } }),
        this.prisma.missionCompletion.count({
          where: {
            userId,
            missionId: { in: season.missions.map((m) => m.id) },
          },
        }),
      ]);

    const totalVolume = sets.reduce(
      (s, e) => s + (e.actualReps || 0) * (e.actualWeight || 0),
      0,
    );
    const formScored = sets.filter((s) => s.formScore != null);
    const avgForm = formScored.length
      ? formScored.reduce((s, e) => s + (e.formScore || 0), 0) /
        formScored.length
      : 0;

    return {
      workout_5: sessions,
      workout_15: sessions,
      streak_3: progress?.currentStreak || 0,
      streak_7: progress?.currentStreak || 0,
      log_food_7: foodLogDays.length,
      form_75: Math.round(avgForm),
      checkin_10: checkIns,
      volume_10k: Math.round(totalVolume),
      journal_5: journalCount,
      all_missions: completedMissions,
    };
  }

  private async seedInitialSeason() {
    const tmpl = buildCurrentMonthSeason();
    // Deactivate any expired seasons before seeding to avoid two isActive=true rows.
    await this.prisma.season.updateMany({
      where: { isActive: true, endDate: { lt: tmpl.startDate } },
      data: { isActive: false },
    });
    const existing = await this.prisma.season.findFirst({
      where: { name: tmpl.name },
      include: { missions: { orderBy: { orderIndex: 'asc' } } },
    });
    if (existing) {
      if (!existing.isActive) {
        return this.prisma.season.update({
          where: { id: existing.id },
          data: { isActive: true },
          include: { missions: { orderBy: { orderIndex: 'asc' } } },
        });
      }
      return existing;
    }

    return this.prisma.season.create({
      data: {
        name: tmpl.name,
        startDate: tmpl.startDate,
        endDate: tmpl.endDate,
        isActive: true,
        missions: {
          create: tmpl.missions,
        },
      },
      include: { missions: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  // Daily 01:00 UTC: deactivate ended seasons + ensure current-month season exists.
  // Without this, getCurrentSeason() would seed a stale season once and then re-serve
  // it past its end date because `isActive: true` flag overrides the date filter on
  // the existing row. Run idempotently — no-op when current season is still valid.
  @Cron('0 1 * * *')
  async rotateSeasons() {
    const now = new Date();
    const ended = await this.prisma.season.updateMany({
      where: { isActive: true, endDate: { lt: now } },
      data: { isActive: false },
    });
    if (ended.count > 0) {
      this.logger.log(`Deactivated ${ended.count} expired season(s)`);
    }
    const current = await this.prisma.season.findFirst({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
    });
    if (!current) {
      const seeded = await this.seedInitialSeason();
      this.logger.log(`Seeded new season: ${seeded.name}`);
    }
  }
}
