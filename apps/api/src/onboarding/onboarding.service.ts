import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Estimate 1RM (One Rep Max) using Epley formula:
 * 1RM = weight × (1 + reps/30)
 * Most accurate for 2-10 rep range.
 */
function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate working weight as percentage of 1RM:
 * - Strength: 80-90% (3-6 reps)
 * - Hypertrophy: 65-80% (6-12 reps)
 * - Endurance: 50-65% (12-20 reps)
 */
function workingWeightFromGoal(oneRM: number, goal: string): { weight: number; reps: number } {
  switch (goal) {
    case 'STRENGTH':
      return { weight: Math.round(oneRM * 0.85 / 2.5) * 2.5, reps: 5 };
    case 'HYPERTROPHY':
      return { weight: Math.round(oneRM * 0.72 / 2.5) * 2.5, reps: 10 };
    case 'ENDURANCE':
      return { weight: Math.round(oneRM * 0.6 / 2.5) * 2.5, reps: 15 };
    default:
      return { weight: Math.round(oneRM * 0.65 / 2.5) * 2.5, reps: 12 };
  }
}

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  // ── Status ──
  async getStatus(userId: string) {
    const profile = await this.prisma.fitnessProfile.findUnique({
      where: { userId },
      include: { oneRepMax: { include: { profile: false } } as any },
    });

    if (!profile) {
      return {
        completed: false,
        step: 'profile',
        nextAction: 'Začni s vytvořením svého fitness profilu.',
      };
    }

    if (!profile.onboardingDone) {
      // Determine which step is next
      if (!profile.age || !profile.weightKg || !profile.heightCm) {
        return { completed: false, step: 'measurements', nextAction: 'Doplň věk, váhu a výšku.' };
      }
      const oneRMs = await this.prisma.oneRepMax.findMany({ where: { profileId: profile.id } });
      if (oneRMs.length === 0) {
        return { completed: false, step: 'fitness_test', nextAction: 'Změř svoje 1RM (maximální váhu) pro hlavní cviky.' };
      }
      return { completed: false, step: 'finalize', nextAction: 'Dokonči onboarding a začni cvičit.' };
    }

    return { completed: true, step: 'done', nextAction: null };
  }

  // ── Step 1: Save measurements ──
  async saveMeasurements(userId: string, data: { age: number; weightKg: number; heightCm: number }) {
    const profile = await this.prisma.fitnessProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    return profile;
  }

  // ── Step 2: Submit fitness test results ──
  async submitFitnessTest(userId: string, results: { exerciseId: string; weight: number; reps: number }[]) {
    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found. Complete profile first.');

    const created = [];
    for (const r of results) {
      const oneRM = estimate1RM(r.weight, r.reps);
      const record = await this.prisma.oneRepMax.upsert({
        where: { profileId_exerciseId: { profileId: profile.id, exerciseId: r.exerciseId } },
        update: {
          estimatedKg: oneRM,
          testReps: r.reps,
          testWeight: r.weight,
          source: 'tested',
        },
        create: {
          profileId: profile.id,
          exerciseId: r.exerciseId,
          estimatedKg: oneRM,
          testReps: r.reps,
          testWeight: r.weight,
          source: 'tested',
        },
      });
      created.push(record);
    }
    return created;
  }

  // ── Step 3: Manual 1RM entry (for advanced users who already know their max) ──
  async setManualOneRM(userId: string, exerciseId: string, oneRMKg: number) {
    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.oneRepMax.upsert({
      where: { profileId_exerciseId: { profileId: profile.id, exerciseId } },
      update: { estimatedKg: oneRMKg, testReps: 1, testWeight: oneRMKg, source: 'manual' },
      create: {
        profileId: profile.id,
        exerciseId,
        estimatedKg: oneRMKg,
        testReps: 1,
        testWeight: oneRMKg,
        source: 'manual',
      },
    });
  }

  // ── Step 4: Complete onboarding ──
  async complete(userId: string) {
    return this.prisma.fitnessProfile.update({
      where: { userId },
      data: { onboardingDone: true },
    });
  }

  // ── Get suggested working weights based on goal + 1RM ──
  async getSuggestedWeights(userId: string) {
    const profile = await this.prisma.fitnessProfile.findUnique({
      where: { userId },
      include: { oneRepMax: true },
    });
    if (!profile) return [];

    const exerciseIds = profile.oneRepMax.map((o) => o.exerciseId);
    const exercises = await this.prisma.exercise.findMany({ where: { id: { in: exerciseIds } } });
    const exMap = new Map(exercises.map((e) => [e.id, e]));

    return profile.oneRepMax.map((orm) => {
      const ex = exMap.get(orm.exerciseId);
      const ww = workingWeightFromGoal(orm.estimatedKg, profile.goal);
      // For first week, start at 60% of recommended (gentle ramp)
      const firstWeekWeight = Math.round(ww.weight * 0.6 / 2.5) * 2.5;
      return {
        exerciseId: orm.exerciseId,
        exerciseName: ex?.nameCs ?? 'Unknown',
        oneRMKg: orm.estimatedKg,
        recommendedWorkingWeight: ww.weight,
        recommendedReps: ww.reps,
        firstWeekWeight,
      };
    });
  }

  // ── Get test exercises (compound only) ──
  async getTestExercises() {
    return this.prisma.exercise.findMany({
      where: { category: 'compound' },
      select: { id: true, name: true, nameCs: true, muscleGroups: true, category: true },
    });
  }
}
