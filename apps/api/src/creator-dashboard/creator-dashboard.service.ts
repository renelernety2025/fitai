import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class CreatorDashboardService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getStats(creatorId: string) {
    const profile = await this.prisma.creatorProfile.findUnique({ where: { userId: creatorId } });
    if (!profile || !profile.isApproved) throw new NotFoundException('Creator profile not found');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [subscriberCount, postCount, subscriberOnlyCount, recentPosts] = await Promise.all([
      this.prisma.creatorSubscription.count({ where: { creatorId, isActive: true } }),
      this.prisma.post.count({ where: { userId: creatorId, isScheduled: false } }),
      this.prisma.post.count({ where: { userId: creatorId, isSubscriberOnly: true } }),
      this.prisma.post.findMany({
        where: { userId: creatorId, isScheduled: false, createdAt: { gte: thirtyDaysAgo } },
        select: { likeCount: true, commentCount: true },
      }),
    ]);

    const totalEngagement = recentPosts.reduce((sum, p) => sum + p.likeCount + p.commentCount, 0);
    const engagementRate = recentPosts.length > 0 ? totalEngagement / recentPosts.length : 0;

    const topPost = await this.prisma.post.findFirst({
      where: { userId: creatorId, isScheduled: false },
      orderBy: { engagementScore: 'desc' },
      include: { photos: { take: 1, orderBy: { order: 'asc' } } },
    });

    return {
      subscribers: subscriberCount,
      monthlyXPEarned: profile.monthlyXPEarned,
      totalXPEarned: profile.totalXPEarned,
      posts: postCount,
      subscriberOnlyPosts: subscriberOnlyCount,
      engagementRate: Math.round(engagementRate * 100) / 100,
      topPost: topPost
        ? {
            id: topPost.id,
            caption: topPost.caption?.slice(0, 100),
            likeCount: topPost.likeCount,
            commentCount: topPost.commentCount,
            photo: topPost.photos[0]?.s3Key,
          }
        : null,
    };
  }

  async getSubscriberGrowth(creatorId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const subs = await this.prisma.creatorSubscription.findMany({
      where: { creatorId, startedAt: { gte: since } },
      select: { startedAt: true, isActive: true },
    });

    const dailyData: Record<string, { newSubs: number; churn: number }> = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      dailyData[date] = { newSubs: 0, churn: 0 };
    }

    for (const sub of subs) {
      const date = sub.startedAt.toISOString().slice(0, 10);
      if (dailyData[date]) {
        dailyData[date].newSubs++;
        if (!sub.isActive) dailyData[date].churn++;
      }
    }

    return Object.entries(dailyData).sort().map(([date, data]) => ({ date, ...data }));
  }

  async getEarnings(creatorId: string, weeks = 12) {
    const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

    const tips = await this.prisma.creatorTip.findMany({
      where: { toCreatorId: creatorId, createdAt: { gte: since } },
      select: { xpAmount: true, createdAt: true },
    });

    const weeklyData: Record<string, { tips: number; subscriptions: number }> = {};
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
      const key = weekStart.toISOString().slice(0, 10);
      weeklyData[key] = { tips: 0, subscriptions: 0 };
    }

    for (const tip of tips) {
      const weekKey = Object.keys(weeklyData).find((k) => tip.createdAt >= new Date(k));
      if (weekKey && weeklyData[weekKey]) {
        weeklyData[weekKey].tips += Math.floor(tip.xpAmount * 0.7);
      }
    }

    return Object.entries(weeklyData).sort().map(([week, data]) => ({ week, ...data }));
  }

  async getPostPerformance(creatorId: string, limit = 20) {
    return this.prisma.post.findMany({
      where: { userId: creatorId, isScheduled: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        caption: true,
        type: true,
        likeCount: true,
        commentCount: true,
        engagementScore: true,
        isSubscriberOnly: true,
        createdAt: true,
      },
    });
  }

  async getTopHashtags(creatorId: string) {
    const posts = await this.prisma.post.findMany({
      where: { userId: creatorId },
      select: { hashtags: { include: { hashtag: true } } },
    });

    const tagCounts: Record<string, number> = {};
    for (const post of posts) {
      for (const ph of post.hashtags) {
        tagCounts[ph.hashtag.name] = (tagCounts[ph.hashtag.name] || 0) + 1;
      }
    }

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  async setSubscriptionPrice(creatorId: string, priceXP: number) {
    return this.prisma.creatorProfile.update({
      where: { userId: creatorId },
      data: { subscriptionPriceXP: priceXP },
    });
  }

  async pinPost(creatorId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId) throw new ForbiddenException();

    await this.prisma.post.updateMany({
      where: { userId: creatorId, isPinned: true },
      data: { isPinned: false },
    });

    return this.prisma.post.update({ where: { id: postId }, data: { isPinned: true } });
  }

  async unpinPost(creatorId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId) throw new ForbiddenException();
    return this.prisma.post.update({ where: { id: postId }, data: { isPinned: false } });
  }

  async schedulePost(creatorId: string, dto: any) {
    return this.prisma.post.create({
      data: {
        userId: creatorId,
        caption: dto.caption,
        type: dto.type,
        isScheduled: true,
        publishAt: new Date(dto.publishAt),
        isSubscriberOnly: dto.isSubscriberOnly || false,
        photos: dto.photoKeys?.length
          ? { create: dto.photoKeys.map((s3Key: string, i: number) => ({ s3Key, order: i })) }
          : undefined,
      },
      include: { photos: true },
    });
  }

  async updateScheduledPost(creatorId: string, postId: string, dto: any) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId || !post.isScheduled) throw new ForbiddenException();
    return this.prisma.post.update({
      where: { id: postId },
      data: { caption: dto.caption, publishAt: new Date(dto.publishAt) },
    });
  }

  async cancelScheduledPost(creatorId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId || !post.isScheduled) throw new ForbiddenException();
    return this.prisma.post.delete({ where: { id: postId } });
  }

  async publishNow(creatorId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.userId !== creatorId || !post.isScheduled) throw new ForbiddenException();
    return this.prisma.post.update({ where: { id: postId }, data: { isScheduled: false } });
  }

  async bulkSubscriberOnly(creatorId: string, postIds: string[], isSubscriberOnly: boolean) {
    await this.prisma.post.updateMany({
      where: { id: { in: postIds }, userId: creatorId },
      data: { isSubscriberOnly },
    });
    return { updated: postIds.length };
  }
}
