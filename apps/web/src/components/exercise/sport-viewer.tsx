'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
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

/** Minimal 3D viewer for sport animation clips. */
export default function SportViewer({ clipPath, speed }: SportViewerProps) {
  return (
    <div className="mb-8">
      <div className="relative aspect-[16/10] max-h-[450px] w-full overflow-hidden rounded-2xl border border-white/8 bg-black/50">
        <Canvas
          camera={{ position: [0, 0.5, 3], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* @ts-ignore R3F v8 */}
          <ambientLight intensity={1.0} />
          {/* @ts-ignore R3F v8 */}
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          {/* @ts-ignore R3F v8 */}
          <directionalLight position={[-3, 3, -3]} intensity={0.5} />
          <Suspense fallback={null}>
            <AnimatedCharacter clipPath={clipPath} speed={speed} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={4}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
}

function AnimatedCharacter({
  clipPath,
  speed,
}: {
  clipPath: string;
  speed: number;
}) {
  const { scene } = useGLTF(CHARACTER_PATH);
  const character = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    const mixer = new THREE.AnimationMixer(character);
    mixerRef.current = mixer;

    const loader = new FBXLoader();
    loader.load(
      clipPath,
      (fbx) => {
        if (fbx.animations.length === 0) return;
        mixer.stopAllAction();
        const clip = sanitizeClip(fbx.animations[0]);
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = speed;
        action.play();
      },
      undefined,
      (err) => console.error('Sport animation load error:', err),
    );

    return () => {
      mixer.stopAllAction();
      mixerRef.current = null;
    };
  }, [character, clipPath, speed]);

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
 * Mixamo FBX often includes Hips position/rotation that relocates the model.
 * Keep only bone rotation tracks (quaternion) — let the character stand in place.
 */
/**
 * Remove Hips position AND quaternion tracks from FBX animation.
 * Mixamo FBX uses Z-up coordinate system — the Hips tracks flip the model
 * 90° so it lays flat. Stripping both tracks keeps the character standing
 * while all limb animations play correctly.
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
