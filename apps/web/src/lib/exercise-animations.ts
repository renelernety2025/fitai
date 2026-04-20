/**
 * Maps exercise names to their animation files (Mixamo FBX).
 * Loaded via FBXLoader at runtime. Exercises without mapping
 * show a static model.
 */

export interface AnimationMapping {
  clipPath: string;
  speed: number;
}

export const EXERCISE_ANIMATIONS: Record<string, AnimationMapping> = {
  'barbell squat': { clipPath: '/models/animations/squat.fbx', speed: 0.4 },
};

/** Get animation for an exercise (case-insensitive). */
export function getAnimationForExercise(
  exerciseName: string,
): AnimationMapping | null {
  return EXERCISE_ANIMATIONS[exerciseName.toLowerCase()] ?? null;
}
