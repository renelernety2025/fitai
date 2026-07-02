/**
 * Estimate 1RM (One Rep Max) using Epley formula:
 * 1RM = weight × (1 + reps/30)
 * Most accurate for 2-10 rep range.
 */
export function estimate1RM(weight: number, reps: number): number {
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
export function workingWeightFromGoal(oneRM: number, goal: string): { weight: number; reps: number } {
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
