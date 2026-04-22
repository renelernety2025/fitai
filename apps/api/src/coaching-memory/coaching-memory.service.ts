import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveMemoryDto } from './dto/save-memory.dto';

@Injectable()
export class CoachingMemoryService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string, page: number, limit: number) {
    const take = Math.min(Math.max(limit, 1), 50);
    const skip = (Math.max(page, 1) - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.coachingMemory.findMany({
        where: { userId },
        include: {
          exercise: { select: { id: true, name: true, nameCs: true } },
        },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      this.prisma.coachingMemory.count({ where: { userId } }),
    ]);

    return { items, total, page, limit: take };
  }

  async search(userId: string, query: string) {
    return this.prisma.coachingMemory.findMany({
      where: {
        userId,
        insight: { contains: query, mode: 'insensitive' },
      },
      include: {
        exercise: { select: { id: true, name: true, nameCs: true } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }

  async getProgress(userId: string, exerciseId: string) {
    return this.prisma.coachingMemory.findMany({
      where: { userId, exerciseId },
      orderBy: { date: 'asc' },
    });
  }

  async save(userId: string, dto: SaveMemoryDto) {
    const improvementPct = this.computeImprovement(
      dto.metricBefore,
      dto.metricAfter,
    );

    return this.prisma.coachingMemory.create({
      data: {
        userId,
        exerciseId: dto.exerciseId,
        insight: dto.insight,
        category: dto.category as any,
        metricBefore: dto.metricBefore,
        metricAfter: dto.metricAfter,
        improvementPct,
      },
      include: {
        exercise: { select: { id: true, name: true, nameCs: true } },
      },
    });
  }

  private computeImprovement(
    before?: number,
    after?: number,
  ): number | undefined {
    if (before === undefined || after === undefined) return undefined;
    if (before === 0) return undefined;
    return ((after - before) / before) * 100;
  }
}
