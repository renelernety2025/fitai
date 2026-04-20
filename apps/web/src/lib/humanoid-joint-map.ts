/**
 * Maps FitAI joint names to GLTF skeleton bone names (Mixamo rig).
 * Single adaptation point — if the 3D model changes, update only this file.
 *
 * Two categories:
 * 1. Validation joints (from exercise phases[] — used for pose detection)
 * 2. Visual joints (spine, neck, etc. — used only for 3D animation)
 */

export interface BoneMapping {
  boneName: string;
  axis: 'x' | 'y' | 'z';
  restAngle: number;
  direction: 1 | -1;
}

export const HUMANOID_JOINT_MAP: Record<string, BoneMapping> = {
  // ── Legs ──
  left_knee: { boneName: 'mixamorig_LeftLeg', axis: 'x', restAngle: 180, direction: 1 },
  right_knee: { boneName: 'mixamorig_RightLeg', axis: 'x', restAngle: 180, direction: 1 },
  left_hip: { boneName: 'mixamorig_LeftUpLeg', axis: 'x', restAngle: 180, direction: -1 },
  right_hip: { boneName: 'mixamorig_RightUpLeg', axis: 'x', restAngle: 180, direction: -1 },
  left_ankle: { boneName: 'mixamorig_LeftFoot', axis: 'x', restAngle: 90, direction: -1 },
  right_ankle: { boneName: 'mixamorig_RightFoot', axis: 'x', restAngle: 90, direction: -1 },

  // ── Arms ──
  left_elbow: { boneName: 'mixamorig_LeftForeArm', axis: 'x', restAngle: 180, direction: -1 },
  right_elbow: { boneName: 'mixamorig_RightForeArm', axis: 'x', restAngle: 180, direction: 1 },
  left_shoulder: { boneName: 'mixamorig_LeftArm', axis: 'x', restAngle: 180, direction: -1 },
  right_shoulder: { boneName: 'mixamorig_RightArm', axis: 'x', restAngle: 180, direction: 1 },
  // Shoulder abduction (arms out to side)
  left_shoulder_z: { boneName: 'mixamorig_LeftArm', axis: 'z', restAngle: 180, direction: 1 },
  right_shoulder_z: { boneName: 'mixamorig_RightArm', axis: 'z', restAngle: 180, direction: -1 },

  // ── Spine & Core ──
  spine_lower: { boneName: 'mixamorig_Spine', axis: 'x', restAngle: 180, direction: -1 },
  spine_mid: { boneName: 'mixamorig_Spine1', axis: 'x', restAngle: 180, direction: -1 },
  spine_upper: { boneName: 'mixamorig_Spine2', axis: 'x', restAngle: 180, direction: -1 },
  neck: { boneName: 'mixamorig_Neck', axis: 'x', restAngle: 180, direction: -1 },
  head: { boneName: 'mixamorig_Head', axis: 'x', restAngle: 180, direction: -1 },

  // ── Hips (root rotation) ──
  hips: { boneName: 'mixamorig_Hips', axis: 'x', restAngle: 180, direction: -1 },
};

/** Mirror mapping: left joint → right joint name */
export const MIRROR_MAP: Record<string, string> = {
  left_knee: 'right_knee',
  left_hip: 'right_hip',
  left_elbow: 'right_elbow',
  left_shoulder: 'right_shoulder',
  left_shoulder_z: 'right_shoulder_z',
  left_ankle: 'right_ankle',
};
