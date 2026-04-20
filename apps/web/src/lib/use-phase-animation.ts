/**
 * Animation loop hook for exercise phase cycling.
 * Uses requestAnimationFrame (NOT useFrame from R3F) so it can
 * be called outside of a Canvas context.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_PHASE_DURATION_MS = 800;
const HOLD_MULTIPLIER = 2;
const VISUAL_SLOWDOWN = 3;

export const SPEED_OPTIONS = [0.5, 1, 2] as const;
export type SpeedMultiplier = (typeof SPEED_OPTIONS)[number];

interface PhaseDefinition {
  phase: string;
  nameCs: string;
  minDurationMs?: number;
}

export interface PhaseAnimationState {
  currentPhaseIndex: number;
  progress: number;
  isPlaying: boolean;
  speed: SpeedMultiplier;
  togglePlay: () => void;
  jumpToPhase: (index: number) => void;
  cycleSpeed: () => void;
}

export function usePhaseAnimation(
  phases: PhaseDefinition[],
): PhaseAnimationState {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<SpeedMultiplier>(1);
  const progressRef = useRef(0);
  const prevTimeRef = useRef(0);
  const phaseIndexRef = useRef(0);
  const speedRef = useRef<SpeedMultiplier>(1);

  // Keep speedRef in sync with speed state (fixes stale ref if speed is set externally)
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const jumpToPhase = useCallback((index: number) => {
    phaseIndexRef.current = index;
    progressRef.current = 0;
    setCurrentPhaseIndex(index);
    setProgress(0);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeed((prev) => {
      const idx = SPEED_OPTIONS.indexOf(prev);
      const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
      speedRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isPlaying || phases.length === 0) return;

    let rafId: number;
    prevTimeRef.current = performance.now();

    function tick(now: number) {
      const delta = (now - prevTimeRef.current) / 1000;
      prevTimeRef.current = now;

      const phase = phases[phaseIndexRef.current];
      const baseDuration =
        ((phase?.minDurationMs ?? DEFAULT_PHASE_DURATION_MS) *
          VISUAL_SLOWDOWN) /
        1000;
      const duration =
        phase?.phase === 'HOLD'
          ? baseDuration * HOLD_MULTIPLIER
          : baseDuration;

      progressRef.current +=
        (delta * speedRef.current) / duration;

      if (progressRef.current >= 1) {
        progressRef.current = 0;
        const nextIndex =
          (phaseIndexRef.current + 1) % phases.length;
        phaseIndexRef.current = nextIndex;
        setCurrentPhaseIndex(nextIndex);
      }

      setProgress(progressRef.current);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, phases]);

  return {
    currentPhaseIndex,
    progress,
    isPlaying,
    speed,
    togglePlay,
    jumpToPhase,
    cycleSpeed,
  };
}
