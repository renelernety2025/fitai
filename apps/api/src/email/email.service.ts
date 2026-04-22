import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private prisma: PrismaService) {}

  async sendWelcome(email: string, name: string): Promise<void> {
    this.logger.log(`[EMAIL] Welcome: ${email} (${name})`);
    // TODO: integrate Resend/SES when API keys available
  }

  async sendPasswordReset(
    email: string,
    token: string,
  ): Promise<void> {
    const resetUrl =
      `https://fitai.bfevents.cz/reset-password?token=${token}`;
    this.logger.log(`[EMAIL] Password reset: ${email} -> ${resetUrl}`);
  }

  async sendWeeklyDigest(
    email: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log(
      `[EMAIL] Weekly digest: ${email} (${JSON.stringify(data)})`,
    );
  }

  async sendStreakWarning(
    email: string,
    name: string,
    streak: number,
  ): Promise<void> {
    this.logger.log(
      `[EMAIL] Streak warning: ${email} (${name}, ${streak} days)`,
    );
  }

  /** Friday 18:00 — send weekly digest to all users. */
  @Cron('0 18 * * 5')
  async handleWeeklyDigest(): Promise<void> {
    this.logger.log('[EMAIL] Weekly digest cron triggered');
    const users = await this.prisma.user.findMany({
      select: { email: true, name: true, id: true },
    });
    for (const u of users) {
      await this.sendWeeklyDigest(u.email, {
        userId: u.id,
        name: u.name,
      });
    }
    this.logger.log(
      `[EMAIL] Weekly digest sent to ${users.length} users`,
    );
  }
}
