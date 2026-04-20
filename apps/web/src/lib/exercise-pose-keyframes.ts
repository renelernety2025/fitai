/**
 * Full-body pose keyframes for exercise animation.
 * Used as fallback when no Mixamo animation clip is available.
 *
 * Each exercise defines 4 phases with complete joint angles.
 * Joint names reference HUMANOID_JOINT_MAP keys.
 * Values are target angles (degrees) — the system computes
 * delta rotation from rest pose automatically.
 *
 * Convention: 180 = fully extended (rest), lower = more flexion.
 */

interface PoseKeyframe {
  [jointName: string]: number;
}

interface ExerciseKeyframes {
  START: PoseKeyframe;
  ECCENTRIC: PoseKeyframe;
  HOLD: PoseKeyframe;
  CONCENTRIC: PoseKeyframe;
}

/** Standing base pose — arms at sides, standing straight. */
const STANDING: PoseKeyframe = {
  left_knee: 175, right_knee: 175,
  left_hip: 175, right_hip: 175,
  left_elbow: 170, right_elbow: 170,
  left_shoulder: 175, right_shoulder: 175,
  spine_lower: 178, spine_mid: 178, spine_upper: 178,
  neck: 175, head: 175,
};

export const EXERCISE_KEYFRAMES: Record<string, ExerciseKeyframes> = {
  'barbell squat': {
    START: {
      ...STANDING,
      left_shoulder: 120, right_shoulder: 120,
      left_elbow: 80, right_elbow: 80,
    },
    ECCENTRIC: {
      left_knee: 130, right_knee: 130,
      left_hip: 130, right_hip: 130,
      left_ankle: 75, right_ankle: 75,
      spine_lower: 165, spine_mid: 170, spine_upper: 172,
      left_shoulder: 120, right_shoulder: 120,
      left_elbow: 80, right_elbow: 80,
      neck: 170, head: 168,
    },
    HOLD: {
      left_knee: 85, right_knee: 85,
      left_hip: 80, right_hip: 80,
      left_ankle: 65, right_ankle: 65,
      spine_lower: 155, spine_mid: 160, spine_upper: 165,
      left_shoulder: 115, right_shoulder: 115,
      left_elbow: 80, right_elbow: 80,
      neck: 165, head: 160,
    },
    CONCENTRIC: {
      left_knee: 130, right_knee: 130,
      left_hip: 130, right_hip: 130,
      left_ankle: 75, right_ankle: 75,
      spine_lower: 165, spine_mid: 170, spine_upper: 172,
      left_shoulder: 120, right_shoulder: 120,
      left_elbow: 80, right_elbow: 80,
      neck: 170, head: 168,
    },
  },

  'bench press': {
    START: {
      left_hip: 90, right_hip: 90,
      left_knee: 90, right_knee: 90,
      spine_lower: 170, spine_mid: 175,
      left_shoulder: 90, right_shoulder: 90,
      left_elbow: 170, right_elbow: 170,
    },
    ECCENTRIC: {
      left_hip: 90, right_hip: 90,
      left_knee: 90, right_knee: 90,
      spine_lower: 170, spine_mid: 175,
      left_shoulder: 90, right_shoulder: 90,
      left_elbow: 120, right_elbow: 120,
    },
    HOLD: {
      left_hip: 90, right_hip: 90,
      left_knee: 90, right_knee: 90,
      spine_lower: 168, spine_mid: 173,
      left_shoulder: 85, right_shoulder: 85,
      left_elbow: 75, right_elbow: 75,
    },
    CONCENTRIC: {
      left_hip: 90, right_hip: 90,
      left_knee: 90, right_knee: 90,
      spine_lower: 170, spine_mid: 175,
      left_shoulder: 90, right_shoulder: 90,
      left_elbow: 120, right_elbow: 120,
    },
  },

  'deadlift': {
    START: { ...STANDING },
    ECCENTRIC: {
      left_hip: 120, right_hip: 120,
      left_knee: 140, right_knee: 140,
      spine_lower: 145, spine_mid: 155, spine_upper: 165,
      left_shoulder: 170, right_shoulder: 170,
      left_elbow: 175, right_elbow: 175,
      neck: 160, head: 155,
    },
    HOLD: {
      left_hip: 90, right_hip: 90,
      left_knee: 120, right_knee: 120,
      spine_lower: 130, spine_mid: 140, spine_upper: 155,
      left_shoulder: 170, right_shoulder: 170,
      left_elbow: 175, right_elbow: 175,
      neck: 150, head: 145,
    },
    CONCENTRIC: {
      left_hip: 120, right_hip: 120,
      left_knee: 140, right_knee: 140,
      spine_lower: 145, spine_mid: 155, spine_upper: 165,
      left_shoulder: 170, right_shoulder: 170,
      left_elbow: 175, right_elbow: 175,
      neck: 160, head: 155,
    },
  },

  'overhead press': {
    START: {
      ...STANDING,
      left_shoulder: 90, right_shoulder: 90,
      left_elbow: 90, right_elbow: 90,
    },
    ECCENTRIC: {
      ...STANDING,
      left_shoulder: 60, right_shoulder: 60,
      left_elbow: 120, right_elbow: 120,
      spine_lower: 175, spine_upper: 175,
    },
    HOLD: {
      ...STANDING,
      left_shoulder: 20, right_shoulder: 20,
      left_elbow: 170, right_elbow: 170,
      spine_lower: 173, spine_upper: 175,
    },
    CONCENTRIC: {
      ...STANDING,
      left_shoulder: 60, right_shoulder: 60,
      left_elbow: 120, right_elbow: 120,
      spine_lower: 175, spine_upper: 175,
    },
  },

  'bicep curl': {
    START: { ...STANDING, left_elbow: 170, right_elbow: 170 },
    ECCENTRIC: { ...STANDING, left_elbow: 120, right_elbow: 120 },
    HOLD: { ...STANDING, left_elbow: 40, right_elbow: 40 },
    CONCENTRIC: { ...STANDING, left_elbow: 120, right_elbow: 120 },
  },

  'barbell row': {
    START: {
      left_hip: 130, right_hip: 130,
      left_knee: 155, right_knee: 155,
      spine_lower: 135, spine_mid: 145, spine_upper: 160,
      left_shoulder: 170, right_shoulder: 170,
      left_elbow: 170, right_elbow: 170,
      neck: 155, head: 150,
    },
    ECCENTRIC: {
      left_hip: 130, right_hip: 130,
      left_knee: 155, right_knee: 155,
      spine_lower: 135, spine_mid: 145, spine_upper: 160,
      left_shoulder: 160, right_shoulder: 160,
      left_elbow: 140, right_elbow: 140,
      neck: 155, head: 150,
    },
    HOLD: {
      left_hip: 130, right_hip: 130,
      left_knee: 155, right_knee: 155,
      spine_lower: 138, spine_mid: 148, spine_upper: 162,
      left_shoulder: 140, right_shoulder: 140,
      left_elbow: 80, right_elbow: 80,
      neck: 158, head: 152,
    },
    CONCENTRIC: {
      left_hip: 130, right_hip: 130,
      left_knee: 155, right_knee: 155,
      spine_lower: 135, spine_mid: 145, spine_upper: 160,
      left_shoulder: 160, right_shoulder: 160,
      left_elbow: 140, right_elbow: 140,
      neck: 155, head: 150,
    },
  },

  'lunges': {
    START: { ...STANDING },
    ECCENTRIC: {
      left_hip: 130, left_knee: 130, left_ankle: 80,
      right_hip: 150, right_knee: 150,
      spine_lower: 175, spine_mid: 177, spine_upper: 178,
      neck: 175, head: 175,
    },
    HOLD: {
      left_hip: 90, left_knee: 90, left_ankle: 70,
      right_hip: 160, right_knee: 100,
      spine_lower: 175, spine_mid: 177, spine_upper: 178,
      neck: 175, head: 175,
    },
    CONCENTRIC: {
      left_hip: 130, left_knee: 130, left_ankle: 80,
      right_hip: 150, right_knee: 150,
      spine_lower: 175, spine_mid: 177, spine_upper: 178,
      neck: 175, head: 175,
    },
  },

  'lateral raise': {
    START: { ...STANDING, left_elbow: 165, right_elbow: 165 },
    ECCENTRIC: {
      ...STANDING,
      left_shoulder_z: 135, right_shoulder_z: 135,
      left_elbow: 160, right_elbow: 160,
    },
    HOLD: {
      ...STANDING,
      left_shoulder_z: 90, right_shoulder_z: 90,
      left_elbow: 160, right_elbow: 160,
    },
    CONCENTRIC: {
      ...STANDING,
      left_shoulder_z: 135, right_shoulder_z: 135,
      left_elbow: 160, right_elbow: 160,
    },
  },

  'plank': {
    START: {
      left_hip: 90, right_hip: 90,
      left_knee: 175, right_knee: 175,
      left_shoulder: 90, right_shoulder: 90,
      left_elbow: 90, right_elbow: 90,
      spine_lower: 178, spine_mid: 178, spine_upper: 178,
    },
    ECCENTRIC: {
      left_hip: 90, right_hip: 90,
      left_knee: 175, right_knee: 175,
      left_shoulder: 90, right_shoulder: 90,
      left_elbow: 90, right_elbow: 90,
      spine_lower: 178, spine_mid: 178, spine_upper: 178,
    },
    HOLD: {
      left_hip: 90, right_hip: 90,
      left_knee: 175, right_knee: 175,
      left_shoulder: 90, right_shoulder: 90,
      left_elbow: 90, right_elbow: 90,
      spine_lower: 178, spine_mid: 178, spine_upper: 178,
    },
    CONCENTRIC: {
      left_hip: 90, right_hip: 90,
      left_knee: 175, right_knee: 175,
      left_shoulder: 90, right_shoulder: 90,
      left_elbow: 90, right_elbow: 90,
      spine_lower: 178, spine_mid: 178, spine_upper: 178,
    },
  },

  'glute bridge': {
    START: {
      left_hip: 90, right_hip: 90,
      left_knee: 60, right_knee: 60,
      spine_lower: 178, spine_mid: 178,
    },
    ECCENTRIC: {
      left_hip: 110, right_hip: 110,
      left_knee: 65, right_knee: 65,
      spine_lower: 170, spine_mid: 175,
    },
    HOLD: {
      left_hip: 160, right_hip: 160,
      left_knee: 75, right_knee: 75,
      spine_lower: 165, spine_mid: 170,
    },
    CONCENTRIC: {
      left_hip: 110, right_hip: 110,
      left_knee: 65, right_knee: 65,
      spine_lower: 170, spine_mid: 175,
    },
  },
};

/**
 * Get full-body keyframes for an exercise.
 * Returns null if no keyframes defined — falls back to phase angle rules.
 */
export function getExerciseKeyframes(
  exerciseName: string,
): ExerciseKeyframes | null {
  return EXERCISE_KEYFRAMES[exerciseName.toLowerCase()] ?? null;
}
