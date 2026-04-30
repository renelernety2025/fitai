import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { HashtagsService } from '../hashtags/hashtags.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class FeedProcessor {
  private readonly logger = new Logger(FeedProcessor.name);

  constructor(
    private prisma: PrismaService,
    private hashtagsService: HashtagsService,
    private cache: CacheService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async recomputeEngagementScores() {
    this.logger.log('Recomputing engagement scores...');
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const posts = await this.prisma.post.findMany({
      where: { createdAt: { gte: twoDaysAgo } },
      select: { id: true, likeCount: true, commentCount: true, shareCount: true },
    });

    for (const post of posts) {
      const score = post.likeCount * 1 + post.commentCount * 3 + post.shareCount * 5;
      await this.prisma.post.update({
        where: { id: post.id },
        data: { engagementScore: score },
      });
    }

    this.logger.log(`Updated engagement scores for ${posts.length} posts`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async recomputeTrending() {
    this.logger.log('Recomputing trending hashtags...');
    await this.hashtagsService.computeTrending();
    this.logger.log('Trending hashtags updated');
  }
}
