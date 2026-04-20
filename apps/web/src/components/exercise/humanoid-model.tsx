'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { getAnimationForExercise } from '@/lib/exercise-animations';
import { getHighlightedBones, HIGHLIGHT_COLOR } from '@/lib/muscle-group-regions';

interface HumanoidModelProps {
  exerciseName?: string;
  muscleGroups: string[];
}

const MODEL_PATH = '/models/humanoid.glb';

/** 3D humanoid with Mixamo FBX animation playback. */
export default function HumanoidModel({
  exerciseName,
  muscleGroups,
}: HumanoidModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const [animLoaded, setAnimLoaded] = useState(false);

  // Apply muscle highlighting
  useEffect(() => {
    const highlighted = getHighlightedBones(muscleGroups);
    applyMuscleHighlight(clonedScene, highlighted);
  }, [clonedScene, muscleGroups]);

  // Load and play FBX animation
  useEffect(() => {
    const mapping = exerciseName
      ? getAnimationForExercise(exerciseName)
      : null;
    if (!mapping) return;

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const loader = new FBXLoader();
    loader.load(
      mapping.clipPath,
      (fbx) => {
        if (fbx.animations.length === 0) return;

        // Retarget: FBX animation bone names use 'mixamorig:X'
        // but our cloned GLB also uses 'mixamorig:X' (unchanged).
        // AnimationMixer resolves by bone name in scene hierarchy.
        const clip = fbx.animations[0];
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = mapping.speed;
        action.play();
        setAnimLoaded(true);
      },
      undefined,
      (err) => console.error('FBX load error:', err),
    );

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [clonedScene, exerciseName]);

  // Advance mixer each frame
  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  return (
    // @ts-ignore R3F v8 JSX
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
    mat.emissiveIntensity = 0.02;
    mesh.material = mat;
  });
}

useGLTF.preload(MODEL_PATH);
