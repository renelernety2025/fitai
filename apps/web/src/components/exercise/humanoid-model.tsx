'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { computePoseTargets, REST_QUATERNION } from '@/lib/phase-to-pose';
import { getHighlightedBones, HIGHLIGHT_COLOR } from '@/lib/muscle-group-regions';
import { HUMANOID_JOINT_MAP } from '@/lib/humanoid-joint-map';

interface PhaseRule {
  joint: string;
  angle_min: number;
  angle_max: number;
}

interface Phase {
  phase: string;
  nameCs: string;
  rules: PhaseRule[];
  minDurationMs?: number;
}

interface HumanoidModelProps {
  phases: Phase[];
  muscleGroups: string[];
  exerciseName?: string;
  currentPhaseIndex: number;
  progress: number;
}

const MODEL_PATH = '/models/humanoid.glb';

const JOINT_LABELS: Record<string, string> = {
  left_knee: 'Koleno',
  right_knee: 'Koleno',
  left_hip: 'Kyčel',
  right_hip: 'Kyčel',
  left_elbow: 'Loket',
  right_elbow: 'Loket',
  left_shoulder: 'Rameno',
  right_shoulder: 'Rameno',
  left_ankle: 'Kotník',
};

/** 3D humanoid model driven by exercise phase angle rules. */
export default function HumanoidModel({
  phases,
  muscleGroups,
  exerciseName,
  currentPhaseIndex,
  progress,
}: HumanoidModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(
    () => SkeletonUtils.clone(scene),
    [scene],
  );
  const bonesRef = useRef<Map<string, THREE.Bone>>(new Map());

  useEffect(() => {
    const bones = new Map<string, THREE.Bone>();
    clonedScene.traverse((child) => {
      if ((child as THREE.Bone).isBone) {
        bones.set(child.name, child as THREE.Bone);
      }
    });
    bonesRef.current = bones;
  }, [clonedScene]);

  useEffect(() => {
    const highlighted = getHighlightedBones(muscleGroups);
    applyMuscleHighlight(clonedScene, highlighted);
  }, [clonedScene, muscleGroups]);

  const currentTargets = useMemo(() => {
    if (!phases[currentPhaseIndex]) return new Map();
    return computePoseTargets(phases[currentPhaseIndex], exerciseName);
  }, [phases, currentPhaseIndex, exerciseName]);

  const nextTargets = useMemo(() => {
    const nextIdx = (currentPhaseIndex + 1) % phases.length;
    if (!phases[nextIdx]) return new Map();
    return computePoseTargets(phases[nextIdx], exerciseName);
  }, [phases, currentPhaseIndex, exerciseName]);

  // Compute current angle values for overlay
  const activeRules = useMemo(() => {
    const phase = phases[currentPhaseIndex];
    if (!phase) return [];
    return phase.rules.map((rule) => ({
      joint: rule.joint,
      angle: Math.round((rule.angle_min + rule.angle_max) / 2),
      boneName: HUMANOID_JOINT_MAP[rule.joint]?.boneName,
      label: JOINT_LABELS[rule.joint] ?? rule.joint,
    }));
  }, [phases, currentPhaseIndex]);

  // Store original bone quaternions on first frame (rest pose)
  const restPoseRef = useRef<Map<string, THREE.Quaternion>>(new Map());

  useFrame(() => {
    const bones = bonesRef.current;
    if (bones.size === 0) return;

    // Capture rest pose on first frame
    if (restPoseRef.current.size === 0) {
      bones.forEach((bone, name) => {
        restPoseRef.current.set(name, bone.quaternion.clone());
      });
    }

    // Only animate bones that have targets — leave others at rest pose
    const allTargetBones = new Set([
      ...currentTargets.keys(),
      ...nextTargets.keys(),
    ]);

    const tmpQuat = new THREE.Quaternion();
    for (const name of allTargetBones) {
      const bone = bones.get(name);
      if (!bone) continue;
      const rest = restPoseRef.current.get(name) ?? REST_QUATERNION;
      const cur = currentTargets.get(name);
      const nxt = nextTargets.get(name);
      // Compose: rest pose * phase delta
      const curTarget = cur ? rest.clone().multiply(cur) : rest;
      const nxtTarget = nxt ? rest.clone().multiply(nxt) : rest;
      tmpQuat.copy(curTarget).slerp(nxtTarget, progress);
      bone.quaternion.slerp(tmpQuat, 0.2);
    }
  });

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  return (
    <>
      {/* @ts-ignore R3F v8 JSX types incompatible with TS 5.9 */}
      <primitive
        object={clonedScene}
        scale={1}
        position={[0, -1, 0]}
      />
      {/* Angle overlay labels */}
      {activeRules.map((rule) => {
        const bone = bonesRef.current.get(rule.boneName ?? '');
        if (!bone) return null;
        return (
          <AngleLabel
            key={rule.joint}
            bone={bone}
            angle={rule.angle}
            label={rule.label}
          />
        );
      })}
    </>
  );
}

/** Floating angle label attached to a bone. Tracks bone position via useFrame + ref (zero re-renders). */
function AngleLabel({
  bone,
  angle,
  label,
}: {
  bone: THREE.Bone;
  angle: number;
  label: string;
}) {
  const groupRef = useRef<THREE.Object3D>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!groupRef.current) return;
    bone.getWorldPosition(worldPos);
    groupRef.current.position.copy(worldPos);
  });

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore R3F v8 JSX — opening tag
  const groupEl = <group ref={groupRef}>
    <Html center distanceFactor={4} style={{ pointerEvents: 'none' }}>
      <div className="whitespace-nowrap rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-bold tabular-nums text-[#A8FF00] backdrop-blur-sm">
        {label} {angle}°
      </div>
    </Html>
    {/* @ts-ignore R3F v8 JSX — closing tag */}
  </group>;
  return groupEl;
}

function applyMuscleHighlight(
  root: THREE.Object3D,
  highlightedBones: Set<string>,
): void {
  if (highlightedBones.size === 0) return;
  const color = new THREE.Color(HIGHLIGHT_COLOR);

  root.traverse((child) => {
    if (!(child as THREE.SkinnedMesh).isSkinnedMesh) return;
    const mesh = child as THREE.SkinnedMesh;
    const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
    mat.emissive = color;
    mat.emissiveIntensity = 0.02;
    mesh.material = mat;
  });
}

useGLTF.preload(MODEL_PATH);
