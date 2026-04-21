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
}

const CHARACTER_PATH = '/models/characters/default.glb';

export default function HumanoidModel({ exerciseName }: HumanoidModelProps) {
  const { scene } = useGLTF(CHARACTER_PATH);
  const character = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const hipsBoneRef = useRef<THREE.Bone | null>(null);
  const hipsRestQuatRef = useRef<THREE.Quaternion | null>(null);
  const hipsRestPosRef = useRef<THREE.Vector3 | null>(null);

  // Find root bones and save rest pose BEFORE animation
  const rootBonesRef = useRef<{ bone: THREE.Bone; quat: THREE.Quaternion; pos: THREE.Vector3 }[]>([]);

  useEffect(() => {
    const roots: typeof rootBonesRef.current = [];
    character.traverse((child) => {
      if (!(child as THREE.Bone).isBone) return;
      const n = child.name;
      // Lock Hips + Spine chain — prevents FBX coordinate flip
      if (n.includes('Hips') || n.includes('Spine')) {
        roots.push({
          bone: child as THREE.Bone,
          quat: child.quaternion.clone(),
          pos: child.position.clone(),
        });
      }
    });
    rootBonesRef.current = roots;
    if (roots.length > 0) {
      hipsBoneRef.current = roots[0].bone;
      hipsRestQuatRef.current = roots[0].quat;
      hipsRestPosRef.current = roots[0].pos;
    }
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

    // Override Hips + Spine to keep torso upright
    for (const { bone, quat, pos } of rootBonesRef.current) {
      bone.quaternion.copy(quat);
      bone.position.copy(pos);
    }
  });

  // @ts-ignore R3F v8 JSX
  return <primitive object={character} scale={1} position={[0, -1, 0]} />;
}

useGLTF.preload(CHARACTER_PATH);
