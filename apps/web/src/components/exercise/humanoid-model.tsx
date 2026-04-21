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
// FBX→Three.js: 90° rotation around X (Z-up → Y-up). Inverse for compensation.
const FBX_COMPENSATION = new THREE.Quaternion()
  .setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2)
  .invert();

function convertFBXClipForGLB(
  clip: THREE.AnimationClip,
  fbxScene: THREE.Group,
): THREE.AnimationClip {
  const newTracks = clip.tracks.map((track) => {
    const dotIdx = track.name.lastIndexOf('.');
    const prop = track.name.slice(dotIdx);
    const bonePath = track.name.slice(0, dotIdx);
    const segments = bonePath.split('/');
    const boneName = segments[segments.length - 1];

    // Compensate Hips quaternion for FBX→GLB coordinate system
    if (boneName === 'mixamorig:Hips' && prop === '.quaternion') {
      const values = Float32Array.from(track.values);
      const q = new THREE.Quaternion();
      for (let i = 0; i < values.length; i += 4) {
        q.set(values[i], values[i + 1], values[i + 2], values[i + 3]);
        q.multiply(FBX_COMPENSATION);
        values[i] = q.x;
        values[i + 1] = q.y;
        values[i + 2] = q.z;
        values[i + 3] = q.w;
      }
      return new THREE.QuaternionKeyframeTrack(
        boneName + prop, Array.from(track.times), Array.from(values),
      );
    }

    return new (track.constructor as any)(
      boneName + prop,
      track.times,
      track.values,
    );
  });

  return new THREE.AnimationClip(clip.name, clip.duration, newTracks);
}

useGLTF.preload(CHARACTER_PATH);
