'use client';

import { useState } from 'react';
import type { ExercisePhaseDefinition } from '@fitai/shared';

interface ExerciseInstructionsData {
  steps?: string[];
  commonMistakes?: string[];
  targetMuscles?: { primary: string[]; secondary: string[] };
  breathing?: string;
  tempo?: string;
  warmup?: string;
  tips?: string[];
}

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
  instructions?: ExerciseInstructionsData | null;
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
  weight, recommendation, instructions,
}: ExerciseInstructionsProps) {
  const currentPhase = phases[currentPhaseIndex];
  const [showDetail, setShowDetail] = useState(false);
  const inst = instructions || {};

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-900/50 p-6">
      {/* Exercise name + muscles */}
      <h2 className="mb-1 text-2xl font-bold text-white">{exerciseName}</h2>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {muscleGroups.map((mg) => (
          <span key={mg} className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-300">
            {muscleLabels[mg] || mg}
          </span>
        ))}
      </div>

      {/* Set/Rep info */}
      <div className="mb-4 rounded-xl bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Set {currentSet + 1}/{targetSets}</p>
            <p className="text-3xl font-black text-white">{completedReps}/{targetReps}</p>
          </div>
          <div className="text-right">
            {weight ? (
              <>
                <p className="text-sm text-gray-400">Váha</p>
                <p className="text-2xl font-bold text-white">{weight}kg</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Bodyweight</p>
            )}
          </div>
        </div>
        {inst.tempo && (
          <p className="mt-2 text-xs text-gray-500">Tempo: {inst.tempo}</p>
        )}
      </div>

      {/* Current phase */}
      <div className="mb-3">
        <div className="rounded-lg border border-[#16a34a]/30 bg-[#16a34a]/20 p-3">
          <p className="text-lg font-semibold text-[#16a34a]">{currentPhase?.nameCs}</p>
          <p className="text-sm text-gray-400">{currentPhase?.feedback_correct}</p>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="mb-4 flex gap-1.5">
        {phases.map((phase, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full py-1 text-center text-xs ${
              i === currentPhaseIndex
                ? 'bg-[#16a34a] font-medium text-white'
                : i < currentPhaseIndex
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gray-800 text-gray-500'
            }`}
          >
            {phase.nameCs}
          </div>
        ))}
      </div>

      {/* Breathing */}
      {inst.breathing && (
        <div className="mb-3 rounded-lg bg-blue-900/20 border border-blue-800/30 px-3 py-2">
          <p className="text-xs text-blue-300">{inst.breathing}</p>
        </div>
      )}

      {/* Toggle detail */}
      <button
        onClick={() => setShowDetail(!showDetail)}
        className="mb-3 text-left text-xs text-[#16a34a] hover:underline"
      >
        {showDetail ? '▼ Skrýt instrukce' : '▶ Zobrazit instrukce k cviku'}
      </button>

      {showDetail && inst.steps && (
        <div className="mb-4 space-y-3">
          {/* Steps */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Postup</p>
            <ol className="space-y-1">
              {inst.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-gray-300">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-700 text-[10px] text-gray-400">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Common mistakes */}
          {inst.commonMistakes && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-400">Časté chyby</p>
              <ul className="space-y-0.5">
                {inst.commonMistakes.map((m, i) => (
                  <li key={i} className="text-xs text-red-300/70">✗ {m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Target muscles */}
          {inst.targetMuscles && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Svaly</p>
              <p className="text-xs text-green-400">Hlavní: {inst.targetMuscles.primary.join(', ')}</p>
              <p className="text-xs text-gray-400">Vedlejší: {inst.targetMuscles.secondary.join(', ')}</p>
            </div>
          )}

          {/* Tips */}
          {inst.tips && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Tipy</p>
              {inst.tips.map((tip, i) => (
                <p key={i} className="text-xs text-[#F59E0B]">💡 {tip}</p>
              ))}
            </div>
          )}

          {/* Warmup */}
          {inst.warmup && (
            <div className="rounded-lg bg-gray-800 px-3 py-2">
              <p className="text-xs text-gray-400">🔥 Zahřívání: {inst.warmup}</p>
            </div>
          )}
        </div>
      )}

      {/* Weight recommendation */}
      {recommendation && (
        <div className="mt-auto rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-3">
          <p className="text-sm text-[#F59E0B]">{recommendation}</p>
        </div>
      )}
    </div>
  );
}
