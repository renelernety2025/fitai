import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AiInsightsService } from '../ai-insights/ai-insights.service';
import { EmailService } from '../email/email.service';
import { CacheService } from '../cache/cache.service';
import * as webpush from 'web-push';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private vapidConfigured = false;

  constructor(
    private prisma: PrismaService,
    private aiInsights: AiInsightsService,
    private emailService: EmailService,
    private cache: CacheService,
  ) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (publicKey && privateKey) {
      webpush.setVapidDetails('mailto:admin@fitai.com', publicKey, privateKey);
      this.vapidConfigured = true;
      this.logger.log('VAPID keys configured');
    } else {
      this.logger.warn('No VAPID keys — push notifications disabled. Generate with: npx web-push generate-vapid-keys');
    }
  }

  getVapidPublicKey() {
    return { publicKey: process.env.VAPID_PUBLIC_KEY || '' };
  }

  async subscribe(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    return this.prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint: subscription.endpoint } },
      update: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  }

  async sendToUser(userId: string, payload: { title: string; body: string; url?: string; tag?: string }) {
    if (!this.vapidConfigured) {
      this.logger.warn(`Push not configured — skipping notification to ${userId}`);
      return { sent: 0 };
    }

    // Check quiet hours
    const prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (prefs) {
      const hour = new Date().getHours();
      if (prefs.quietHoursStart <= prefs.quietHoursEnd
        ? hour >= prefs.quietHoursStart && hour < prefs.quietHoursEnd
        : hour >= prefs.quietHoursStart || hour < prefs.quietHoursEnd
      ) {
        return { sent: 0, reason: 'quiet_hours' };
      }
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({ where: { userId } });
    let sent = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    }

    return { sent };
  }

  /** Runs daily at 19:00 Prague time (17:00 UTC). */
  @Cron('0 17 * * *')
  async sendStreakReminders() {
    const acquired = await this.cache.acquireLock('cron:sendStreakReminders', 82800);
    if (!acquired) return;
    try {
      // Find users who haven't worked out today but have active streaks
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usersWithStreaks = await this.prisma.userProgress.findMany({
        where: {
          currentStreak: { gte: 2 },
          lastWorkoutDate: { lt: today },
        },
        include: { user: true },
      });

      let sent = 0;
      for (const progress of usersWithStreaks) {
        const prefs = await this.prisma.notificationPreference.findUnique({
          where: { userId: progress.userId },
        });
        if (prefs && !prefs.streakWarning) continue;

        const payload = buildStreakFearMessage(
          progress.user.name || 'trenere',
          progress.currentStreak,
        );
        await this.sendToUser(progress.userId, { ...payload, url: '/dashboard', tag: 'streak-reminder' });
        await this.sendExpoToUser(progress.userId, payload);
        sent++;
      }

      return { sent, total: usersWithStreaks.length };
    } finally {
      await this.cache.releaseLock('cron:sendStreakReminders');
    }
  }

  /** Register Expo push token for mobile push notifications. */
  async registerExpoPushToken(userId: string, token: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    });
  }

  /** Send a notification to a user via Expo Push API (mobile only). */
  async sendExpoToUser(userId: string, payload: { title: string; body: string; data?: any }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.expoPushToken) return { sent: 0, reason: 'no_token' };

    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          to: user.expoPushToken,
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: 'default',
        }),
      });
      const json: any = await res.json();
      if (json?.data?.status === 'error') {
        this.logger.warn(`Expo push error: ${JSON.stringify(json.data)}`);
        // Drop invalid token
        if (json.data.details?.error === 'DeviceNotRegistered') {
          await this.prisma.user.update({ where: { id: userId }, data: { expoPushToken: null } });
        }
        return { sent: 0, error: json.data };
      }
      return { sent: 1 };
    } catch (e: any) {
      this.logger.error(`Expo push failed: ${e.message}`);
      return { sent: 0, error: e.message };
    }
  }

  /** Runs daily at 7:00 AM Prague time (5:00 UTC). */
  @Cron('0 5 * * *')
  async sendMorningBriefs() {
    const acquired = await this.cache.acquireLock('cron:sendMorningBriefs', 82800);
    if (!acquired) return;
    try {
      this.logger.log('[MORNING BRIEF] Cron triggered');
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 14);

      const activeUsers = await this.prisma.user.findMany({
        where: {
          sessions: { some: { completedAt: { gte: fourteenDaysAgo } } },
        },
        select: { id: true, name: true, email: true },
        take: 100,
      });

      let sent = 0;
      for (const user of activeUsers) {
        try {
          await this.sendMorningBriefToUser(user);
          sent++;
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          this.logger.warn(`Morning brief failed for ${user.id}: ${msg}`);
        }
      }
      this.logger.log(`[MORNING BRIEF] Sent ${sent}/${activeUsers.length}`);
    } finally {
      await this.cache.releaseLock('cron:sendMorningBriefs');
    }
  }

  private async sendMorningBriefToUser(user: {
    id: string;
    name: string;
    email: string;
  }) {
    const prefs = await this.prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    });
    if (prefs && !prefs.workoutReminder) return;

    const { brief } = await this.aiInsights.getDailyBrief(user.id);
    const firstName = user.name?.split(' ')[0] || 'Athlete';
    const recoveryLabel =
      brief.recoveryScore >= 75
        ? 'zotavene'
        : brief.recoveryScore >= 50
        ? 'v norme'
        : 'unavene';
    const body = `Dobre rano, ${firstName}! Dnes doporucuji ${brief.workout.title}. Tve svaly jsou ${recoveryLabel}. ${brief.motivationalHook}`;

    const payload = { title: 'FitAI Morning Brief', body };

    await this.sendToUser(user.id, {
      ...payload,
      url: '/dashboard',
      tag: 'morning-brief',
    });
    await this.sendExpoToUser(user.id, payload);

    if (prefs?.workoutReminder !== false) {
      await this.emailService.sendMorningBrief(
        user.email,
        firstName,
        brief.workout.title,
        recoveryLabel,
        brief.motivationalHook,
      );
    }
  }

  async getPreferences(userId: string) {
    let prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (!prefs) {
      prefs = await this.prisma.notificationPreference.create({ data: { userId } });
    }
    return prefs;
  }

  async updatePreferences(userId: string, data: {
    workoutReminder?: boolean;
    streakWarning?: boolean;
    achievements?: boolean;
    quietHoursStart?: number;
    quietHoursEnd?: number;
  }) {
    await this.getPreferences(userId);
    return this.prisma.notificationPreference.update({ where: { userId }, data });
  }
}

/** Build escalating streak fear notification based on streak length. */
function buildStreakFearMessage(
  name: string,
  streak: number,
): { title: string; body: string } {
  if (streak >= 30) {
    return {
      title: `${streak} dni v serii! Neznic to!`,
      body: `${name}, ${streak} dni tvrdé prace. Jedna absence a vsechno je pryc. Dnes to nevzdavej!`,
    };
  }
  if (streak >= 14) {
    return {
      title: `${streak} dni! Neopovazuj se zastavit!`,
      body: `${name}, uz ${streak} dni v kuse. Staci 5 minut a serie pokracuje.`,
    };
  }
  if (streak >= 7) {
    return {
      title: `${streak} dni v serii — zitra to ztratís!`,
      body: `${name}, jsi v tahu! Neztrac momentum. Kratky trenink staci.`,
    };
  }
  return {
    title: `Serie ${streak} dni — neztrac ji!`,
    body: `${name}, neznic serii! Udelej dnes aspon kratky trenink.`,
  };
}
