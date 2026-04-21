'use client';

import { Suspense, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HumanoidModel from './humanoid-model';
import PhaseControls from './phase-controls';
import { usePhaseAnimation } from '@/lib/use-phase-animation';

interface PhaseRule {
  joint: string;
  angle_min: number;
  angle_max: number;
}

interface Phase {
  phase: string;
  nameCs: string;
  rules: PhaseRule[];
  minDurationMs?: number;
}

interface ExerciseModelViewerProps {
  phases: Phase[];
  muscleGroups: string[];
  exerciseName?: string;
  externalPhaseIndex?: number;
}

const CAMERA_VIEWS = {
  front: new THREE.Vector3(1.5, 1.2, 2.5),
  side: new THREE.Vector3(2.5, 1.0, 0),
  back: new THREE.Vector3(-1.5, 1.2, -2.5),
} as const;

/** 3D animated exercise model viewer with playback controls. */
export default function ExerciseModelViewer({
  phases,
  muscleGroups,
  exerciseName,
  externalPhaseIndex,
}: ExerciseModelViewerProps) {
  const animation = usePhaseAnimation(phases);
  const controlsRef = useRef<any>(null);

  // Sync with external phase selection (from text section)
  const prevExternal = useRef(externalPhaseIndex);
  if (
    externalPhaseIndex !== undefined &&
    externalPhaseIndex !== prevExternal.current
  ) {
    prevExternal.current = externalPhaseIndex;
    animation.jumpToPhase(externalPhaseIndex);
  }

  const setView = useCallback(
    (view: 'front' | 'side' | 'back') => {
      const controls = controlsRef.current;
      if (!controls) return;
      const pos = CAMERA_VIEWS[view];
      controls.object.position.copy(pos);
      controls.target.set(0, 0, 0);
      controls.update();
    },
    [],
  );

  if (!phases || phases.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="relative aspect-[16/10] max-h-[500px] w-full overflow-hidden rounded-2xl border border-white/8 bg-black/50">
        <Canvas
          camera={{ position: [1.5, 1.2, 2.5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* @ts-ignore R3F v8 JSX types incompatible with TS 5.9 */}
          <ambientLight intensity={1.0} />
          {/* @ts-ignore R3F v8 JSX types */}
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          {/* @ts-ignore R3F v8 JSX types */}
          <directionalLight position={[-3, 3, -3]} intensity={0.5} />
          <Suspense fallback={null}>
            <HumanoidModel
              exerciseName={exerciseName}
              muscleGroups={muscleGroups}
            />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            minDistance={1.5}
            maxDistance={5}
            target={[0, 0.5, 0]}
          />
        </Canvas>
      </div>
      <PhaseControls
        phases={phases}
        currentPhaseIndex={animation.currentPhaseIndex}
        isPlaying={animation.isPlaying}
        speed={animation.speed}
        onTogglePlay={animation.togglePlay}
        onJumpToPhase={animation.jumpToPhase}
        onCycleSpeed={animation.cycleSpeed}
        onSetView={setView}
      />
    </div>
  );
}
