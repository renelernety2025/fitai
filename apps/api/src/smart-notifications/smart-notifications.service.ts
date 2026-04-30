import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface SmartNotification {
  type: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  ctaLabel: string;
  ctaLink: string;
}

@Injectable()
export class SmartNotificationsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getUpcoming(userId: string): Promise<SmartNotification[]> {
    const notifications: SmartNotification[] = [];
    const now = new Date();

    const [lastSession, progress, recentCheckIn] =
      await Promise.all([
        this.prisma.gymSession.findFirst({
          where: { userId },
          orderBy: { startedAt: 'desc' },
          select: { startedAt: true },
        }),
        this.prisma.userProgress.findUnique({
          where: { userId },
          select: { currentStreak: true },
        }),
        this.prisma.dailyCheckIn.findFirst({
          where: { userId },
          orderBy: { date: 'desc' },
          select: { soreness: true, energy: true },
        }),
      ]);

    this.checkInactivity(now, lastSession, notifications);
    this.checkStreakRisk(now, lastSession, progress, notifications);
    this.checkRecoveryReady(recentCheckIn, notifications);
    await this.checkOptimalTime(userId, now, notifications);

    return notifications.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    });
  }

  private checkInactivity(
    now: Date,
    lastSession: { startedAt: Date } | null,
    notifications: SmartNotification[],
  ) {
    if (!lastSession?.startedAt) return;
    const daysSince = Math.floor(
      (now.getTime() - lastSession.startedAt.getTime()) / 86400000,
    );
    if (daysSince >= 2) {
      notifications.push({
        type: 'inactivity',
        message: `Uz ${daysSince} dny jsi netrenoval!`,
        priority: daysSince >= 5 ? 'high' : 'medium',
        ctaLabel: 'Zacit trenink',
        ctaLink: '/gym/start',
      });
    }
  }

  private checkStreakRisk(
    now: Date,
    lastSession: { startedAt: Date } | null,
    progress: { currentStreak: number } | null,
    notifications: SmartNotification[],
  ) {
    const streak = progress?.currentStreak || 0;
    if (streak <= 0 || !lastSession?.startedAt) return;
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const sessionDay = new Date(
      lastSession.startedAt.getFullYear(),
      lastSession.startedAt.getMonth(),
      lastSession.startedAt.getDate(),
    );
    if (sessionDay.getTime() < today.getTime()) {
      notifications.push({
        type: 'streak_risk',
        message: `Tvuj ${streak}-denni streak je v ohrozeni!`,
        priority: 'high',
        ctaLabel: 'Zachranit streak',
        ctaLink: '/micro-workout',
      });
    }
  }

  private checkRecoveryReady(
    recentCheckIn: { soreness: number | null; energy: number | null } | null,
    notifications: SmartNotification[],
  ) {
    if (
      recentCheckIn &&
      (recentCheckIn.soreness ?? 5) <= 2 &&
      (recentCheckIn.energy ?? 1) >= 4
    ) {
      notifications.push({
        type: 'recovery_ready',
        message: 'Tvoje svaly jsou zotavene, cas na trenink!',
        priority: 'medium',
        ctaLabel: 'Naplanovej trenink',
        ctaLink: '/gym',
      });
    }
  }

  private async checkOptimalTime(
    userId: string,
    now: Date,
    notifications: SmartNotification[],
  ) {
    const optimalHour = await this.getOptimalHour(userId);
    if (optimalHour === null) return;
    const currentHour = now.getHours();
    if (
      currentHour >= optimalHour - 1 &&
      currentHour <= optimalHour + 1
    ) {
      notifications.push({
        type: 'optimal_time',
        message: 'Ted je tvuj nejlepsi cas na trenink!',
        priority: 'low',
        ctaLabel: 'Jdem na to',
        ctaLink: '/gym/start',
      });
    }
  }

  async savePreferences(
    userId: string,
    prefs: { workoutReminder?: boolean; streakWarning?: boolean; achievements?: boolean; socialActivity?: boolean; recoveryReady?: boolean },
  ) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        workoutReminder: prefs.workoutReminder ?? true,
        streakWarning: prefs.streakWarning ?? true,
        achievements: prefs.achievements ?? true,
      },
      create: {
        userId,
        workoutReminder: prefs.workoutReminder ?? true,
        streakWarning: prefs.streakWarning ?? true,
        achievements: prefs.achievements ?? true,
      },
    });
  }

  async getSocialNotifications(userId: string, cursor?: string, limit = 20) {
    return this.prisma.socialNotification.findMany({
      where: {
        userId,
        ...(cursor && !isNaN(new Date(cursor).getTime())
          ? { createdAt: { lt: new Date(cursor) } }
          : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
      },
    });
  }

  async getUnreadCount(userId: string) {
    const cacheKey = `notif:unread:${userId}`;
    const cached = await this.cache.get<number>(cacheKey);
    if (cached !== null && cached !== undefined) {
      return { unreadCount: cached };
    }
    const count = await this.prisma.socialNotification.count({
      where: { userId, isRead: false },
    });
    await this.cache.set(cacheKey, count, 300);
    return { unreadCount: count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notif = await this.prisma.socialNotification.findUnique({
      where: { id: notificationId },
    });
    if (!notif || notif.userId !== userId) return { success: false };
    await this.prisma.socialNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    const cacheKey = `notif:unread:${userId}`;
    const current = await this.cache.get<number>(cacheKey);
    if (current !== null && current !== undefined && current > 0) {
      await this.cache.set(cacheKey, current - 1, 300);
    }
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.socialNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    await this.cache.set(`notif:unread:${userId}`, 0, 300);
    return { success: true };
  }

  private async getOptimalHour(
    userId: string,
  ): Promise<number | null> {
    const sessions = await this.prisma.gymSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 20,
      select: { startedAt: true },
    });

    if (sessions.length < 5) return null;

    const hours = sessions.map((s) => s.startedAt.getHours());
    const counts: Record<number, number> = {};
    for (const h of hours) {
      counts[h] = (counts[h] || 0) + 1;
    }

    let bestHour = 0;
    let bestCount = 0;
    for (const [h, c] of Object.entries(counts)) {
      if (c > bestCount) {
        bestCount = c;
        bestHour = Number(h);
      }
    }

    return bestHour;
  }
}
