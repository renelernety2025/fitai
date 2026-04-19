/**
 * Maps FitAI MuscleGroup enum values to Mixamo bone names
 * that influence the corresponding body region.
 * Used for highlighting active muscles on the 3D model.
 */

export const MUSCLE_BONE_MAP: Record<string, string[]> = {
  QUADRICEPS: ['mixamorigLeftUpLeg', 'mixamorigRightUpLeg'],
  HAMSTRINGS: ['mixamorigLeftUpLeg', 'mixamorigRightUpLeg'],
  GLUTES: ['mixamorigHips'],
  CALVES: ['mixamorigLeftLeg', 'mixamorigRightLeg'],
  CHEST: ['mixamorigSpine1', 'mixamorigSpine2'],
  BACK: ['mixamorigSpine', 'mixamorigSpine1'],
  SHOULDERS: [
    'mixamorigLeftShoulder', 'mixamorigRightShoulder',
    'mixamorigLeftArm', 'mixamorigRightArm',
  ],
  BICEPS: ['mixamorigLeftForeArm', 'mixamorigRightForeArm'],
  TRICEPS: ['mixamorigLeftArm', 'mixamorigRightArm'],
  CORE: ['mixamorigSpine', 'mixamorigHips'],
  FULL_BODY: [
    'mixamorigSpine', 'mixamorigSpine1', 'mixamorigSpine2',
    'mixamorigLeftUpLeg', 'mixamorigRightUpLeg',
    'mixamorigLeftArm', 'mixamorigRightArm',
  ],
};

/** Accent color for highlighted muscle regions. */
export const HIGHLIGHT_COLOR = 0xa8ff00;

/** Collect all bone names that should be highlighted for given muscle groups. */
export function getHighlightedBones(muscleGroups: string[]): Set<string> {
  const bones = new Set<string>();
  for (const group of muscleGroups) {
    const mapped = MUSCLE_BONE_MAP[group];
    if (mapped) mapped.forEach((b) => bones.add(b));
  }
  return bones;
}
