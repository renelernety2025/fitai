/**
 * Maps FitAI MuscleGroup enum values to Mixamo bone names
 * that influence the corresponding body region.
 * Used for highlighting active muscles on the 3D model.
 */

export const MUSCLE_BONE_MAP: Record<string, string[]> = {
  QUADRICEPS: ['mixamorig_LeftUpLeg', 'mixamorig_RightUpLeg'],
  HAMSTRINGS: ['mixamorig_LeftUpLeg', 'mixamorig_RightUpLeg'],
  GLUTES: ['mixamorig_Hips'],
  CALVES: ['mixamorig_LeftLeg', 'mixamorig_RightLeg'],
  CHEST: ['mixamorig_Spine1', 'mixamorig_Spine2'],
  BACK: ['mixamorig_Spine', 'mixamorig_Spine1'],
  SHOULDERS: [
    'mixamorig_LeftShoulder', 'mixamorig_RightShoulder',
    'mixamorig_LeftArm', 'mixamorig_RightArm',
  ],
  BICEPS: ['mixamorig_LeftForeArm', 'mixamorig_RightForeArm'],
  TRICEPS: ['mixamorig_LeftArm', 'mixamorig_RightArm'],
  CORE: ['mixamorig_Spine', 'mixamorig_Hips'],
  FULL_BODY: [
    'mixamorig_Spine', 'mixamorig_Spine1', 'mixamorig_Spine2',
    'mixamorig_LeftUpLeg', 'mixamorig_RightUpLeg',
    'mixamorig_LeftArm', 'mixamorig_RightArm',
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
