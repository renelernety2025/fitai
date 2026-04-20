/**
 * Converts exercise phase angle rules into bone rotation targets.
 * Each phase specifies angle ranges per joint — this computes
 * the midpoint angle and converts to bone-local Euler rotation.
 */

import * as THREE from 'three';
import {
  HUMANOID_JOINT_MAP,
  MIRROR_MAP,
  type BoneMapping,
} from './humanoid-joint-map';

const DEG2RAD = Math.PI / 180;

interface PoseRule {
  joint: string;
  angle_min: number;
  angle_max: number;
}

interface PhaseDefinition {
  rules: PoseRule[];
}

/**
 * Compute DELTA quaternion for a bone from its angle rule.
 * This is multiplied with the model's rest pose, not used as absolute rotation.
 * Damping factor prevents over-rotation on Mixamo rigs.
 */
const DAMPING = 0.6;

function computeBoneQuaternion(
  mapping: BoneMapping,
  targetAngle: number,
): THREE.Quaternion {
  const delta = (mapping.restAngle - targetAngle) * DEG2RAD * mapping.direction * DAMPING;
  const euler = new THREE.Euler();
  euler[mapping.axis] = delta;
  return new THREE.Quaternion().setFromEuler(euler);
}

/**
 * Compute bone rotation targets for a given phase.
 * Returns Map<boneName, THREE.Quaternion>.
 * Mirrors left-only rules to right side automatically.
 */
export function computePoseTargets(
  phase: PhaseDefinition,
): Map<string, THREE.Quaternion> {
  const targets = new Map<string, THREE.Quaternion>();

  for (const rule of phase.rules) {
    const mapping = HUMANOID_JOINT_MAP[rule.joint];
    if (!mapping) continue;

    const midAngle = (rule.angle_min + rule.angle_max) / 2;
    targets.set(mapping.boneName, computeBoneQuaternion(mapping, midAngle));

    applyMirror(rule, midAngle, targets);
  }

  return targets;
}

/** Mirror left-side rule to right side if right isn't already set. */
function applyMirror(
  rule: PoseRule,
  midAngle: number,
  targets: Map<string, THREE.Quaternion>,
): void {
  const mirrorJoint = MIRROR_MAP[rule.joint];
  if (!mirrorJoint) return;

  const mirrorMapping = HUMANOID_JOINT_MAP[mirrorJoint];
  if (!mirrorMapping || targets.has(mirrorMapping.boneName)) return;

  targets.set(mirrorMapping.boneName, computeBoneQuaternion(mirrorMapping, midAngle));
}

/** Identity quaternion for rest pose. */
export const REST_QUATERNION = new THREE.Quaternion();
