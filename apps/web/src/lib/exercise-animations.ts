/**
 * Maps exercise names to their Mixamo animation clip files.
 * Animations are stored as GLB in /models/animations/ and loaded on demand.
 *
 * Exercises without a dedicated animation fall back to the phase-based
 * bone rotation system (computed from angle rules).
 */

export interface AnimationMapping {
  /** Path to GLB animation file relative to /public */
  clipPath: string;
  /** Playback speed multiplier (1 = normal) */
  speed: number;
  /** Whether to loop the animation */
  loop: boolean;
}

/**
 * Map of exercise name (lowercase) → animation file.
 * Keys match Exercise.name from DB (case-insensitive).
 */
export const EXERCISE_ANIMATIONS: Record<string, AnimationMapping> = {
  'barbell squat': { clipPath: '/models/animations/squat.glb', speed: 0.5, loop: true },
  'deadlift': { clipPath: '/models/animations/deadlift.glb', speed: 0.5, loop: true },
  'bench press': { clipPath: '/models/animations/bench-press.glb', speed: 0.5, loop: true },
  'overhead press': { clipPath: '/models/animations/overhead-press.glb', speed: 0.5, loop: true },
  'barbell row': { clipPath: '/models/animations/row.glb', speed: 0.5, loop: true },
  'bicep curl': { clipPath: '/models/animations/curl.glb', speed: 0.5, loop: true },
  'lunges': { clipPath: '/models/animations/lunge.glb', speed: 0.5, loop: true },
  'push-up': { clipPath: '/models/animations/pushup.glb', speed: 0.5, loop: true },
  'plank': { clipPath: '/models/animations/plank.glb', speed: 0.3, loop: true },
  'lateral raise': { clipPath: '/models/animations/lateral-raise.glb', speed: 0.5, loop: true },
};

/** Check if an exercise has a dedicated Mixamo animation. */
export function getAnimationForExercise(
  exerciseName: string,
): AnimationMapping | null {
  return EXERCISE_ANIMATIONS[exerciseName.toLowerCase()] ?? null;
}
