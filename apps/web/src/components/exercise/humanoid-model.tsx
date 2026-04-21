'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
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
 * - If exercise has FBX animation: load FBX complete (model + animation)
 * - Otherwise: show static Michelle GLB
 */
export default function HumanoidModel({
  exerciseName,
  muscleGroups,
}: HumanoidModelProps) {
  const mapping = exerciseName ? getAnimationForExercise(exerciseName) : null;

  if (mapping) {
    return <FBXCharacter clipPath={mapping.clipPath} speed={mapping.speed} />;
  }

  return <StaticCharacter />;
}

/** Load complete FBX (mesh + skeleton + animation). */
function FBXCharacter({ clipPath, speed }: { clipPath: string; speed: number }) {
  const { scene } = useThree();
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(
      clipPath,
      (fbx) => {
        if (modelRef.current) scene.remove(modelRef.current);
        if (mixerRef.current) mixerRef.current.stopAllAction();

        modelRef.current = fbx;
        scene.add(fbx);

        if (fbx.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fbx);
          mixerRef.current = mixer;
          const action = mixer.clipAction(fbx.animations[0]);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.timeScale = speed;
          action.play();
        }
      },
      undefined,
      (err) => console.error('FBX load error:', err),
    );

    return () => {
      if (modelRef.current) scene.remove(modelRef.current);
      if (mixerRef.current) mixerRef.current.stopAllAction();
      modelRef.current = null;
      mixerRef.current = null;
    };
  }, [clipPath, speed, scene]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return null;
}

/** Static GLB character for exercises without animation. */
function StaticCharacter() {
  const { scene: gltfScene } = useGLTF(FALLBACK_CHARACTER);

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  return (
    // @ts-ignore R3F v8 JSX
    <primitive object={gltfScene} scale={1} position={[0, -1, 0]} />
  );
}

useGLTF.preload(FALLBACK_CHARACTER);
