'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { WorkoutStep } from '@/lib/training-sequences';
import { beepSwitch, beepRest, beepStart, beepCountdown } from '@/lib/workout-audio';
import ExerciseModelPlaceholder from '@/components/exercise/exercise-model-placeholder';

const SportViewer = dynamic(
  () => import('@/components/exercise/sport-viewer'),
  { ssr: false, loading: () => <ExerciseModelPlaceholder /> },
);

type Phase = 'countdown' | 'exercise' | 'rest' | 'finished';

interface FollowAlongWorkoutProps {
  title: string;
  steps: WorkoutStep[];
  onFinish: (totalSec: number) => void;
}

/** Full-screen follow-along workout with timer and 3D model. */
export default function FollowAlongWorkout({
  title,
  steps,
  onFinish,
}: FollowAlongWorkoutProps) {
  const [phase, setPhase] = useState<Phase>('countdown');
  const [stepIdx, setStepIdx] = useState(0);
  const [timer, setTimer] = useState(3);
  const [paused, setPaused] = useState(false);
  const totalTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const current = steps[stepIdx];
  const nextStep = steps[stepIdx + 1];

  const clearTick = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Main timer logic
  useEffect(() => {
    if (paused) return;
    clearTick();

    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          handleTimerEnd();
          return 0;
        }
        if (phase !== 'finished') totalTimeRef.current++;
        if (t === 4 && phase === 'countdown') beepCountdown();
        if (t === 3 && phase === 'exercise') beepCountdown();
        return t - 1;
      });
    }, 1000);

    return clearTick;
  }, [phase, stepIdx, paused]);

  function handleTimerEnd() {
    clearTick();

    if (phase === 'countdown') {
      beepStart();
      setPhase('exercise');
      setTimer(current.durationSec);
      return;
    }

    if (phase === 'exercise') {
      if (current.restAfterSec > 0 && stepIdx < steps.length - 1) {
        beepRest();
        setPhase('rest');
        setTimer(current.restAfterSec);
      } else {
        advanceStep();
      }
      return;
    }

    if (phase === 'rest') {
      advanceStep();
    }
  }

  function advanceStep() {
    if (stepIdx >= steps.length - 1) {
      setPhase('finished');
      beepStart();
      onFinish(totalTimeRef.current);
      return;
    }
    beepSwitch();
    setStepIdx((i) => i + 1);
    setPhase('exercise');
    setTimer(steps[stepIdx + 1].durationSec);
  }

  // Countdown screen
  if (phase === 'countdown') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          {title}
        </p>
        <p className="text-[120px] font-black tabular-nums leading-none text-white">
          {timer}
        </p>
        <p className="mt-4 text-lg text-white/50">Priprav se!</p>
        <p className="mt-8 text-sm text-white/30">
          Prvni cvik: {current.nameCs} ({current.durationSec}s)
        </p>
      </div>
    );
  }

  // Finished screen
  if (phase === 'finished') {
    const mins = Math.floor(totalTimeRef.current / 60);
    const secs = totalTimeRef.current % 60;
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A8FF00]">
          Hotovo!
        </p>
        <p className="text-5xl font-black text-white">
          {mins}:{secs.toString().padStart(2, '0')}
        </p>
        <p className="mt-4 text-lg text-white/50">
          {steps.length} cviku dokonceno
        </p>
        <button
          onClick={() => onFinish(totalTimeRef.current)}
          className="mt-8 rounded-full bg-white px-10 py-4 text-base font-semibold text-black transition hover:scale-105"
        >
          Zpet
        </button>
      </div>
    );
  }

  // Exercise / Rest screen
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => { clearTick(); onFinish(totalTimeRef.current); }}
          className="text-sm text-white/40 transition hover:text-white"
        >
          Ukoncit
        </button>
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
          {stepIdx + 1} / {steps.length}
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          className="text-sm text-white/40 transition hover:text-white"
        >
          {paused ? 'Pokracovat' : 'Pauza'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <div
          className="h-full bg-[#A8FF00] transition-all duration-300"
          style={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* 3D model area */}
      <div className="flex-1 relative">
        {phase === 'rest' ? (
          <div className="flex h-full flex-col items-center justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#FF9F0A]">
              Odpocinek
            </p>
            <p className="mt-4 text-[80px] font-black tabular-nums leading-none text-white">
              {timer}
            </p>
            {nextStep && (
              <p className="mt-6 text-sm text-white/40">
                Dalsi: {nextStep.nameCs} ({nextStep.durationSec}s)
              </p>
            )}
          </div>
        ) : (
          <SportViewer clipPath={current.clipPath} speed={current.speed} />
        )}
      </div>

      {/* Bottom info */}
      {phase === 'exercise' && (
        <div className="px-6 pb-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A8FF00]">
            {current.nameCs}
          </p>
          <p className="mt-2 text-[60px] font-black tabular-nums leading-none text-white">
            {timer}
          </p>
          {nextStep && (
            <p className="mt-3 text-[11px] text-white/30">
              Dalsi: {nextStep.nameCs}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
