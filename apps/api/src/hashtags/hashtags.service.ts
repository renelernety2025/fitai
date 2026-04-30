import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class HashtagsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getTrending(period: 'H24' | 'D7' = 'H24') {
    const cacheKey = `trending:${period}`;
    return this.cache.getOrSet(cacheKey, 3600, async () => {
      const snapshots = await this.prisma.trendingSnapshot.findMany({
        where: { period },
        orderBy: { rank: 'asc' },
        take: 20,
        include: { hashtag: true },
      });
      return snapshots.map((s) => ({
        name: s.hashtag.name,
        postCount: s.hashtag.postCount,
        score: s.score,
        rank: s.rank,
      }));
    });
  }

  async search(query: string) {
    const hashtags = await this.prisma.hashtag.findMany({
      where: { name: { startsWith: query.toLowerCase() } },
      orderBy: { postCount: 'desc' },
      take: 10,
    });
    return hashtags;
  }

  async getPostsByHashtag(name: string, cursor?: string, limit = 20) {
    const hashtag = await this.prisma.hashtag.findUnique({ where: { name: name.toLowerCase() } });
    if (!hashtag) return { hashtag: null, posts: [] };

    const posts = await this.prisma.post.findMany({
      where: {
        hashtags: { some: { hashtagId: hashtag.id } },
      },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        user: { select: { id: true, name: true, avatarUrl: true, badgeType: true } },
        hashtags: { include: { hashtag: true } },
      },
    });

    return {
      hashtag: { name: hashtag.name, postCount: hashtag.postCount },
      posts,
    };
  }

  async getSuggested() {
    return this.cache.getOrSet('hashtags:suggested', 3600, async () => {
      const popular = await this.prisma.hashtag.findMany({
        orderBy: { postCount: 'desc' },
        take: 15,
      });
      return popular;
    });
  }

  async computeTrending() {
    const now = new Date();
    const h24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const d7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const { period, since } of [
      { period: 'H24' as const, since: h24Ago },
      { period: 'D7' as const, since: d7Ago },
    ]) {
      const counts = await this.prisma.$queryRaw<{ hashtagId: string; cnt: bigint }[]>`
        SELECT ph."hashtagId", COUNT(*) as cnt
        FROM "PostHashtag" ph
        JOIN "Post" p ON p.id = ph."postId"
        WHERE p."createdAt" >= ${since}
        GROUP BY ph."hashtagId"
        ORDER BY cnt DESC
        LIMIT 20
      `;

      await this.prisma.trendingSnapshot.deleteMany({ where: { period } });

      for (let i = 0; i < counts.length; i++) {
        const hashtag = await this.prisma.hashtag.findUnique({ where: { id: counts[i].hashtagId } });
        if (!hashtag) continue;

        const recentUses = Number(counts[i].cnt);
        const score = recentUses / Math.log(1 + hashtag.postCount);

        await this.prisma.trendingSnapshot.create({
          data: {
            hashtagId: counts[i].hashtagId,
            period,
            score,
            rank: i + 1,
          },
        });
      }

      await this.cache.del(`trending:${period}`);
    }
  }
}
