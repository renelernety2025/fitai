import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MuscleGroup, VideoDifficulty } from '@prisma/client';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { muscleGroup?: MuscleGroup; difficulty?: VideoDifficulty }) {
    const where: any = {};
    if (filters?.muscleGroup) where.muscleGroups = { has: filters.muscleGroup };
    if (filters?.difficulty) where.difficulty = filters.difficulty;
    return this.prisma.exercise.findMany({ where, orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const ex = await this.prisma.exercise.findUnique({ where: { id } });
    if (!ex) throw new NotFoundException('Exercise not found');
    return ex;
  }

  async create(data: any) {
    return this.prisma.exercise.create({ data });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.exercise.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.exercise.delete({ where: { id } });
  }
}
