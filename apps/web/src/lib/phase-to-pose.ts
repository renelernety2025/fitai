/**
 * Converts exercise phase data into bone rotation targets.
 *
 * Two sources of pose data (in priority order):
 * 1. Full-body keyframes (exercise-pose-keyframes.ts) — complete poses for top exercises
 * 2. Phase angle rules (from API phases[].rules) — partial, used for detection + fallback
 */

import * as THREE from 'three';
import { HUMANOID_JOINT_MAP, MIRROR_MAP, type BoneMapping } from './humanoid-joint-map';
import { getExerciseKeyframes } from './exercise-pose-keyframes';

const DEG2RAD = Math.PI / 180;
const DAMPING = 1.0;

interface PoseRule {
  joint: string;
  angle_min: number;
  angle_max: number;
}

interface PhaseDefinition {
  phase: string;
  rules: PoseRule[];
}

/**
 * Compute DELTA quaternion for a bone.
 * Multiplied with rest pose in the renderer.
 */
function boneQuaternion(
  mapping: BoneMapping,
  targetAngle: number,
): THREE.Quaternion {
  const delta =
    (mapping.restAngle - targetAngle) * DEG2RAD * mapping.direction * DAMPING;
  const euler = new THREE.Euler();
  euler[mapping.axis] = delta;
  return new THREE.Quaternion().setFromEuler(euler);
}

/**
 * Compute bone rotation targets for a given phase.
 * Tries full-body keyframes first, falls back to phase rules.
 */
export function computePoseTargets(
  phase: PhaseDefinition,
  exerciseName?: string,
): Map<string, THREE.Quaternion> {
  const targets = new Map<string, THREE.Quaternion>();

  // Try full-body keyframes first
  const keyframes = exerciseName ? getExerciseKeyframes(exerciseName) : null;
  const phaseKey = phase.phase as 'START' | 'ECCENTRIC' | 'HOLD' | 'CONCENTRIC';
  const kf = keyframes?.[phaseKey];

  if (kf) {
    return computeFromKeyframe(kf);
  }

  // Fallback: use phase angle rules (partial)
  return computeFromRules(phase.rules);
}

/** Compute from full-body keyframe (all joints specified). */
function computeFromKeyframe(
  kf: Record<string, number>,
): Map<string, THREE.Quaternion> {
  const targets = new Map<string, THREE.Quaternion>();

  for (const [joint, angle] of Object.entries(kf)) {
    const mapping = HUMANOID_JOINT_MAP[joint];
    if (!mapping) continue;
    targets.set(mapping.boneName, boneQuaternion(mapping, angle));

    // Auto-mirror if right side not specified
    const mirrorJoint = MIRROR_MAP[joint];
    if (mirrorJoint && !(mirrorJoint in kf)) {
      const mirrorMapping = HUMANOID_JOINT_MAP[mirrorJoint];
      if (mirrorMapping && !targets.has(mirrorMapping.boneName)) {
        targets.set(mirrorMapping.boneName, boneQuaternion(mirrorMapping, angle));
      }
    }
  }

  return targets;
}

/** Compute from phase angle rules (partial — validation data). */
function computeFromRules(
  rules: PoseRule[],
): Map<string, THREE.Quaternion> {
  const targets = new Map<string, THREE.Quaternion>();

  for (const rule of rules) {
    const mapping = HUMANOID_JOINT_MAP[rule.joint];
    if (!mapping) continue;

    const midAngle = (rule.angle_min + rule.angle_max) / 2;
    targets.set(mapping.boneName, boneQuaternion(mapping, midAngle));

    const mirrorJoint = MIRROR_MAP[rule.joint];
    if (mirrorJoint) {
      const mirrorMapping = HUMANOID_JOINT_MAP[mirrorJoint];
      if (mirrorMapping && !targets.has(mirrorMapping.boneName)) {
        targets.set(mirrorMapping.boneName, boneQuaternion(mirrorMapping, midAngle));
      }
    }
  }

  return targets;
}

/** Identity quaternion for rest pose. */
export const REST_QUATERNION = new THREE.Quaternion();
