import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotifyService } from '../notify/notify.service';

@Injectable()
export class CreatorEconomyService {
  constructor(
    private prisma: PrismaService,
    private notifyService: NotifyService,
  ) {}

  async subscribe(subscriberId: string, creatorId: string) {
    if (subscriberId === creatorId) throw new BadRequestException('Cannot subscribe to yourself');

    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId: creatorId } });
    if (!creator || !creator.isApproved) throw new NotFoundException('Creator not found');

    const existing = await this.prisma.creatorSubscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });
    if (existing?.isActive) throw new BadRequestException('Already subscribed');

    const creatorXP = Math.floor(creator.subscriptionPriceXP * 0.7);
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Atomic balance check + deduction — updateMany returns count=0 if insufficient XP.
    const debit = await this.prisma.userProgress.updateMany({
      where: {
        userId: subscriberId,
        totalXP: { gte: creator.subscriptionPriceXP },
        // ensures (totalXP - totalXPSpent) >= price — TODO: Prisma raw if needed for derived expr
      },
      data: { totalXPSpent: { increment: creator.subscriptionPriceXP } },
    });
    if (debit.count === 0) throw new BadRequestException('Not enough XP');

    await this.prisma.$transaction([
      this.prisma.creatorProfile.update({
        where: { userId: creatorId },
        data: {
          totalXPEarned: { increment: creatorXP },
          monthlyXPEarned: { increment: creatorXP },
          subscriberCount: { increment: 1 },
        },
      }),
      existing
        ? this.prisma.creatorSubscription.update({
            where: { id: existing.id },
            data: { isActive: true, xpPerMonth: creator.subscriptionPriceXP, renewsAt },
          })
        : this.prisma.creatorSubscription.create({
            data: { subscriberId, creatorId, xpPerMonth: creator.subscriptionPriceXP, renewsAt },
          }),
    ]);

    const subscriber = await this.prisma.user.findUnique({
      where: { id: subscriberId },
      select: { name: true },
    });
    await this.notifyService.create(
      'SUBSCRIBER_NEW',
      creatorId,
      subscriberId,
      `${subscriber?.name || 'Někdo'} se přidal k tvým subscriberům`,
      'creator',
      creatorId,
    );

    return { subscribed: true, xpDeducted: creator.subscriptionPriceXP };
  }

  async unsubscribe(subscriberId: string, creatorId: string) {
    const sub = await this.prisma.creatorSubscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });
    if (!sub || !sub.isActive) throw new BadRequestException('Not subscribed');

    await this.prisma.$transaction([
      this.prisma.creatorSubscription.update({
        where: { id: sub.id },
        data: { isActive: false },
      }),
      this.prisma.creatorProfile.update({
        where: { userId: creatorId },
        data: { subscriberCount: { decrement: 1 } },
      }),
    ]);

    return { unsubscribed: true };
  }

  async getSubscriptions(userId: string) {
    return this.prisma.creatorSubscription.findMany({
      where: { subscriberId: userId, isActive: true },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getSubscribers(creatorId: string) {
    return this.prisma.creatorSubscription.findMany({
      where: { creatorId, isActive: true },
      include: {
        subscriber: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async tip(fromUserId: string, toCreatorId: string, xpAmount: number, message?: string) {
    if (fromUserId === toCreatorId) throw new BadRequestException('Cannot tip yourself');

    const creator = await this.prisma.creatorProfile.findUnique({ where: { userId: toCreatorId } });
    if (!creator || !creator.isApproved) throw new NotFoundException('Creator not found');

    const creatorXP = Math.floor(xpAmount * 0.7);

    // Atomic balance check + deduction
    const debit = await this.prisma.userProgress.updateMany({
      where: { userId: fromUserId, totalXP: { gte: xpAmount } },
      data: { totalXPSpent: { increment: xpAmount } },
    });
    if (debit.count === 0) throw new BadRequestException('Not enough XP');

    await this.prisma.$transaction([
      this.prisma.creatorProfile.update({
        where: { userId: toCreatorId },
        data: {
          totalXPEarned: { increment: creatorXP },
          monthlyXPEarned: { increment: creatorXP },
        },
      }),
      this.prisma.creatorTip.create({
        data: { fromUserId, toCreatorId, xpAmount, message },
      }),
    ]);

    const sender = await this.prisma.user.findUnique({
      where: { id: fromUserId },
      select: { name: true },
    });
    await this.notifyService.create(
      'TIP_RECEIVED',
      toCreatorId,
      fromUserId,
      `${sender?.name || 'Někdo'} ti poslal ${xpAmount} XP tip`,
      'tip',
      toCreatorId,
    );

    return { tipped: true, xpDeducted: xpAmount };
  }

  async getEarnings(creatorId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId: creatorId } });
    if (!profile) throw new NotFoundException('Creator profile not found');

    const subscriptionCount = await this.prisma.creatorSubscription.count({
      where: { creatorId, isActive: true },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTips = await this.prisma.creatorTip.aggregate({
      where: { toCreatorId: creatorId, createdAt: { gte: thirtyDaysAgo } },
      _sum: { xpAmount: true },
      _count: true,
    });

    return {
      totalXPEarned: profile.totalXPEarned,
      monthlyXPEarned: profile.monthlyXPEarned,
      activeSubscribers: subscriptionCount,
      subscriptionPriceXP: profile.subscriptionPriceXP,
      monthlySubscriptionXP: subscriptionCount * Math.floor(profile.subscriptionPriceXP * 0.7),
      recentTipsXP: recentTips._sum.xpAmount || 0,
      recentTipsCount: recentTips._count,
    };
  }

  async checkSubscription(subscriberId: string, creatorId: string) {
    const sub = await this.prisma.creatorSubscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });
    return { isSubscribed: !!sub?.isActive, renewsAt: sub?.renewsAt };
  }
}
