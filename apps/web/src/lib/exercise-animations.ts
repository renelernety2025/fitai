/**
 * Maps exercise names to Mixamo FBX animation files.
 *
 * Architecture:
 * - Character model (GLB with skin): /models/characters/default.glb
 * - Animation clips (FBX): /models/animations/exercises/*.fbx
 * - AnimationMixer retargets FBX bones onto character automatically
 *
 * To add: drop FBX in public/models/animations/exercises/, add mapping below.
 */

export interface AnimationMapping {
  clipPath: string;
  speed: number;
}

const BASE = '/models/animations/exercises';

/**
 * Exercise name (lowercase) → animation file.
 * Matched against Exercise.name from DB.
 */
export const EXERCISE_ANIMATIONS: Record<string, AnimationMapping> = {
  // ── Squats ──
  'barbell squat': { clipPath: `${BASE}/Back Squat.fbx`, speed: 0.5 },
  'bodyweight squat': { clipPath: `${BASE}/Air Squat.fbx`, speed: 0.5 },
  'front squat': { clipPath: `${BASE}/Overhead Squat.fbx`, speed: 0.5 },
  'pistol squat': { clipPath: `${BASE}/Air Squat.fbx`, speed: 0.4 },
  'goblet squat': { clipPath: `${BASE}/Air Squat.fbx`, speed: 0.5 },

  // ── Push ──
  'push-up': { clipPath: `${BASE}/Push Up To Idle.fbx`, speed: 0.5 },
  'decline push-up': { clipPath: `${BASE}/Push Up To Idle.fbx`, speed: 0.5 },
  'pike push-up': { clipPath: `${BASE}/Push Up To Idle.fbx`, speed: 0.4 },
  'jump push up': { clipPath: `${BASE}/Jump Push Up.fbx`, speed: 0.5 },

  // ── Core ──
  'plank': { clipPath: `${BASE}/Start Plank.fbx`, speed: 0.3 },
  'burpees': { clipPath: `${BASE}/Burpee End.fbx`, speed: 0.5 },
  'jumping jacks': { clipPath: `${BASE}/Jumping Jacks.fbx`, speed: 0.6 },
  'mountain climbers': { clipPath: `${BASE}/Start Plank.fbx`, speed: 0.5 },
  'bicycle crunch': { clipPath: `${BASE}/Bicycle Crunch.fbx`, speed: 0.5 },
  'russian twist': { clipPath: `${BASE}/Circle Crunch.fbx`, speed: 0.5 },
  'dead bug': { clipPath: `${BASE}/Situps.fbx`, speed: 0.4 },
  'hanging leg raise': { clipPath: `${BASE}/Situps.fbx`, speed: 0.4 },

  // ── Olympic / Functional ──
  'clean and press': { clipPath: `${BASE}/Snatch.fbx`, speed: 0.4 },
  'thruster': { clipPath: `${BASE}/Sumo High Pull.fbx`, speed: 0.5 },
  'turkish get-up': { clipPath: `${BASE}/Kip Up.fbx`, speed: 0.3 },
  'kettlebell swing': { clipPath: `${BASE}/Kettlebell Swing.fbx`, speed: 0.5 },

  // ── Cardio / Athletic ──
  'bear crawl': { clipPath: `${BASE}/Long Step Forward.fbx`, speed: 0.5 },
  'box jump': { clipPath: `${BASE}/Box Jump.fbx`, speed: 0.5 },
};

/** Get animation mapping for exercise (case-insensitive). */
export function getAnimationForExercise(
  exerciseName: string,
): AnimationMapping | null {
  return EXERCISE_ANIMATIONS[exerciseName.toLowerCase()] ?? null;
}

/**
 * Available animation categories for future expansion.
 * These FBX files exist in /models/animations/exercises/ but aren't
 * mapped to FitAI exercises yet. Can be used for new training modes.
 *
 * COMBAT: Hook, Jab Cross, Body Jab Cross, Lead Jab, MMA Kick,
 *         Illegal Elbow Punch, Illegal Knee, Center Block, Left Block,
 *         Right Block, Big Hit To Head, Big Kidney Hit, Big Side Hit,
 *         Kidney Hit, Head Hit, Hit To Body, Livershot Knockdown,
 *         Receiving An Uppercut, Double Leg Takedown
 *
 * GOLF: Golf Drive, Golf Chip, Golf Putt, Golf Pre-Putt, Golf Bad Shot
 *
 * SOCCER: Header Soccerball, Soccer Header, Soccer Trip, Dribble,
 *         Goalkeeper Catch, Goalkeeper Diving Save, Goalkeeper Drop Kick,
 *         Goalkeeper Scoop, Goalkeeper Sidestep
 *
 * BASEBALL: Baseball Hit, Baseball Bunt, Baseball Walk Out
 *
 * FOOTBALL: Quarterback Pass, Receiver Catch
 *
 * SWIMMING: Swimming, Treading Water
 *
 * MOVEMENT: Cartwheel, Jog Backward Diagonal, Walking Backwards,
 *           Short Side Steps, Medium/Long Step Forward
 */
