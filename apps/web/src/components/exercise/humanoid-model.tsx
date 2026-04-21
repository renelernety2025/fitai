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

        // FBX animation tracks reference bones by name.
        // Both FBX and GLB use Mixamo naming (mixamorig:X).
        // FBX coordinate system (Z-up) is converted by FBXLoader
        // but Hips tracks may still have offset — fix by renaming
        // tracks to match the GLB skeleton hierarchy.
        const clip = convertFBXClipForGLB(fbx.animations[0], fbx);

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

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  // @ts-ignore R3F v8 JSX
  return <primitive object={character} scale={1} position={[0, -1, 0]} />;
}

/**
 * Convert FBX animation clip to work with GLB model.
 * FBXLoader already converts coordinates, but track names may include
 * hierarchy path. Strip hierarchy prefix so AnimationMixer finds bones
 * by name directly.
 */
function convertFBXClipForGLB(
  clip: THREE.AnimationClip,
  fbxScene: THREE.Group,
): THREE.AnimationClip {
  // Build a map of FBX bone paths to bone names
  const boneNameMap = new Map<string, string>();
  fbxScene.traverse((child) => {
    if ((child as THREE.Bone).isBone) {
      // FBX track names use full path: "Armature|mixamorig:Hips|..."
      // GLB bones are found by name: "mixamorig:Hips"
      boneNameMap.set(child.name, child.name);
    }
  });

  const newTracks = clip.tracks.map((track) => {
    // Track name format: "boneName.property" or "hierarchy/boneName.property"
    const dotIdx = track.name.lastIndexOf('.');
    const prop = track.name.slice(dotIdx); // .quaternion, .position, .scale
    const bonePath = track.name.slice(0, dotIdx);

    // Extract just the bone name (last segment of path)
    const segments = bonePath.split('/');
    const boneName = segments[segments.length - 1];

    return new (track.constructor as any)(
      boneName + prop,
      track.times,
      track.values,
    );
  });

  return new THREE.AnimationClip(clip.name, clip.duration, newTracks);
}

useGLTF.preload(CHARACTER_PATH);
