import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { HashtagsService } from '../hashtags/hashtags.service';
import { CacheService } from '../cache/cache.service';
import { NotifyService } from '../notify/notify.service';

@Injectable()
export class FeedProcessor {
  private readonly logger = new Logger(FeedProcessor.name);

  constructor(
    private prisma: PrismaService,
    private hashtagsService: HashtagsService,
    private cache: CacheService,
    private notifyService: NotifyService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async recomputeEngagementScores() {
    const acquired = await this.cache.acquireLock('cron:engagementScores', 540);
    if (!acquired) return;
    try {
      this.logger.log('Recomputing engagement scores...');
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const result = await this.prisma.$executeRaw`
        UPDATE "Post"
        SET "engagementScore" = "likeCount" * 1 + "commentCount" * 3 + "shareCount" * 5
        WHERE "createdAt" >= ${twoDaysAgo}
      `;

      this.logger.log(`Updated engagement scores for ${result} posts`);
    } finally {
      await this.cache.releaseLock('cron:engagementScores');
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async recomputeTrending() {
    const acquired = await this.cache.acquireLock('cron:recomputeTrending', 3500);
    if (!acquired) return;
    try {
      this.logger.log('Recomputing trending hashtags...');
      await this.hashtagsService.computeTrending();
      this.logger.log('Trending hashtags updated');
    } finally {
      await this.cache.releaseLock('cron:recomputeTrending');
    }
  }

  @Cron('0 */2 * * *') // every 2 hours
  async checkEngagementEvents() {
    const acquired = await this.cache.acquireLock('cron:checkEngagementEvents', 7000);
    if (!acquired) return;
    try {
      this.logger.log('Checking engagement events...');
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      const milestoneThresholds = [10, 50, 100, 500];
      for (const threshold of milestoneThresholds) {
        const posts = await this.prisma.post.findMany({
          where: {
            likeCount: { gte: threshold, lt: threshold + 1 },
            updatedAt: { gte: twoHoursAgo },
          },
          select: { id: true, userId: true, likeCount: true },
        });

        for (const post of posts) {
          await this.notifyService.create(
            'POST_MILESTONE', post.userId, post.userId,
            `Tvůj post dosáhl ${post.likeCount} likes!`,
            'post', post.id,
          );
        }
      }

      const recentSessions = await this.prisma.gymSession.findMany({
        where: { startedAt: { gte: twoHoursAgo } },
        select: { userId: true },
        take: 100,
      });

      for (const session of recentSessions) {
        const followers = await this.prisma.follow.findMany({
          where: { followedId: session.userId },
          select: { followerId: true },
          take: 20,
        });
        const actor = await this.prisma.user.findUnique({
          where: { id: session.userId },
          select: { name: true },
        });
        for (const f of followers) {
          await this.notifyService.create(
            'BUDDY_WORKOUT', f.followerId, session.userId,
            `${actor?.name || 'Tvůj buddy'} právě dokončil trénink!`,
          );
        }
      }

      this.logger.log('Engagement events checked');
    } finally {
      await this.cache.releaseLock('cron:checkEngagementEvents');
    }
  }

  @Cron('* * * * *') // every minute
  async publishScheduledPosts() {
    const acquired = await this.cache.acquireLock('cron:publishScheduledPosts', 55);
    if (!acquired) return;
    try {
      const now = new Date();
      const posts = await this.prisma.post.findMany({
        where: { isScheduled: true, publishAt: { lte: now } },
      });

      for (const post of posts) {
        await this.prisma.post.update({
          where: { id: post.id },
          data: { isScheduled: false },
        });
      }

      if (posts.length > 0) {
        this.logger.log(`Published ${posts.length} scheduled posts`);
      }
    } finally {
      await this.cache.releaseLock('cron:publishScheduledPosts');
    }
  }
}
