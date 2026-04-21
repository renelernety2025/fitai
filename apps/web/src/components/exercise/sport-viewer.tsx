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
          camera={{ position: [0.8, 0.8, 2.8], fov: 40 }}
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
            target={[0, 0.5, 0]}
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
  const rootBonesRef = useRef<{ bone: THREE.Bone; quat: THREE.Quaternion; pos: THREE.Vector3 }[]>([]);

  useEffect(() => {
    const roots: typeof rootBonesRef.current = [];
    character.traverse((child) => {
      if (!(child as THREE.Bone).isBone) return;
      const n = child.name;
      if (n.includes('Hips') || n.includes('Spine')) {
        roots.push({
          bone: child as THREE.Bone,
          quat: child.quaternion.clone(),
          pos: child.position.clone(),
        });
      }
    });
    rootBonesRef.current = roots;
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
        const action = mixer.clipAction(fbx.animations[0]);
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
  }, [character, clipPath, speed]);

  useFrame((_, delta) => {
    if (!mixerRef.current) return;
    mixerRef.current.update(delta);

    for (const { bone, quat, pos } of rootBonesRef.current) {
      bone.quaternion.copy(quat);
      bone.position.copy(pos);
    }
  });

  // @ts-ignore R3F v8 JSX
  return <primitive object={character} scale={1} position={[0, -1, 0]} />;
}

useGLTF.preload(CHARACTER_PATH);
