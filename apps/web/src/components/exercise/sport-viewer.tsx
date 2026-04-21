'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface SportViewerProps {
  clipPath: string;
  speed: number;
}

/** Minimal 3D viewer — loads complete FBX (model + animation). */
export default function SportViewer({ clipPath, speed }: SportViewerProps) {
  return (
    <div className="mb-8">
      <div className="relative aspect-[16/10] max-h-[450px] w-full overflow-hidden rounded-2xl border border-white/8 bg-black/50">
        <Canvas
          camera={{ position: [0, 100, 300], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* @ts-ignore */}
          <ambientLight intensity={1.2} />
          {/* @ts-ignore */}
          <directionalLight position={[5, 10, 5]} intensity={1.5} />
          {/* @ts-ignore */}
          <directionalLight position={[-3, 5, -3]} intensity={0.5} />
          <Suspense fallback={null}>
            <FBXCharacter clipPath={clipPath} speed={speed} />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={150}
            maxDistance={500}
            target={[0, 100, 0]}
          />
        </Canvas>
      </div>
    </div>
  );
}

/** Load complete FBX and render via primitive. */
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
