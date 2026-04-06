import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { StartGymSessionDto } from './dto/start-gym-session.dto';
import { CompleteSetDto } from './dto/complete-set.dto';

@Injectable()
export class GymSessionsService {
  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
  ) {}

  async startSession(userId: string, dto: StartGymSessionDto) {
    // Create gym session
    const gymSession = await this.prisma.gymSession.create({
      data: {
        userId,
        workoutPlanId: dto.workoutPlanId,
        workoutDayIndex: dto.workoutDayIndex,
      },
    });

    // Create linked WorkoutSession for XP tracking
    await this.prisma.workoutSession.create({
      data: { userId, gymSessionId: gymSession.id },
    });

    // Pre-populate sets from plan or ad-hoc
    if (dto.workoutPlanId && dto.workoutDayIndex !== undefined) {
      const day = await this.prisma.workoutDay.findFirst({
        where: { workoutPlanId: dto.workoutPlanId, dayIndex: dto.workoutDayIndex },
        include: { plannedExercises: { orderBy: { orderIndex: 'asc' } } },
      });
      if (day) {
        for (const pe of day.plannedExercises) {
          for (let s = 1; s <= pe.targetSets; s++) {
            await this.prisma.exerciseSet.create({
              data: {
                gymSessionId: gymSession.id,
                exerciseId: pe.exerciseId,
                setNumber: s,
                targetReps: pe.targetReps,
                targetWeight: pe.targetWeight,
              },
            });
          }
        }
      }
    } else if (dto.adHocExercises) {
      for (const ex of dto.adHocExercises) {
        for (let s = 1; s <= ex.targetSets; s++) {
          await this.prisma.exerciseSet.create({
            data: {
              gymSessionId: gymSession.id,
              exerciseId: ex.exerciseId,
              setNumber: s,
              targetReps: ex.targetReps,
              targetWeight: ex.targetWeight,
            },
          });
        }
      }
    }

    return this.prisma.gymSession.findUnique({
      where: { id: gymSession.id },
      include: { exerciseSets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
    });
  }

  async completeSet(sessionId: string, userId: string, dto: CompleteSetDto) {
    const session = await this.prisma.gymSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    return this.prisma.exerciseSet.update({
      where: { id: dto.setId },
      data: {
        actualReps: dto.actualReps,
        actualWeight: dto.actualWeight,
        formScore: dto.formScore,
        repData: dto.repData,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  async endSession(sessionId: string, userId: string) {
    const session = await this.prisma.gymSession.findUnique({
      where: { id: sessionId },
      include: { exerciseSets: true, workoutSession: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    const completedSets = session.exerciseSets.filter((s) => s.status === 'COMPLETED');
    const totalReps = completedSets.reduce((sum, s) => sum + s.actualReps, 0);
    const avgForm = completedSets.length
      ? completedSets.reduce((sum, s) => sum + s.formScore, 0) / completedSets.length
      : 0;
    const elapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);

    // Update gym session
    const updated = await this.prisma.gymSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        totalReps,
        averageFormScore: Math.round(avgForm),
        durationSeconds: elapsed,
      },
    });

    // Update linked workout session
    if (session.workoutSession) {
      await this.prisma.workoutSession.update({
        where: { id: session.workoutSession.id },
        data: {
          completedAt: new Date(),
          durationSeconds: elapsed,
          accuracyScore: avgForm,
        },
      });
    }

    // Update exercise history
    const exerciseGroups = new Map<string, typeof completedSets>();
    for (const set of completedSets) {
      const arr = exerciseGroups.get(set.exerciseId) || [];
      arr.push(set);
      exerciseGroups.set(set.exerciseId, arr);
    }

    for (const [exerciseId, sets] of exerciseGroups) {
      const bestWeight = Math.max(...sets.map((s) => s.actualWeight ?? 0));
      const bestReps = Math.max(...sets.map((s) => s.actualReps));
      const avgScore = sets.reduce((s, r) => s + r.formScore, 0) / sets.length;
      const volume = sets.reduce((s, r) => s + r.actualReps * (r.actualWeight ?? 0), 0);

      await this.prisma.exerciseHistory.create({
        data: { userId, exerciseId, bestWeight: bestWeight || null, bestReps, avgFormScore: avgScore, totalVolume: volume },
      });
    }

    // Calculate XP
    const completionRate = session.exerciseSets.length
      ? completedSets.length / session.exerciseSets.length
      : 0;
    const progressResult = await this.progressService.updateProgress(userId, {
      durationSeconds: elapsed,
      accuracyScore: avgForm,
      completedFullVideo: completionRate >= 0.8,
    });

    // Bonus XP for reps with good form
    const goodFormReps = completedSets
      .filter((s) => s.formScore >= 70)
      .reduce((sum, s) => sum + s.actualReps, 0);

    return { session: updated, progress: { ...progressResult, bonusRepXP: goodFormReps }, totalReps, avgForm };
  }

  async getMySessions(userId: string) {
    return this.prisma.gymSession.findMany({
      where: { userId },
      include: {
        exerciseSets: { include: { exercise: { select: { nameCs: true } } } },
        workoutPlan: { select: { nameCs: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.gymSession.findUnique({
      where: { id: sessionId },
      include: { exerciseSets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
