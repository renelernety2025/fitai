'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { getAnimationForExercise } from '@/lib/exercise-animations';

interface HumanoidModelProps {
  exerciseName?: string;
  muscleGroups: string[];
}

/** Character model path — swap this file to change the 3D person. */
const CHARACTER_PATH = '/models/characters/default.glb';

/**
 * 3D humanoid character with Mixamo animation playback.
 *
 * Architecture:
 * - Character (GLB): mesh + skeleton in T-pose, loaded once
 * - Animation (FBX): bone keyframes only (no mesh), loaded per exercise
 * - AnimationMixer retargets FBX bones onto character skeleton automatically
 *   because both use Mixamo rig (bone names match)
 */
export default function HumanoidModel({
  exerciseName,
  muscleGroups,
}: HumanoidModelProps) {
  const { scene } = useGLTF(CHARACTER_PATH);
  const character = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Load and play exercise animation (FBX → AnimationMixer)
  useEffect(() => {
    const mapping = exerciseName
      ? getAnimationForExercise(exerciseName)
      : null;
    if (!mapping) return;

    const mixer = new THREE.AnimationMixer(character);
    mixerRef.current = mixer;

    const loader = new FBXLoader();
    loader.load(
      mapping.clipPath,
      (fbx) => {
        if (fbx.animations.length === 0) return;
        const clip = sanitizeClip(fbx.animations[0]);
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = mapping.speed;
        action.play();
      },
      undefined,
      (err) => console.error('Animation load error:', err),
    );

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [character, exerciseName]);

  // Advance animation each frame
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  return (
    // @ts-ignore R3F v8 JSX
    <primitive object={character} scale={1} position={[0, -1, 0]} />
  );
}

/**
 * Remove root bone position tracks from FBX animation.
 * Mixamo FBX includes Hips position that relocates/flips the model.
 */
function sanitizeClip(clip: THREE.AnimationClip): THREE.AnimationClip {
  const filtered = clip.tracks.filter((track) => {
    if (track.name.includes('Hips') && track.name.endsWith('.position')) return false;
    if (track.name.includes('Hips') && track.name.endsWith('.quaternion')) return false;
    return true;
  });
  return new THREE.AnimationClip(clip.name, clip.duration, filtered);
}

useGLTF.preload(CHARACTER_PATH);
