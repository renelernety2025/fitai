import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkoutPlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { OR: [{ isTemplate: true }, { userId }] },
      include: { days: { include: { plannedExercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } }, orderBy: { dayIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: { days: { include: { plannedExercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } }, orderBy: { dayIndex: 'asc' } } },
    });
    if (!plan) throw new NotFoundException('Workout plan not found');
    return plan;
  }

  async create(userId: string, data: any) {
    const { days, ...planData } = data;
    return this.prisma.workoutPlan.create({
      data: {
        ...planData,
        userId,
        days: days ? {
          create: days.map((day: any, i: number) => ({
            dayIndex: i,
            name: day.name,
            nameCs: day.nameCs,
            plannedExercises: {
              create: day.exercises.map((ex: any, j: number) => ({
                exerciseId: ex.exerciseId,
                orderIndex: j,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                targetWeight: ex.targetWeight,
                restSeconds: ex.restSeconds || 90,
              })),
            },
          })),
        } : undefined,
      },
      include: { days: { include: { plannedExercises: true } } },
    });
  }

  async clone(id: string, userId: string) {
    const source = await this.findById(id);
    return this.create(userId, {
      name: `${source.name} (kopie)`,
      nameCs: `${source.nameCs} (kopie)`,
      description: source.description,
      type: 'CUSTOM',
      difficulty: source.difficulty,
      daysPerWeek: source.daysPerWeek,
      days: source.days.map((day) => ({
        name: day.name,
        nameCs: day.nameCs,
        exercises: day.plannedExercises.map((pe) => ({
          exerciseId: pe.exerciseId,
          targetSets: pe.targetSets,
          targetReps: pe.targetReps,
          targetWeight: pe.targetWeight,
          restSeconds: pe.restSeconds,
        })),
      })),
    });
  }

  async delete(id: string, userId: string) {
    const plan = await this.findById(id);
    if (plan.userId !== userId) throw new ForbiddenException();
    return this.prisma.workoutPlan.delete({ where: { id } });
  }
}
