import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { MuscleGroup, VideoDifficulty } from '@prisma/client';

/**
 * Exercises are semi-static content — edited only via seed or admin panel.
 * Caching aggressively reduces RDS load; invalidation on write operations.
 */
const CACHE_TTL_EXERCISES = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class ExercisesService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll(filters?: { muscleGroup?: MuscleGroup; difficulty?: VideoDifficulty }) {
    // Unfiltered list is heavily cached; filtered queries bypass cache
    // (lower volume, and it would require per-filter cache keys).
    if (!filters?.muscleGroup && !filters?.difficulty) {
      return this.cache.getOrSet(
        'exercises:all',
        CACHE_TTL_EXERCISES,
        () => this.prisma.exercise.findMany({ orderBy: { name: 'asc' } }),
      );
    }
    const where: any = {};
    if (filters?.muscleGroup) where.muscleGroups = { has: filters.muscleGroup };
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    return this.prisma.exercise.findMany({ where, orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    return this.cache.getOrSet(`exercises:${id}`, CACHE_TTL_EXERCISES, async () => {
      const ex = await this.prisma.exercise.findUnique({ where: { id } });
      if (!ex) throw new NotFoundException('Exercise not found');
      return ex;
    });
  }

  /** Pick 3 random exercises for a 5-minute micro-workout challenge. */
  async getMicroWorkout() {
    const all = await this.findAll();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 3);
    return {
      title: '5-minutovy challenge',
      durationMinutes: 5,
      exercises: picked.map((ex) => ({
        ...ex,
        targetReps: 12,
        targetSets: 2,
        restSeconds: 30,
      })),
    };
  }

  async create(data: any) {
    const created = await this.prisma.exercise.create({ data });
    await this.invalidate();
    return created;
  }

  async update(id: string, data: any) {
    await this.findById(id);
    const updated = await this.prisma.exercise.update({ where: { id }, data });
    await this.invalidate(id);
    return updated;
  }

  async delete(id: string) {
    await this.findById(id);
    const deleted = await this.prisma.exercise.delete({ where: { id } });
    await this.invalidate(id);
    return deleted;
  }

  private async invalidate(id?: string) {
    await this.cache.del('exercises:all');
    if (id) await this.cache.del(`exercises:${id}`);
  }
}
