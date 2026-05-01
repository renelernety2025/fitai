import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { LeagueTier } from '@prisma/client';

@Injectable()
export class LeaguesService {
  private readonly logger = new Logger(LeaguesService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /** Monday 00:00 UTC of the current week */
  getCurrentWeekStart(): Date {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setUTCDate(monday.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);
    return monday;
  }

  async joinLeague(userId: string) {
    const weekStart = this.getCurrentWeekStart();
    const tier = await this.determineTier(userId);

    const membership = await this.prisma.leagueMembership.upsert({
      where: { userId_weekStart: { userId, weekStart } },
      update: {},
      create: { userId, weekStart, tier },
    });

    return membership;
  }

  async getCurrent(userId: string) {
    const weekStart = this.getCurrentWeekStart();
    const membership = await this.prisma.leagueMembership.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    });

    if (!membership) {
      return { joined: false, tier: null, weeklyXP: 0 };
    }

    const leaderboard = await this.getLeaderboard(
      membership.tier,
      weekStart,
    );

    const rank = leaderboard.findIndex((m) => m.userId === userId) + 1;

    return {
      joined: true,
      tier: membership.tier,
      weeklyXP: membership.weeklyXP,
      rank: rank || null,
      promoted: membership.promoted,
      relegated: membership.relegated,
      leaderboard: leaderboard.slice(0, 30),
      totalInTier: leaderboard.length,
    };
  }

  async getLeaderboard(tier: LeagueTier | string, weekStart: Date) {
    const members = await this.prisma.leagueMembership.findMany({
      where: { weekStart, tier: tier as LeagueTier },
      orderBy: { weeklyXP: 'desc' },
      take: 30,
      include: { user: { select: { id: true, name: true } } },
    });

    return members.map((m, i) => ({
      userId: m.userId,
      name: m.user.name,
      weeklyXP: m.weeklyXP,
      rank: i + 1,
    }));
  }

  async addXP(userId: string, xp: number) {
    const weekStart = this.getCurrentWeekStart();
    try {
      await this.prisma.leagueMembership.update({
        where: { userId_weekStart: { userId, weekStart } },
        data: { weeklyXP: { increment: xp } },
      });
    } catch {
      // Not joined this week — ignore silently
    }
  }

  @Cron('0 0 * * 1') // Every Monday 00:00
  async handleWeekEnd() {
    const acquired = await this.cache.acquireLock('cron:handleWeekEnd', 82800);
    if (!acquired) return;
    try {
      this.logger.log('Processing league week end...');
      await this.processWeekEnd();
    } catch (e: any) {
      this.logger.error(`League week end failed: ${e.message}`);
    } finally {
      await this.cache.releaseLock('cron:handleWeekEnd');
    }
  }

  async processWeekEnd() {
    const weekStart = this.getCurrentWeekStart();
    const tiers: LeagueTier[] = [
      'BRONZE',
      'SILVER',
      'GOLD',
      'PLATINUM',
      'DIAMOND',
      'MASTER',
      'LEGEND',
    ];

    for (const tier of tiers) {
      const members = await this.prisma.leagueMembership.findMany({
        where: { weekStart, tier },
        orderBy: { weeklyXP: 'desc' },
      });

      if (members.length < 4) continue;

      const promoteIds = members.slice(0, 3).map((m) => m.id);
      const relegateIds = members.slice(-3).map((m) => m.id);

      await this.prisma.leagueMembership.updateMany({
        where: { id: { in: promoteIds } },
        data: { promoted: true },
      });
      await this.prisma.leagueMembership.updateMany({
        where: { id: { in: relegateIds } },
        data: { relegated: true },
      });
    }

    this.logger.log('Week-end league processing complete');
  }

  private async determineTier(userId: string): Promise<LeagueTier> {
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });
    const xp = progress?.totalXP || 0;

    if (xp >= 100000) return 'LEGEND';
    if (xp >= 40000) return 'MASTER';
    if (xp >= 10000) return 'DIAMOND';
    if (xp >= 6000) return 'PLATINUM';
    if (xp >= 2000) return 'GOLD';
    if (xp >= 500) return 'SILVER';
    return 'BRONZE';
  }
}
