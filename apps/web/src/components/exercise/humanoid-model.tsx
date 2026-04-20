'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { HUMANOID_JOINT_MAP } from '@/lib/humanoid-joint-map';
import { getExerciseKeyframes } from '@/lib/exercise-pose-keyframes';
import { getHighlightedBones, HIGHLIGHT_COLOR } from '@/lib/muscle-group-regions';

interface Phase {
  phase: string;
  nameCs: string;
  rules: { joint: string; angle_min: number; angle_max: number }[];
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
const DEG2RAD = Math.PI / 180;
const PHASE_DURATION = 1.5;

/** 3D humanoid model animated via Three.js AnimationMixer. */
export default function HumanoidModel({
  phases,
  muscleGroups,
  exerciseName,
  currentPhaseIndex,
  progress,
}: HumanoidModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);

  // Sanitize bone names: replace ':' with '_' (Three.js PropertyBinding
  // treats ':' as a separator, breaking AnimationMixer track resolution)
  const bonesMap = useMemo(() => {
    const map = new Map<string, THREE.Bone>();
    clonedScene.traverse((child) => {
      if ((child as THREE.Bone).isBone) {
        child.name = child.name.replace(/:/g, '_');
        map.set(child.name, child as THREE.Bone);
      }
    });
    return map;
  }, [clonedScene]);

  // Create AnimationClip from keyframes and attach to mixer
  useEffect(() => {
    if (bonesMap.size === 0 || phases.length === 0) return;

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const clip = buildAnimationClip(phases, exerciseName, bonesMap);
    if (clip) {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      actionRef.current = action;
    }

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
    };
  }, [clonedScene, bonesMap, phases, exerciseName]);

  // Apply muscle highlighting
  useEffect(() => {
    const highlighted = getHighlightedBones(muscleGroups);
    applyMuscleHighlight(clonedScene, highlighted);
  }, [clonedScene, muscleGroups]);

  // Update mixer each frame
  useFrame((_, delta) => {
    mixerRef.current?.update(delta * 0.4);
  });

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  return (
    <>
      {/* @ts-ignore R3F v8 JSX types */}
      <primitive object={clonedScene} scale={1} position={[0, -1, 0]} />
    </>
  );
}

/**
 * Build a Three.js AnimationClip from exercise keyframes.
 * Creates QuaternionKeyframeTrack for each animated bone.
 */
function buildAnimationClip(
  phases: Phase[],
  exerciseName: string | undefined,
  bonesMap: Map<string, THREE.Bone>,
): THREE.AnimationClip | null {
  const keyframes = exerciseName ? getExerciseKeyframes(exerciseName) : null;
  const phaseOrder = ['START', 'ECCENTRIC', 'HOLD', 'CONCENTRIC', 'START'];
  const totalDuration = phaseOrder.length * PHASE_DURATION;

  // Collect all joints that appear in any phase
  const allJoints = new Set<string>();

  if (keyframes) {
    for (const phase of Object.values(keyframes)) {
      for (const joint of Object.keys(phase)) {
        allJoints.add(joint);
      }
    }
  } else {
    // Fallback: use phase rules
    for (const phase of phases) {
      for (const rule of phase.rules) {
        allJoints.add(rule.joint);
        const mirror = MIRROR_MAP_INLINE[rule.joint];
        if (mirror) allJoints.add(mirror);
      }
    }
  }

  if (allJoints.size === 0) return null;

  const tracks: THREE.KeyframeTrack[] = [];

  for (const joint of allJoints) {
    const mapping = HUMANOID_JOINT_MAP[joint];
    if (!mapping) continue;

    const bone = bonesMap.get(mapping.boneName);
    if (!bone) continue;

    const times: number[] = [];
    const values: number[] = [];
    const restQuat = bone.quaternion.clone();

    for (let i = 0; i < phaseOrder.length; i++) {
      const phaseKey = phaseOrder[i];
      const time = i * PHASE_DURATION;
      times.push(time);

      let targetAngle: number | null = null;

      if (keyframes) {
        const kf = keyframes[phaseKey as keyof typeof keyframes];
        targetAngle = kf?.[joint] ?? null;
      } else {
        const phase = phases.find((p) => p.phase === phaseKey);
        const rule = phase?.rules.find((r) => r.joint === joint);
        if (rule) targetAngle = (rule.angle_min + rule.angle_max) / 2;
      }

      if (targetAngle !== null) {
        const delta = (mapping.restAngle - targetAngle) * DEG2RAD * mapping.direction;
        const euler = new THREE.Euler();
        euler[mapping.axis] = delta;
        const q = restQuat.clone().multiply(
          new THREE.Quaternion().setFromEuler(euler),
        );
        values.push(q.x, q.y, q.z, q.w);
      } else {
        values.push(restQuat.x, restQuat.y, restQuat.z, restQuat.w);
      }
    }

    const trackName = `${bone.name}.quaternion`;
    tracks.push(
      new THREE.QuaternionKeyframeTrack(trackName, times, values),
    );
  }

  if (tracks.length === 0) return null;
  return new THREE.AnimationClip('exercise', totalDuration, tracks);
}

const MIRROR_MAP_INLINE: Record<string, string> = {
  left_knee: 'right_knee',
  left_hip: 'right_hip',
  left_elbow: 'right_elbow',
  left_shoulder: 'right_shoulder',
  left_shoulder_z: 'right_shoulder_z',
  left_ankle: 'right_ankle',
};

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
