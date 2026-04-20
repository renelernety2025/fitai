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
  left_knee: { boneName: 'mixamorig:LeftLeg', axis: 'x', restAngle: 180, direction: 1 },
  right_knee: { boneName: 'mixamorig:RightLeg', axis: 'x', restAngle: 180, direction: 1 },
  left_hip: { boneName: 'mixamorig:LeftUpLeg', axis: 'x', restAngle: 180, direction: -1 },
  right_hip: { boneName: 'mixamorig:RightUpLeg', axis: 'x', restAngle: 180, direction: -1 },
  left_ankle: { boneName: 'mixamorig:LeftFoot', axis: 'x', restAngle: 90, direction: -1 },
  right_ankle: { boneName: 'mixamorig:RightFoot', axis: 'x', restAngle: 90, direction: -1 },

  // ── Arms ──
  left_elbow: { boneName: 'mixamorig:LeftForeArm', axis: 'x', restAngle: 180, direction: -1 },
  right_elbow: { boneName: 'mixamorig:RightForeArm', axis: 'x', restAngle: 180, direction: 1 },
  left_shoulder: { boneName: 'mixamorig:LeftArm', axis: 'x', restAngle: 180, direction: -1 },
  right_shoulder: { boneName: 'mixamorig:RightArm', axis: 'x', restAngle: 180, direction: 1 },
  // Shoulder abduction (arms out to side)
  left_shoulder_z: { boneName: 'mixamorig:LeftArm', axis: 'z', restAngle: 180, direction: 1 },
  right_shoulder_z: { boneName: 'mixamorig:RightArm', axis: 'z', restAngle: 180, direction: -1 },

  // ── Spine & Core ──
  spine_lower: { boneName: 'mixamorig:Spine', axis: 'x', restAngle: 180, direction: -1 },
  spine_mid: { boneName: 'mixamorig:Spine1', axis: 'x', restAngle: 180, direction: -1 },
  spine_upper: { boneName: 'mixamorig:Spine2', axis: 'x', restAngle: 180, direction: -1 },
  neck: { boneName: 'mixamorig:Neck', axis: 'x', restAngle: 180, direction: -1 },
  head: { boneName: 'mixamorig:Head', axis: 'x', restAngle: 180, direction: -1 },

  // ── Hips (root rotation) ──
  hips: { boneName: 'mixamorig:Hips', axis: 'x', restAngle: 180, direction: -1 },
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
