import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VipService {
  private readonly logger = new Logger(VipService.name);

  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const membership = await (
      this.prisma as any
    ).vIPMembership.findUnique({
      where: { userId },
    });
    return membership ?? { isVip: false };
  }

  async accept(userId: string) {
    const existing = await (
      this.prisma as any
    ).vIPMembership.findUnique({
      where: { userId },
    });
    if (existing) throw new ConflictException('Already VIP');

    const eligible = await this.checkEligibilityInternal(userId);
    if (!eligible.isEligible) {
      throw new ForbiddenException('Not eligible for VIP');
    }

    return (this.prisma as any).vIPMembership.create({
      data: {
        userId,
        tier: 'GOLD',
        invitedAt: new Date(),
      },
    });
  }

  async checkEligibility(userId: string) {
    return this.checkEligibilityInternal(userId);
  }

  async getLounge(userId: string) {
    const membership = await (
      this.prisma as any
    ).vIPMembership.findUnique({
      where: { userId },
    });
    if (!membership) {
      throw new ForbiddenException('VIP only');
    }

    return this.prisma.activityFeedItem.findMany({
      where: {
        user: {
          vipMembership: { isNot: null },
        },
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  // ── helpers ──

  private async checkEligibilityInternal(userId: string) {
    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });
    if (!progress) {
      return {
        isEligible: false,
        reasons: ['No progress data'],
      };
    }

    const reasons: string[] = [];
    const totalUsers = await this.prisma.userProgress.count();
    const xpRank = await this.prisma.userProgress.count({
      where: { totalXP: { gt: progress.totalXP } },
    });
    const isTop1Pct = xpRank < totalUsers * 0.01;
    if (!isTop1Pct) reasons.push('Not top 1% by XP');

    const hasStreak100 = progress.currentStreak >= 100;
    if (!hasStreak100) reasons.push('Streak < 100');

    const sessions = await this.prisma.gymSession.findMany({
      where: { userId },
      select: { averageFormScore: true },
      take: 50,
      orderBy: { startedAt: 'desc' },
    });
    const avgForm =
      sessions.length > 0
        ? sessions.reduce(
            (s, g) => s + (g.averageFormScore ?? 0),
            0,
          ) / sessions.length
        : 0;
    const hasForm85 = avgForm >= 85;
    if (!hasForm85) reasons.push('Avg form < 85%');

    return {
      isEligible: isTop1Pct && hasStreak100 && hasForm85,
      reasons,
      stats: {
        xpRank: xpRank + 1,
        totalUsers,
        currentStreak: progress.currentStreak,
        avgFormScore: Math.round(avgForm),
      },
    };
  }
}
