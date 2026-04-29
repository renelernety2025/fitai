import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import {
  welcomeTemplate,
  passwordResetTemplate,
  weeklyDigestTemplate,
  streakWarningTemplate,
  achievementUnlockedTemplate,
} from './templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: any = null;

  constructor(private prisma: PrismaService) {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Resend } = require('resend');
        this.resend = new Resend(key);
        this.logger.log('Resend email provider initialized');
      } catch {
        this.logger.warn(
          'Resend SDK not installed, using logger fallback',
        );
      }
    } else {
      this.logger.warn(
        'RESEND_API_KEY not set, using logger fallback',
      );
    }
  }

  async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'FitAI <noreply@fitai.bfevents.cz>',
          to,
          subject,
          html,
        });
        this.logger.log(`Email sent to ${to}: ${subject}`);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : String(err);
        this.logger.error(`Resend failed: ${msg}`);
      }
    } else {
      this.logger.log(
        `[MOCK EMAIL] To: ${to} | Subject: ${subject}`,
      );
    }
  }

  async sendWelcome(
    email: string,
    name: string,
  ): Promise<void> {
    await this.send(
      email,
      'Welcome to FitAI',
      welcomeTemplate(name),
    );
  }

  async sendPasswordReset(
    email: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `https://fitai.bfevents.cz/reset-password?token=${token}`;
    await this.send(
      email,
      'Reset your FitAI password',
      passwordResetTemplate(resetUrl),
    );
  }

  async sendWeeklyDigest(
    email: string,
    name: string,
    stats: {
      workouts?: number;
      totalMinutes?: number;
      streak?: number;
      xp?: number;
    },
  ): Promise<void> {
    await this.send(
      email,
      'Your weekly FitAI recap',
      weeklyDigestTemplate(name, stats),
    );
  }

  async sendStreakWarning(
    email: string,
    name: string,
    streak: number,
  ): Promise<void> {
    await this.send(
      email,
      `Your ${streak}-day streak is at risk!`,
      streakWarningTemplate(name, streak),
    );
  }

  async sendAchievementUnlocked(
    email: string,
    name: string,
    achievement: string,
  ): Promise<void> {
    await this.send(
      email,
      `Achievement unlocked: ${achievement}`,
      achievementUnlockedTemplate(name, achievement),
    );
  }

  /** Friday 18:00 — send weekly digest to all users. */
  @Cron('0 18 * * 5')
  async handleWeeklyDigest(): Promise<void> {
    this.logger.log('[EMAIL] Weekly digest cron triggered');
    const users = await this.prisma.user.findMany({
      select: {
        email: true,
        name: true,
        id: true,
        progress: {
          select: { currentStreak: true, totalXP: true },
        },
      },
    });
    for (const u of users) {
      await this.sendWeeklyDigest(u.email, u.name, {
        streak: u.progress?.currentStreak ?? 0,
        xp: u.progress?.totalXP ?? 0,
      });
    }
    this.logger.log(
      `[EMAIL] Weekly digest sent to ${users.length} users`,
    );
  }
}
