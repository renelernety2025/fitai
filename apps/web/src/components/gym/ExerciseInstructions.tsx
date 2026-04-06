'use client';

import type { ExercisePhaseDefinition } from '@fitai/shared';

interface ExerciseInstructionsProps {
  exerciseName: string;
  muscleGroups: string[];
  phases: ExercisePhaseDefinition[];
  currentPhaseIndex: number;
  targetSets: number;
  completedSets: number;
  currentSet: number;
  targetReps: number;
  completedReps: number;
  weight: number | null;
  recommendation: string | null;
}

const muscleLabels: Record<string, string> = {
  CHEST: 'Prsa', BACK: 'Záda', SHOULDERS: 'Ramena',
  BICEPS: 'Biceps', TRICEPS: 'Triceps', QUADRICEPS: 'Stehna',
  HAMSTRINGS: 'Zadní stehna', GLUTES: 'Hýždě', CALVES: 'Lýtka',
  CORE: 'Core', FULL_BODY: 'Celé tělo',
};

export function ExerciseInstructions({
  exerciseName, muscleGroups, phases, currentPhaseIndex,
  targetSets, completedSets, currentSet, targetReps, completedReps,
  weight, recommendation,
}: ExerciseInstructionsProps) {
  const currentPhase = phases[currentPhaseIndex];

  return (
    <div className="flex h-full flex-col bg-gray-900/50 p-6">
      {/* Exercise name */}
      <h2 className="mb-2 text-2xl font-bold text-white">{exerciseName}</h2>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {muscleGroups.map((mg) => (
          <span key={mg} className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">
            {muscleLabels[mg] || mg}
          </span>
        ))}
      </div>

      {/* Set/Rep info */}
      <div className="mb-6 rounded-xl bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Set {currentSet + 1}/{targetSets}</p>
            <p className="text-3xl font-black text-white">{completedReps}/{targetReps}</p>
          </div>
          {weight && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Váha</p>
              <p className="text-2xl font-bold text-white">{weight}kg</p>
            </div>
          )}
        </div>
      </div>

      {/* Current phase */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">Aktuální fáze</p>
        <div className="rounded-lg bg-[#16a34a]/20 border border-[#16a34a]/30 p-3">
          <p className="text-lg font-semibold text-[#16a34a]">{currentPhase?.nameCs}</p>
          <p className="text-sm text-gray-400">{currentPhase?.feedback_correct}</p>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="mb-6 flex gap-1.5">
        {phases.map((phase, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full py-1 text-center text-xs ${
              i === currentPhaseIndex
                ? 'bg-[#16a34a] text-white font-medium'
                : i < currentPhaseIndex
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gray-800 text-gray-500'
            }`}
          >
            {phase.nameCs}
          </div>
        ))}
      </div>

      {/* Weight recommendation */}
      {recommendation && (
        <div className="mt-auto rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-3">
          <p className="text-sm text-[#F59E0B]">{recommendation}</p>
        </div>
      )}
    </div>
  );
}
