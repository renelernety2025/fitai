import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePlanDto } from './dto/update-plan.dto';

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

  async findById(id: string, userId?: string) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: { days: { include: { plannedExercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } }, orderBy: { dayIndex: 'asc' } } },
    });
    if (!plan) throw new NotFoundException('Workout plan not found');
    if (userId && !plan.isTemplate && plan.userId !== userId) {
      throw new ForbiddenException('Not your workout plan');
    }
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
    const source = await this.findById(id, userId);
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

  async update(id: string, userId: string, data: UpdatePlanDto) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
    });
    if (!plan || plan.userId !== userId) {
      throw new ForbiddenException();
    }

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.nameCs) updateData.nameCs = data.nameCs;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.daysPerWeek) updateData.daysPerWeek = data.daysPerWeek;

    if (data.days) {
      await this.prisma.workoutDay.deleteMany({
        where: { workoutPlanId: id },
      });

      for (const day of data.days) {
        await this.prisma.workoutDay.create({
          data: {
            workoutPlanId: id,
            dayIndex: day.dayIndex,
            name: day.name,
            nameCs: day.nameCs || day.name,
            plannedExercises: {
              create: day.exercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                orderIndex: ex.orderIndex,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                targetWeight: ex.targetWeight,
                restSeconds: ex.restSeconds ?? 90,
                notes: ex.notes,
                groupId: ex.groupId,
                groupType: ex.groupType,
                groupOrder: ex.groupOrder,
              })),
            },
          },
        });
      }
    }

    return this.prisma.workoutPlan.update({
      where: { id },
      data: updateData,
      include: {
        days: {
          orderBy: { dayIndex: 'asc' },
          include: {
            plannedExercises: {
              orderBy: { orderIndex: 'asc' },
              include: { exercise: true },
            },
          },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    const plan = await this.findById(id);
    if (plan.userId !== userId) throw new ForbiddenException();
    return this.prisma.workoutPlan.delete({ where: { id } });
  }
}
