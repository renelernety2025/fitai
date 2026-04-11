/**
 * Shared user context builder — produces a normalized object that downstream
 * Claude-prompt builders (coaching, ai-insights, daily-brief, ...) can consume.
 *
 * The goal is to have ONE place where "what Claude knows about the user" is
 * assembled, so a gap in one module (e.g. coaching was ignoring `injuries`)
 * doesn't happen in another. Pure function — takes PrismaService + userId,
 * returns a structured context. No NestJS injection.
 */

import type { PrismaService } from '../prisma/prisma.service';

// Mirrors schema.prisma enum FitnessGoal. Kept as a local literal because
// the generated @prisma/client in this project does not re-export enum
// types (see pre-existing errors in ai-planner.service.ts etc.).
export type FitnessGoal =
  | 'STRENGTH'
  | 'HYPERTROPHY'
  | 'ENDURANCE'
  | 'WEIGHT_LOSS'
  | 'GENERAL_FITNESS'
  | 'MOBILITY';

export type SkillTier = 'novice' | 'intermediate' | 'advanced';

export interface UserPromptContext {
  /** User display name, falls back to 'Cvičenci' if missing. */
  name: string;
  /** Czech XP-derived level string: Začátečník / Pokročilý / Expert / Mistr / Legenda. */
  level: string;
  /** Normalized skill tier derived from both totalXP and FitnessProfile.experienceMonths. */
  skillTier: SkillTier;
  /** Total XP from UserProgress. */
  totalXP: number;
  /** Current consecutive-day streak. */
  currentStreak: number;
  /** Days since last workout, null if none yet. */
  daysSinceLastWorkout: number | null;

  // From FitnessProfile (may be null if onboarding not done)
  age: number | null;
  goal: FitnessGoal | null;
  experienceMonths: number;
  injuries: string[];
  priorityMuscles: string[];
  equipment: string[];
}

/**
 * Maps total XP to the Czech level label used throughout the app.
 * Kept in sync with UI copy — see apps/mobile/src/constants/levels.ts.
 */
function levelFromXP(totalXP: number): string {
  if (totalXP >= 2000) return 'Legenda';
  if (totalXP >= 1000) return 'Mistr';
  if (totalXP >= 500) return 'Expert';
  if (totalXP >= 200) return 'Pokročilý';
  return 'Začátečník';
}

/**
 * Normalize (totalXP, experienceMonths) into a coaching skill tier.
 * We use BOTH signals so a user with 300 XP but 24 months of experience
 * gets 'intermediate' (not 'novice'), and vice versa.
 */
function deriveSkillTier(totalXP: number, experienceMonths: number): SkillTier {
  const xpScore = totalXP >= 500 ? 2 : totalXP >= 200 ? 1 : 0;
  const expScore = experienceMonths >= 24 ? 2 : experienceMonths >= 6 ? 1 : 0;
  const combined = xpScore + expScore;
  if (combined >= 3) return 'advanced';
  if (combined >= 1) return 'intermediate';
  return 'novice';
}

/**
 * Build the shared user context for a Claude prompt.
 * Queries User + UserProgress + FitnessProfile in parallel.
 */
export async function buildUserPromptContext(
  prisma: PrismaService,
  userId: string,
): Promise<UserPromptContext> {
  const [user, progress, profile] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userProgress.findUnique({ where: { userId } }),
    prisma.fitnessProfile.findUnique({ where: { userId } }),
  ]);

  const totalXP = progress?.totalXP ?? 0;
  const experienceMonths = profile?.experienceMonths ?? 0;

  const daysSinceLastWorkout = progress?.lastWorkoutDate
    ? Math.floor((Date.now() - progress.lastWorkoutDate.getTime()) / 86_400_000)
    : null;

  return {
    // Czech singular vocative for a gender-neutral fallback — previous
    // "Cvičenci" was plural vocative and grammatically wrong.
    name: user?.name ?? 'klient',
    level: levelFromXP(totalXP),
    skillTier: deriveSkillTier(totalXP, experienceMonths),
    totalXP,
    currentStreak: progress?.currentStreak ?? 0,
    daysSinceLastWorkout,

    age: profile?.age ?? null,
    goal: profile?.goal ?? null,
    experienceMonths,
    injuries: profile?.injuries ?? [],
    priorityMuscles: profile?.priorityMuscles ?? [],
    equipment: profile?.equipment ?? [],
  };
}
