import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotifyService } from '../notify/notify.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CreatorEconomyProcessor {
  private readonly logger = new Logger(CreatorEconomyProcessor.name);

  constructor(
    private prisma: PrismaService,
    private notifyService: NotifyService,
    private cache: CacheService,
  ) {}

  @Cron('0 3 * * *') // daily at 03:00 UTC
  async renewSubscriptions() {
    const acquired = await this.cache.acquireLock('cron:renewSubscriptions', 80000);
    if (!acquired) return;
    try {
      this.logger.log('Processing subscription renewals...');
      const now = new Date();

      const expiredSubs = await this.prisma.creatorSubscription.findMany({
        where: { isActive: true, renewsAt: { lte: now } },
        include: {
          subscriber: { include: { progress: true } },
          creator: { include: { creatorProfile: true } },
        },
      });

      let renewed = 0;
      let expired = 0;

      for (const sub of expiredSubs) {
        const availableXP =
          (sub.subscriber.progress?.totalXP || 0) - (sub.subscriber.progress?.totalXPSpent || 0);
        const price = sub.xpPerMonth;

        if (availableXP >= price) {
          const creatorXP = Math.floor(price * 0.7);
          const newRenewsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

          await this.prisma.$transaction([
            this.prisma.userProgress.update({
              where: { userId: sub.subscriberId },
              data: { totalXPSpent: { increment: price } },
            }),
            this.prisma.creatorProfile.update({
              where: { userId: sub.creatorId },
              data: {
                totalXPEarned: { increment: creatorXP },
                monthlyXPEarned: { increment: creatorXP },
              },
            }),
            this.prisma.creatorSubscription.update({
              where: { id: sub.id },
              data: { renewsAt: newRenewsAt },
            }),
          ]);
          renewed++;
        } else {
          await this.prisma.$transaction([
            this.prisma.creatorSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            }),
            this.prisma.creatorProfile.update({
              where: { userId: sub.creatorId },
              data: { subscriberCount: { decrement: 1 } },
            }),
          ]);

          await this.notifyService.create(
            'SUBSCRIBER_NEW',
            sub.subscriberId,
            sub.creatorId,
            'Tvůj subscription expiroval — nemáš dost XP pro obnovu',
          );
          expired++;
        }
      }

      this.logger.log(`Subscriptions: ${renewed} renewed, ${expired} expired`);
    } finally {
      await this.cache.releaseLock('cron:renewSubscriptions');
    }
  }
}
