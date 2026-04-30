import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getForYouFeed(userId: string, cursor?: string, limit = 20) {
    const followedIds = await this.getFollowedIds(userId);

    if (followedIds.length < 5) {
      return this.getChronologicalPublic(cursor, limit);
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await this.prisma.post.findMany({
      where: {
        isPublic: true,
        createdAt: { gte: sevenDaysAgo },
      },
      take: 200,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });

    const scored = posts.map((post) => {
      const hoursAge = (Date.now() - post.createdAt.getTime()) / 3600000;
      const timeDecay = 1 / (1 + hoursAge * 0.1);

      let sourceWeight = 0.5;
      if (followedIds.includes(post.userId)) sourceWeight = 2.0;
      else if (post.engagementScore > 10) sourceWeight = 1.5;
      else if (post.hashtags.some((h) => ['tutorial', 'tip', 'howto'].includes(h.hashtag.name))) sourceWeight = 1.0;

      const score = post.engagementScore * sourceWeight * timeDecay;
      return { ...post, feedScore: score };
    });

    scored.sort((a, b) => b.feedScore - a.feedScore);

    const startIndex = cursor ? scored.findIndex((p) => p.id === cursor) + 1 : 0;
    return scored.slice(startIndex, startIndex + limit);
  }

  async getFollowingFeed(userId: string, cursor?: string, limit = 20) {
    const followedIds = await this.getFollowedIds(userId);

    const posts = await this.prisma.post.findMany({
      where: {
        userId: { in: [userId, ...followedIds] },
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });

    return posts;
  }

  async getTrendingFeed(cursor?: string, limit = 20) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await this.prisma.post.findMany({
      where: {
        isPublic: true,
        createdAt: { gte: oneDayAgo },
        ...(cursor ? { engagementScore: { lt: parseFloat(cursor) } } : {}),
      },
      take: limit,
      orderBy: { engagementScore: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });

    return posts;
  }

  private async getFollowedIds(userId: string): Promise<string[]> {
    return this.cache.getOrSet(`following:${userId}`, 300, async () => {
      const follows = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followedId: true },
      });
      return follows.map((f) => f.followedId);
    });
  }

  private async getChronologicalPublic(cursor?: string, limit = 20) {
    return this.prisma.post.findMany({
      where: {
        isPublic: true,
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });
  }
}
