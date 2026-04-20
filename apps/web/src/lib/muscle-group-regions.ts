/**
 * Maps FitAI MuscleGroup enum values to Mixamo bone names
 * that influence the corresponding body region.
 * Used for highlighting active muscles on the 3D model.
 */

export const MUSCLE_BONE_MAP: Record<string, string[]> = {
  QUADRICEPS: ['mixamorig:LeftUpLeg', 'mixamorig:RightUpLeg'],
  HAMSTRINGS: ['mixamorig:LeftUpLeg', 'mixamorig:RightUpLeg'],
  GLUTES: ['mixamorig:Hips'],
  CALVES: ['mixamorig:LeftLeg', 'mixamorig:RightLeg'],
  CHEST: ['mixamorig:Spine1', 'mixamorig:Spine2'],
  BACK: ['mixamorig:Spine', 'mixamorig:Spine1'],
  SHOULDERS: [
    'mixamorig:LeftShoulder', 'mixamorig:RightShoulder',
    'mixamorig:LeftArm', 'mixamorig:RightArm',
  ],
  BICEPS: ['mixamorig:LeftForeArm', 'mixamorig:RightForeArm'],
  TRICEPS: ['mixamorig:LeftArm', 'mixamorig:RightArm'],
  CORE: ['mixamorig:Spine', 'mixamorig:Hips'],
  FULL_BODY: [
    'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
    'mixamorig:LeftUpLeg', 'mixamorig:RightUpLeg',
    'mixamorig:LeftArm', 'mixamorig:RightArm',
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
