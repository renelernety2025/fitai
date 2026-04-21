'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const CHARACTER_PATH = '/models/characters/default.glb';
const CROSSFADE_DURATION = 0.4;

export interface SequenceStep {
  name: string;
  nameCs: string;
  clipPath: string;
  speed: number;
  /** How many times to play this clip before moving to next */
  repeats: number;
}

interface SequenceViewerProps {
  steps: SequenceStep[];
  autoPlay?: boolean;
}

/** 3D viewer that plays a sequence of animation clips with crossfade. */
export default function SequenceViewer({
  steps,
  autoPlay = true,
}: SequenceViewerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const current = steps[currentIdx];

  const next = useCallback(() => {
    setCurrentIdx((i) => (i + 1) % steps.length);
  }, [steps.length]);

  const prev = useCallback(() => {
    setCurrentIdx((i) => (i - 1 + steps.length) % steps.length);
  }, [steps.length]);

  return (
    <div className="mb-8">
      <div className="relative aspect-[16/10] max-h-[450px] w-full overflow-hidden rounded-2xl border border-white/8 bg-black/50">
        <Canvas
          camera={{ position: [0, 0.3, 2.5], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* @ts-ignore */}
          <ambientLight intensity={1.0} />
          {/* @ts-ignore */}
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          {/* @ts-ignore */}
          <directionalLight position={[-3, 3, -3]} intensity={0.5} />
          <Suspense fallback={null}>
            <SequenceCharacter
              steps={steps}
              currentIdx={currentIdx}
              isPlaying={isPlaying}
              onClipFinished={next}
            />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={1.5} maxDistance={4} />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:text-white"
          >
            ←
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:text-white"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={next}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:text-white"
          >
            →
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`rounded-md px-3 py-1 text-[10px] font-semibold transition ${
                i === currentIdx
                  ? 'bg-[#A8FF00] text-black'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {step.nameCs}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
          {currentIdx + 1} / {steps.length} — {current?.nameCs}
        </div>
      </div>
    </div>
  );
}

/** Character that loads and crossfades between animation clips. */
function SequenceCharacter({
  steps,
  currentIdx,
  isPlaying,
  onClipFinished,
}: {
  steps: SequenceStep[];
  currentIdx: number;
  isPlaying: boolean;
  onClipFinished: () => void;
}) {
  const { scene } = useGLTF(CHARACTER_PATH);
  const character = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const clipCacheRef = useRef<Map<string, THREE.AnimationClip>>(new Map());
  const repeatCountRef = useRef(0);
  const loadedIdxRef = useRef(-1);

  // Initialize mixer once
  useEffect(() => {
    const mixer = new THREE.AnimationMixer(character);
    mixerRef.current = mixer;

    const onFinished = () => {
      repeatCountRef.current++;
      const step = steps[loadedIdxRef.current];
      if (step && repeatCountRef.current >= step.repeats) {
        repeatCountRef.current = 0;
        onClipFinished();
      }
    };
    mixer.addEventListener('finished', onFinished);

    return () => {
      mixer.stopAllAction();
      mixer.removeEventListener('finished', onFinished);
      mixerRef.current = null;
    };
  }, [character]);

  // Load + play clip when currentIdx changes
  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer || !steps[currentIdx]) return;

    const step = steps[currentIdx];
    loadedIdxRef.current = currentIdx;
    repeatCountRef.current = 0;

    const cached = clipCacheRef.current.get(step.clipPath);
    if (cached) {
      crossfadeTo(mixer, cached, step, currentActionRef);
      return;
    }

    const loader = new FBXLoader();
    loader.load(step.clipPath, (fbx) => {
      if (fbx.animations.length === 0) return;
      const clip = fbx.animations[0];
      clipCacheRef.current.set(step.clipPath, clip);
      crossfadeTo(mixer, clip, step, currentActionRef);
    });
  }, [currentIdx, steps]);

  // Pause/resume
  useEffect(() => {
    if (mixerRef.current) {
      mixerRef.current.timeScale = isPlaying ? 1 : 0;
    }
  }, [isPlaying]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  return (
    // @ts-ignore
    <primitive object={character} scale={1} position={[0, -1, 0]} />
  );
}

/** Crossfade from current action to new clip. */
function crossfadeTo(
  mixer: THREE.AnimationMixer,
  clip: THREE.AnimationClip,
  step: SequenceStep,
  currentActionRef: React.MutableRefObject<THREE.AnimationAction | null>,
) {
  const newAction = mixer.clipAction(clip);
  newAction.setLoop(
    step.repeats > 1 ? THREE.LoopRepeat : THREE.LoopOnce,
    step.repeats,
  );
  newAction.clampWhenFinished = true;
  newAction.timeScale = step.speed;
  newAction.reset();

  if (currentActionRef.current) {
    newAction.play();
    currentActionRef.current.crossFadeTo(newAction, CROSSFADE_DURATION, true);
  } else {
    newAction.play();
  }

  currentActionRef.current = newAction;
}

useGLTF.preload(CHARACTER_PATH);
