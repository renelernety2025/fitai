import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getRecommendations(userId: string) {
    return this.cache.getOrSet(
      `recommendations:${userId}`,
      86400,
      () => this.compute(userId),
    );
  }

  private async compute(userId: string) {
    const profile = await this.prisma.fitnessProfile.findUnique({
      where: { userId },
    });

    const myHistory = await this.prisma.exerciseHistory.findMany({
      where: { userId },
      select: { exerciseId: true },
    });
    const myExerciseIds = new Set(myHistory.map((h) => h.exerciseId));

    const similarUsers = await this.findSimilarUsers(
      userId,
      profile?.goal,
      profile?.experienceMonths,
    );

    if (!similarUsers.length) return [];

    const popularExercises = await this.prisma.exerciseHistory.groupBy({
      by: ['exerciseId'],
      where: {
        userId: { in: similarUsers },
      },
      _count: { exerciseId: true },
      orderBy: { _count: { exerciseId: 'desc' } },
      take: 20,
    });

    const unseen = popularExercises.filter(
      (e) => !myExerciseIds.has(e.exerciseId),
    );
    const topIds = unseen.slice(0, 5).map((e) => e.exerciseId);

    const exercises = await this.prisma.exercise.findMany({
      where: { id: { in: topIds } },
    });

    const totalSimilar = similarUsers.length;
    return exercises.map((ex) => {
      const stat = popularExercises.find(
        (p) => p.exerciseId === ex.id,
      );
      const pct = stat
        ? Math.round((stat._count.exerciseId / totalSimilar) * 100)
        : 0;
      return {
        exercise: ex,
        reason: `${pct}% uzivatelu s cilem ${profile?.goal ?? 'general'} dela ${ex.nameCs || ex.name}`,
      };
    });
  }

  private async findSimilarUsers(
    userId: string,
    goal?: string | null,
    expMonths?: number | null,
  ): Promise<string[]> {
    const where: any = { userId: { not: userId } };
    if (goal) where.goal = goal;
    if (expMonths != null) {
      where.experienceMonths = {
        gte: Math.max(0, expMonths - 6),
        lte: expMonths + 6,
      };
    }

    const profiles = await this.prisma.fitnessProfile.findMany({
      where,
      select: { userId: true },
      take: 50,
    });

    return profiles.map((p) => p.userId);
  }
}
