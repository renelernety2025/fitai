'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { computePoseTargets, REST_QUATERNION } from '@/lib/phase-to-pose';
import { getHighlightedBones, HIGHLIGHT_COLOR } from '@/lib/muscle-group-regions';

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
  currentPhaseIndex: number;
  progress: number;
}

const MODEL_PATH = '/models/humanoid.glb';

/** 3D humanoid model driven by exercise phase angle rules. */
export default function HumanoidModel({
  phases,
  muscleGroups,
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
    return computePoseTargets(phases[currentPhaseIndex]);
  }, [phases, currentPhaseIndex]);

  const nextTargets = useMemo(() => {
    const nextIdx = (currentPhaseIndex + 1) % phases.length;
    if (!phases[nextIdx]) return new Map();
    return computePoseTargets(phases[nextIdx]);
  }, [phases, currentPhaseIndex]);

  useFrame(() => {
    const bones = bonesRef.current;
    if (bones.size === 0) return;

    const tmpQuat = new THREE.Quaternion();
    bones.forEach((bone, name) => {
      const cur = currentTargets.get(name) ?? REST_QUATERNION;
      const nxt = nextTargets.get(name) ?? REST_QUATERNION;
      tmpQuat.copy(cur).slerp(nxt, progress);
      bone.quaternion.slerp(tmpQuat, 0.08);
    });
  });

  return (
    <primitive object={clonedScene} scale={1} position={[0, -1, 0]} />
  );
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
    mat.emissiveIntensity = 0.15;
    mesh.material = mat;
  });
}

useGLTF.preload(MODEL_PATH);
