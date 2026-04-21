'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { getAnimationForExercise } from '@/lib/exercise-animations';

interface HumanoidModelProps {
  exerciseName?: string;
  muscleGroups: string[];
}

const FALLBACK_CHARACTER = '/models/characters/default.glb';

/**
 * 3D humanoid with animation.
 * FBX exercises: load complete FBX (model + animation)
 * No animation: show static Michelle GLB
 */
export default function HumanoidModel({
  exerciseName,
}: HumanoidModelProps) {
  const mapping = exerciseName ? getAnimationForExercise(exerciseName) : null;

  if (mapping) {
    return <FBXCharacter clipPath={mapping.clipPath} speed={mapping.speed} />;
  }

  return <StaticCharacter />;
}

/** Load complete FBX and render. */
function FBXCharacter({ clipPath, speed }: { clipPath: string; speed: number }) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    setModel(null);
    if (mixerRef.current) mixerRef.current.stopAllAction();

    const loader = new FBXLoader();
    loader.load(
      clipPath,
      (fbx) => {
        if (fbx.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fbx);
          mixerRef.current = mixer;
          const action = mixer.clipAction(fbx.animations[0]);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.timeScale = speed;
          action.play();
        }
        setModel(fbx);
      },
      undefined,
      (err) => console.error('FBX load error:', err),
    );

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
    };
  }, [clipPath, speed]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  if (!model) return null;

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore R3F v8 JSX
  return <primitive object={model} />;
}

/** Static GLB fallback. */
function StaticCharacter() {
  const { scene } = useGLTF(FALLBACK_CHARACTER);
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore R3F v8 JSX
  return <primitive object={scene} scale={1} position={[0, -1, 0]} />;
}

useGLTF.preload(FALLBACK_CHARACTER);
