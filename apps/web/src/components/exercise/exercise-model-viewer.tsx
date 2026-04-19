'use client';

import { Suspense } from 'react';
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
}

/** 3D animated exercise model viewer with playback controls. */
export default function ExerciseModelViewer({
  phases,
  muscleGroups,
}: ExerciseModelViewerProps) {
  const {
    currentPhaseIndex,
    progress,
    isPlaying,
    togglePlay,
    jumpToPhase,
  } = usePhaseAnimation(phases);

  if (!phases || phases.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="relative aspect-[16/10] max-h-[500px] w-full overflow-hidden rounded-2xl border border-white/8 bg-black/50">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-3, 3, -3]} intensity={0.3} />
          <Suspense fallback={null}>
            <HumanoidModel
              phases={phases}
              muscleGroups={muscleGroups}
              currentPhaseIndex={currentPhaseIndex}
              progress={progress}
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={5}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      <PhaseControls
        phases={phases}
        currentPhaseIndex={currentPhaseIndex}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onJumpToPhase={jumpToPhase}
      />
    </div>
  );
}
