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

const CHARACTER_PATH = '/models/characters/default.glb';

export default function HumanoidModel({ exerciseName }: HumanoidModelProps) {
  const { scene } = useGLTF(CHARACTER_PATH);
  const character = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const hipsBoneRef = useRef<THREE.Bone | null>(null);
  const hipsRestQuatRef = useRef<THREE.Quaternion | null>(null);
  const hipsRestPosRef = useRef<THREE.Vector3 | null>(null);

  // Find Hips bone and save rest pose BEFORE animation
  useEffect(() => {
    character.traverse((child) => {
      if ((child as THREE.Bone).isBone && child.name.includes('Hips')) {
        hipsBoneRef.current = child as THREE.Bone;
        hipsRestQuatRef.current = child.quaternion.clone();
        hipsRestPosRef.current = child.position.clone();
      }
    });
  }, [character]);

  // Load and play FBX animation
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
        // Use FBX animation as-is — we fix orientation in useFrame
        const clip = fbx.animations[0];
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

  // Every frame: advance animation, then FORCE Hips back to rest pose
  useFrame((_, delta) => {
    if (!mixerRef.current) return;

    // Let mixer animate ALL bones (including Hips)
    mixerRef.current.update(delta);

    // Then override Hips rotation/position to keep model upright
    // All child bones (spine, arms, legs) keep their animated values
    const hips = hipsBoneRef.current;
    if (hips && hipsRestQuatRef.current) {
      hips.quaternion.copy(hipsRestQuatRef.current);
    }
    if (hips && hipsRestPosRef.current) {
      hips.position.copy(hipsRestPosRef.current);
    }
  });

  // @ts-ignore R3F v8 JSX
  return <primitive object={character} scale={1} position={[0, -1, 0]} />;
}

useGLTF.preload(CHARACTER_PATH);
