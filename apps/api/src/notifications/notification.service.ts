import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private vapidConfigured = false;

  constructor(private prisma: PrismaService) {
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

  async sendStreakReminders() {
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

      const payload = {
        title: `🔥 Série ${progress.currentStreak} dní!`,
        body: `Neztrať sérii, ${progress.user.name}! Udělej dnes alespoň krátký trénink.`,
      };
      await this.sendToUser(progress.userId, { ...payload, url: '/dashboard', tag: 'streak-reminder' });
      await this.sendExpoToUser(progress.userId, payload);
      sent++;
    }

    return { sent, total: usersWithStreaks.length };
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
