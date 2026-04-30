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
      return this.getChronologicalPublic(userId, cursor, limit);
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const posts = await this.prisma.post.findMany({
      where: {
        isPublic: true,
        isScheduled: false,
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

    // Apply diversity boost — avoid same author in consecutive positions
    const diversified: typeof scored = [];
    const recentAuthors: string[] = [];
    const recentTypes: string[] = [];
    const remaining = [...scored];

    while (remaining.length > 0 && diversified.length < limit) {
      let bestIdx = 0;
      let bestScore = -1;

      for (let i = 0; i < Math.min(remaining.length, 10); i++) {
        let boost = 1.0;
        const last3Authors = recentAuthors.slice(-3);
        if (!last3Authors.includes(remaining[i].userId)) boost *= 1.3;
        const last2Types = recentTypes.slice(-2);
        if (!last2Types.includes(remaining[i].type)) boost *= 1.1;

        const adjusted = remaining[i].feedScore * boost;
        if (adjusted > bestScore) {
          bestScore = adjusted;
          bestIdx = i;
        }
      }

      const picked = remaining.splice(bestIdx, 1)[0];
      recentAuthors.push(picked.userId);
      recentTypes.push(picked.type);
      diversified.push(picked);
    }

    return this.blurSubscriberOnlyPosts(diversified, userId);
  }

  async getFollowingFeed(userId: string, cursor?: string, limit = 20) {
    const followedIds = await this.getFollowedIds(userId);

    const posts = await this.prisma.post.findMany({
      where: {
        userId: { in: [userId, ...followedIds] },
        isScheduled: false,
        ...(cursor && !isNaN(new Date(cursor).getTime()) ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });

    return this.blurSubscriberOnlyPosts(posts, userId);
  }

  async getTrendingFeed(userId: string, cursor?: string, limit = 20) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await this.prisma.post.findMany({
      where: {
        isPublic: true,
        isScheduled: false,
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

    return this.blurSubscriberOnlyPosts(posts, userId);
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

  private async blurSubscriberOnlyPosts(posts: any[], userId: string) {
    // Collect all creator IDs that have subscriber-only posts
    const subscriberOnlyCreatorIds = [
      ...new Set(
        posts
          .filter((p) => p.isSubscriberOnly && p.userId !== userId)
          .map((p) => p.userId)
      ),
    ];

    // Single batch query instead of N+1
    let subscribedSet = new Set<string>();
    if (subscriberOnlyCreatorIds.length > 0) {
      const activeSubs = await this.prisma.creatorSubscription.findMany({
        where: {
          subscriberId: userId,
          creatorId: { in: subscriberOnlyCreatorIds },
          isActive: true,
        },
        select: { creatorId: true },
      });
      subscribedSet = new Set(activeSubs.map((s) => s.creatorId));
    }

    return posts.map((post) => {
      if (post.isSubscriberOnly && post.userId !== userId && !subscribedSet.has(post.userId)) {
        return {
          ...post,
          caption: null,
          photos: [],
          cardData: null,
          isBlurred: true,
        };
      }
      return { ...post, isBlurred: false };
    });
  }

  private async getChronologicalPublic(userId: string, cursor?: string, limit = 20) {
    const posts = await this.prisma.post.findMany({
      where: {
        isPublic: true,
        isScheduled: false,
        ...(cursor && !isNaN(new Date(cursor).getTime()) ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });
    return this.blurSubscriberOnlyPosts(posts, userId);
  }
}
