'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

interface SportViewerProps {
  clipPath: string;
  speed: number;
}

/** 3D viewer — loads complete FBX with auto-framing camera. */
export default function SportViewer({ clipPath, speed }: SportViewerProps) {
  return (
    <div className="mb-8">
      <div className="relative aspect-[16/10] max-h-[450px] w-full overflow-hidden rounded-2xl border border-white/8 bg-black/50">
        <Canvas
          camera={{ fov: 45, near: 0.1, far: 10000 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* @ts-ignore */}
          <ambientLight intensity={1.2} />
          {/* @ts-ignore */}
          <directionalLight position={[500, 500, 500]} intensity={1.5} />
          {/* @ts-ignore */}
          <directionalLight position={[-300, 300, -300]} intensity={0.5} />
          <Suspense fallback={null}>
            <FBXCharacter clipPath={clipPath} speed={speed} />
          </Suspense>
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
    </div>
  );
}

/** Load FBX, auto-frame camera to fit model. */
function FBXCharacter({ clipPath, speed }: { clipPath: string; speed: number }) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    setModel(null);
    if (mixerRef.current) mixerRef.current.stopAllAction();

    const loader = new FBXLoader();
    loader.load(
      clipPath,
      (fbx) => {
        // Start animation
        if (fbx.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(fbx);
          mixerRef.current = mixer;
          const action = mixer.clipAction(fbx.animations[0]);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.timeScale = speed;
          action.play();
        }

        // Auto-frame: compute bounding box and position camera
        const box = new THREE.Box3().setFromObject(fbx);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const dist = maxDim * 1.8;

        camera.position.set(center.x, center.y, center.z + dist);
        camera.lookAt(center);
        camera.updateProjectionMatrix();

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
  }, [clipPath, speed, camera]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  if (!model) return null;
  // @ts-ignore R3F v8 JSX
  return <primitive object={model} />;
}
