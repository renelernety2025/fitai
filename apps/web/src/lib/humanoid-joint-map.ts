/**
 * Maps FitAI joint names to GLTF skeleton bone names (Mixamo rig).
 * Single adaptation point — if the 3D model changes, update only this file.
 */

export interface BoneMapping {
  boneName: string;
  axis: 'x' | 'y' | 'z';
  restAngle: number;
  direction: 1 | -1;
}

/**
 * FitAI joint → Mixamo bone mapping.
 * restAngle = angle when bone is at T-pose (fully extended).
 * direction = sign for rotation (flexion direction).
 */
export const HUMANOID_JOINT_MAP: Record<string, BoneMapping> = {
  left_knee: {
    boneName: 'mixamorig:LeftLeg',
    axis: 'x',
    restAngle: 180,
    direction: 1,
  },
  right_knee: {
    boneName: 'mixamorig:RightLeg',
    axis: 'x',
    restAngle: 180,
    direction: 1,
  },
  left_hip: {
    boneName: 'mixamorig:LeftUpLeg',
    axis: 'x',
    restAngle: 180,
    direction: -1,
  },
  right_hip: {
    boneName: 'mixamorig:RightUpLeg',
    axis: 'x',
    restAngle: 180,
    direction: -1,
  },
  left_elbow: {
    boneName: 'mixamorig:LeftForeArm',
    axis: 'x',
    restAngle: 180,
    direction: -1,
  },
  right_elbow: {
    boneName: 'mixamorig:RightForeArm',
    axis: 'x',
    restAngle: 180,
    direction: 1,
  },
  left_shoulder: {
    boneName: 'mixamorig:LeftArm',
    axis: 'x',
    restAngle: 180,
    direction: -1,
  },
  right_shoulder: {
    boneName: 'mixamorig:RightArm',
    axis: 'x',
    restAngle: 180,
    direction: 1,
  },
  left_ankle: {
    boneName: 'mixamorig:LeftFoot',
    axis: 'x',
    restAngle: 90,
    direction: -1,
  },
};

/** Mirror mapping: left joint → right joint name */
export const MIRROR_MAP: Record<string, string> = {
  left_knee: 'right_knee',
  left_hip: 'right_hip',
  left_elbow: 'right_elbow',
  left_shoulder: 'right_shoulder',
  left_ankle: 'right_ankle',
};
