'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const CHARACTER_PATH = '/models/characters/default.glb';

interface SportViewerProps {
  clipPath: string;
  speed: number;
}

export default function SportViewer({ clipPath, speed }: SportViewerProps) {
  return (
    <div className="mb-8">
      <div className="relative aspect-[16/10] max-h-[450px] w-full overflow-hidden rounded-2xl border border-white/8 bg-black/50">
        <Canvas
          camera={{ position: [0, 0.5, 3], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* @ts-ignore */}
          <ambientLight intensity={1.2} />
          {/* @ts-ignore */}
          <directionalLight position={[5, 10, 5]} intensity={1.5} />
          {/* @ts-ignore */}
          <directionalLight position={[-3, 5, -3]} intensity={0.5} />
          <Suspense fallback={null}>
            <AnimatedCharacter clipPath={clipPath} speed={speed} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={5}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
}

function AnimatedCharacter({ clipPath, speed }: { clipPath: string; speed: number }) {
  const { scene } = useGLTF(CHARACTER_PATH);
  const character = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

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
    const mixer = new THREE.AnimationMixer(character);
    mixerRef.current = mixer;

    const loader = new FBXLoader();
    loader.load(
      clipPath,
      (fbx) => {
        if (fbx.animations.length === 0) return;
        mixer.stopAllAction();
        const clip = convertClip(fbx.animations[0], hipsRestQuat);
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = speed;
        action.play();
      },
      undefined,
      (err) => console.error('Animation load error:', err),
    );

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [character, clipPath, speed, hipsRestQuat]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  // @ts-ignore R3F v8 JSX
  return <primitive object={character} scale={1} position={[0, -1, 0]} />;
}

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

    if (boneName === 'mixamorig:Hips' && prop === '.position') {
      continue;
    }

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

    tracks.push(new (track.constructor as any)(
      boneName + prop,
      track.times,
      track.values,
    ));
  }

  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

useGLTF.preload(CHARACTER_PATH);
