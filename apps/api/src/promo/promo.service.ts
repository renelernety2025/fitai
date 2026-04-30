import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class PromoService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getForFeed(userId: string, limit = 3) {
    const dismissedKey = `promo:dismissed:${userId}`;
    const dismissed: string[] = (await this.cache.get<string[]>(dismissedKey)) || [];

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, createdAt: true },
    });

    const audiences = ['ALL'];
    if (user) {
      const daysSinceJoin = (Date.now() - user.createdAt.getTime()) / 86400000;
      if (daysSinceJoin < 7) audiences.push('NEW_USER');
      if (user.level === 'BEGINNER') audiences.push('FREE_TIER');
    }

    const now = new Date();
    const promos = await this.prisma.promoCard.findMany({
      where: {
        isActive: true,
        id: { notIn: dismissed },
        targetAudience: { in: audiences as any },
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      orderBy: { priority: 'desc' },
      take: limit,
    });

    return promos;
  }

  async dismiss(userId: string, promoId: string) {
    const key = `promo:dismissed:${userId}`;
    const dismissed: string[] = (await this.cache.get<string[]>(key)) || [];
    dismissed.push(promoId);
    await this.cache.set(key, dismissed, 30 * 24 * 3600);
    return { dismissed: true };
  }

  async create(data: any) {
    return this.prisma.promoCard.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.promoCard.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.promoCard.delete({ where: { id } });
  }
}
