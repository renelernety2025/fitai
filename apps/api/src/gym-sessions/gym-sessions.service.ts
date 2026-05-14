import { Injectable, Logger, Optional, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { LeaguesService } from '../leagues/leagues.service';
import { SeasonsService } from '../seasons/seasons.service';
import { SkillTreeService } from '../skill-tree/skill-tree.service';
import { StartGymSessionDto } from './dto/start-gym-session.dto';
import { CompleteSetDto } from './dto/complete-set.dto';

@Injectable()
export class GymSessionsService {
  private readonly logger = new Logger(GymSessionsService.name);

  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
    @Optional() private leaguesService: LeaguesService,
    @Optional() private seasonsService: SeasonsService,
    @Optional() private skillTreeService: SkillTreeService,
  ) {}

  async startSession(userId: string, dto: StartGymSessionDto) {
    // Create gym session
    const gymSession = await this.prisma.gymSession.create({
      data: {
        userId,
        workoutPlanId: dto.workoutPlanId,
        workoutDayIndex: dto.workoutDayIndex,
        coachPersonality: dto.coachPersonality ?? 'MOTIVATIONAL',
      },
    });

    // Create linked WorkoutSession for XP tracking
    await this.prisma.workoutSession.create({
      data: { userId, gymSessionId: gymSession.id },
    });

    // Pre-populate sets from plan or ad-hoc
    // Compound exercises get 2 warmup sets (50% and 75% of target weight)
    if (dto.workoutPlanId && dto.workoutDayIndex !== undefined) {
      const day = await this.prisma.workoutDay.findFirst({
        where: { workoutPlanId: dto.workoutPlanId, dayIndex: dto.workoutDayIndex },
        include: { plannedExercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } },
      });
      if (day) {
        // Sort: compound first, then accessory, then isolation
        const sorted = [...day.plannedExercises].sort((a, b) => {
          const order: Record<string, number> = { compound: 0, accessory: 1, isolation: 2 };
          return (order[a.exercise.category] ?? 1) - (order[b.exercise.category] ?? 1);
        });

        for (const pe of sorted) {
          let setNum = 1;
          // Warmup sets for compound exercises with weight
          if (pe.exercise.category === 'compound' && pe.targetWeight && pe.targetWeight > 20) {
            await this.prisma.exerciseSet.create({
              data: {
                gymSessionId: gymSession.id,
                exerciseId: pe.exerciseId,
                setNumber: setNum++,
                targetReps: 15,
                targetWeight: Math.round(pe.targetWeight * 0.5),
                isWarmup: true,
              },
            });
            await this.prisma.exerciseSet.create({
              data: {
                gymSessionId: gymSession.id,
                exerciseId: pe.exerciseId,
                setNumber: setNum++,
                targetReps: 8,
                targetWeight: Math.round(pe.targetWeight * 0.75),
                isWarmup: true,
              },
            });
          }
          // Working sets
          for (let s = 1; s <= pe.targetSets; s++) {
            await this.prisma.exerciseSet.create({
              data: {
                gymSessionId: gymSession.id,
                exerciseId: pe.exerciseId,
                setNumber: setNum++,
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

    const set = await this.prisma.exerciseSet.findUnique({ where: { id: dto.setId } });
    if (!set || set.gymSessionId !== sessionId) {
      throw new ForbiddenException('Set does not belong to this session');
    }

    return this.prisma.exerciseSet.update({
      where: { id: dto.setId },
      data: {
        actualReps: dto.actualReps,
        actualWeight: dto.actualWeight,
        formScore: dto.formScore,
        repData: dto.repData,
        rpe: (dto as any).rpe,
        tempoSeconds: (dto as any).tempoSeconds,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  async getMyWeeklyVolume(userId: string) {
    const now = new Date();
    const day = now.getDay() || 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day + 1);
    weekStart.setHours(0, 0, 0, 0);

    const volumes = await this.prisma.weeklyVolume.findMany({
      where: { userId, weekStart },
      orderBy: { totalVolumeKg: 'desc' },
    });

    // Recommended sets per muscle group per week (8-20 for hypertrophy)
    const RECOMMENDED = { min: 10, max: 20 };

    return volumes.map((v) => ({
      muscleGroup: v.muscleGroup,
      sets: v.totalSets,
      reps: v.totalReps,
      volumeKg: Math.round(v.totalVolumeKg),
      status:
        v.totalSets < RECOMMENDED.min
          ? 'undertrained'
          : v.totalSets > RECOMMENDED.max
          ? 'overtrained'
          : 'optimal',
      recommended: RECOMMENDED,
    }));
  }

  /** Update WeeklyVolume aggregate for the user based on completed sets */
  private async updateWeeklyVolume(userId: string, sets: any[]) {
    const exerciseIds = [...new Set(sets.map((s) => s.exerciseId))];
    const exercises = await this.prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true, muscleGroups: true },
    });
    const exMap = new Map(exercises.map((e) => [e.id, e.muscleGroups]));

    // Get start of current week (Monday)
    const now = new Date();
    const day = now.getDay() || 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day + 1);
    weekStart.setHours(0, 0, 0, 0);

    // Aggregate sets per muscle group
    const volume = new Map<string, { sets: number; reps: number; volumeKg: number }>();
    for (const set of sets) {
      if (set.status !== 'COMPLETED' || set.isWarmup) continue;
      const muscles = exMap.get(set.exerciseId) || [];
      for (const muscle of muscles) {
        const existing = volume.get(muscle as string) || { sets: 0, reps: 0, volumeKg: 0 };
        existing.sets += 1;
        existing.reps += set.actualReps;
        existing.volumeKg += set.actualReps * (set.actualWeight ?? 0);
        volume.set(muscle as string, existing);
      }
    }

    // Upsert volume rows
    for (const [muscle, v] of volume) {
      await this.prisma.weeklyVolume.upsert({
        where: { userId_weekStart_muscleGroup: { userId, weekStart, muscleGroup: muscle } },
        update: {
          totalSets: { increment: v.sets },
          totalReps: { increment: v.reps },
          totalVolumeKg: { increment: v.volumeKg },
        },
        create: {
          userId,
          weekStart,
          muscleGroup: muscle,
          totalSets: v.sets,
          totalReps: v.reps,
          totalVolumeKg: v.volumeKg,
        },
      });
    }
  }

  async endSession(sessionId: string, userId: string) {
    const session = await this.prisma.gymSession.findUnique({
      where: { id: sessionId },
      include: { exerciseSets: true, workoutSession: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();
    if (session.completedAt) return session;

    const completedSets = session.exerciseSets.filter((s) => s.status === 'COMPLETED');

    // Update weekly volume aggregates
    await this.updateWeeklyVolume(userId, completedSets);

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

    // Gamification fan-out (fire-and-forget, never blocks response)
    const xpGained = progressResult?.xpGained || 0;
    if (this.leaguesService) {
      this.leaguesService.addXP(userId, xpGained).catch(e => this.logger.warn(`League XP: ${e.message}`));
    }
    if (this.seasonsService) {
      this.seasonsService.checkMissions(userId).catch(e => this.logger.warn(`Season missions: ${e.message}`));
    }
    if (this.skillTreeService) {
      this.skillTreeService.checkAndUnlock(userId).catch(e => this.logger.warn(`Skill tree: ${e.message}`));
    }

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

  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.gymSession.findUnique({
      where: { id: sessionId },
      include: { exerciseSets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Not your session');
    return session;
  }

  async getShareCard(sessionId: string) {
    const session = await this.prisma.gymSession.findUnique({
      where: { id: sessionId },
      include: {
        exerciseSets: { include: { exercise: true } },
        workoutPlan: { select: { nameCs: true } },
        user: { select: { name: true } },
        workoutSession: true,
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    const completed = session.exerciseSets.filter(
      (s) => s.status === 'COMPLETED' && !s.isWarmup,
    );
    const totalReps = completed.reduce((s, x) => s + x.actualReps, 0);
    const avgForm = completed.length
      ? Math.round(
          completed.reduce((s, x) => s + x.formScore, 0) / completed.length,
        )
      : 0;

    const prs = this.detectSessionPRs(completed);
    const xpEarned = await this.estimateXP(session);
    const duration = session.durationSeconds
      ? `${Math.floor(session.durationSeconds / 60)}:${String(session.durationSeconds % 60).padStart(2, '0')}`
      : '0:00';

    return {
      workoutName: session.workoutPlan?.nameCs ?? 'Quick Workout',
      duration,
      totalReps,
      avgForm,
      xpEarned,
      prs,
      date: session.startedAt.toISOString(),
      userName: session.user?.name ?? 'FitAI User',
    };
  }

  private detectSessionPRs(
    sets: Array<{ exerciseId: string; actualWeight: number | null; actualReps: number; exercise: { nameCs: string } }>,
  ) {
    const bestByExercise = new Map<string, { name: string; weight: number }>();
    for (const s of sets) {
      const w = s.actualWeight ?? 0;
      const prev = bestByExercise.get(s.exerciseId);
      if (!prev || w > prev.weight) {
        bestByExercise.set(s.exerciseId, {
          name: s.exercise.nameCs,
          weight: w,
        });
      }
    }
    return Array.from(bestByExercise.values())
      .filter((p) => p.weight > 0)
      .slice(0, 3)
      .map((p) => ({
        exercise: p.name,
        value: `${p.weight} kg`,
      }));
  }

  private async estimateXP(session: any): Promise<number> {
    const minutes = (session.durationSeconds ?? 0) / 60;
    let xp = Math.round(minutes * 10);
    const completed = (session.exerciseSets || []).filter(
      (s: any) => s.status === 'COMPLETED',
    );
    const avgForm = completed.length
      ? completed.reduce((s: number, x: any) => s + x.formScore, 0) / completed.length
      : 0;
    if (avgForm >= 80) xp += 20;
    return xp;
  }
}
