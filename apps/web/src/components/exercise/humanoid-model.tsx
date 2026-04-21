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

  // Capture Hips rest quaternion from GLB before any animation
  const hipsRestQuat = useMemo(() => {
    let q: THREE.Quaternion | null = null;
    character.traverse((child) => {
      if (child.name === 'mixamorig:Hips' && (child as THREE.Bone).isBone) {
        q = child.quaternion.clone();
      }
    });
    return q;
  }, [character]);

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
        const clip = convertClip(fbx.animations[0], hipsRestQuat);
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
  }, [character, exerciseName, hipsRestQuat]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  // @ts-ignore R3F v8 JSX
  return <primitive object={character} scale={1} position={[0, -1, 0]} />;
}

/**
 * Convert FBX clip for GLB:
 * 1. Simplify track names (strip hierarchy paths)
 * 2. Replace Hips quaternion with GLB rest quaternion (prevents flip)
 * 3. Remove Hips position track (prevents relocation)
 */
function convertClip(
  clip: THREE.AnimationClip,
  hipsRestQuat: THREE.Quaternion | null,
): THREE.AnimationClip {
  const tracks: THREE.KeyframeTrack[] = [];

  for (const track of clip.tracks) {
    const dotIdx = track.name.lastIndexOf('.');
    const prop = track.name.slice(dotIdx);
    const bonePath = track.name.slice(0, dotIdx);
    const segments = bonePath.split('/');
    const boneName = segments[segments.length - 1];

    // Skip Hips position — prevents model from flying away
    if (boneName === 'mixamorig:Hips' && prop === '.position') {
      continue;
    }

    // Replace Hips quaternion with constant rest quaternion
    // This keeps the model upright while all limb animations play
    if (boneName === 'mixamorig:Hips' && prop === '.quaternion' && hipsRestQuat) {
      const times = [0, clip.duration];
      const values = [
        hipsRestQuat.x, hipsRestQuat.y, hipsRestQuat.z, hipsRestQuat.w,
        hipsRestQuat.x, hipsRestQuat.y, hipsRestQuat.z, hipsRestQuat.w,
      ];
      tracks.push(new THREE.QuaternionKeyframeTrack(
        boneName + prop, times, values,
      ));
      continue;
    }

    // All other tracks: just fix the name
    tracks.push(new (track.constructor as any)(
      boneName + prop,
      track.times,
      track.values,
    ));
  }

  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

useGLTF.preload(CHARACTER_PATH);
