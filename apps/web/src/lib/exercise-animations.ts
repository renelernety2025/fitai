/**
 * Maps exercise names to Mixamo FBX animation files.
 *
 * Architecture:
 * - Character model (GLB with skin) lives in /models/characters/
 * - Animation clips (FBX without skin) live in /models/animations/{category}/
 * - AnimationMixer retargets FBX bones onto character automatically
 *   (both use Mixamo rig → bone names match)
 *
 * To add a new animation:
 * 1. Download FBX from Mixamo/Plask/Rokoko (Without Skin, 30fps)
 * 2. Save to public/models/animations/{category}/{name}.fbx
 * 3. Add mapping below
 * 4. git push → auto-deploy
 */

export interface AnimationMapping {
  clipPath: string;
  speed: number;
}

const BASE = '/models/animations/exercises';

export const EXERCISE_ANIMATIONS: Record<string, AnimationMapping> = {
  'barbell squat': { clipPath: `${BASE}/squat.fbx`, speed: 0.5 },
  'goblet squat': { clipPath: `${BASE}/squat.fbx`, speed: 0.5 },
  'front squat': { clipPath: `${BASE}/overhead-squat.fbx`, speed: 0.5 },
  'overhead squat': { clipPath: `${BASE}/overhead-squat.fbx`, speed: 0.5 },
};

/** Get animation mapping for exercise (case-insensitive). */
export function getAnimationForExercise(
  exerciseName: string,
): AnimationMapping | null {
  return EXERCISE_ANIMATIONS[exerciseName.toLowerCase()] ?? null;
}
