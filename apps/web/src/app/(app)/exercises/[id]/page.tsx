'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { getExercise, type ExerciseData } from '@/lib/api';

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  const [exercise, setExercise] = useState<ExerciseData | null>(null);

  useEffect(() => {
    getExercise(params.id).then(setExercise).catch(console.error);
  }, [params.id]);

  if (!exercise) {
    return <div className="min-h-screen bg-[#0a0a0a]"><Header /><p className="p-8 text-gray-500">Načítání...</p></div>;
  }

  const inst = (exercise as any).instructions || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/exercises" className="mb-4 inline-block text-sm text-gray-400 hover:text-white">&larr; Zpět</Link>
        <h1 className="mb-2 text-3xl font-bold text-white">{exercise.nameCs}</h1>
        <p className="mb-6 text-gray-400">{exercise.descriptionCs}</p>

        {/* Target muscles */}
        {inst.targetMuscles && (
          <div className="mb-6 rounded-xl bg-gray-900 p-5">
            <h2 className="mb-3 text-lg font-semibold text-white">Cílové svaly</h2>
            <p className="mb-1 text-sm text-green-400">Hlavní: {inst.targetMuscles.primary.join(', ')}</p>
            <p className="text-sm text-gray-400">Vedlejší: {inst.targetMuscles.secondary.join(', ')}</p>
          </div>
        )}

        {/* Step by step instructions */}
        {inst.steps && (
          <div className="mb-6 rounded-xl bg-gray-900 p-5">
            <h2 className="mb-3 text-lg font-semibold text-white">Jak na to</h2>
            <ol className="space-y-2">
              {inst.steps.map((step: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-xs font-bold text-white">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Breathing + Tempo */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {inst.breathing && (
            <div className="rounded-xl bg-blue-900/20 border border-blue-800/30 p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-blue-400">Dýchání</p>
              <p className="text-sm text-blue-200">{inst.breathing}</p>
            </div>
          )}
          {inst.tempo && (
            <div className="rounded-xl bg-gray-900 p-4">
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Tempo</p>
              <p className="text-sm text-white">{inst.tempo}</p>
            </div>
          )}
        </div>

        {/* Common mistakes */}
        {inst.commonMistakes && (
          <div className="mb-6 rounded-xl bg-red-900/10 border border-red-800/20 p-5">
            <h2 className="mb-3 text-lg font-semibold text-red-400">Časté chyby</h2>
            <ul className="space-y-1.5">
              {inst.commonMistakes.map((m: string, i: number) => (
                <li key={i} className="text-sm text-red-300/80">✗ {m}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tips */}
        {inst.tips && (
          <div className="mb-6 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-5">
            <h2 className="mb-3 text-lg font-semibold text-[#F59E0B]">Tipy</h2>
            {inst.tips.map((tip: string, i: number) => (
              <p key={i} className="mb-1 text-sm text-yellow-200/80">💡 {tip}</p>
            ))}
          </div>
        )}

        {/* Warmup */}
        {inst.warmup && (
          <div className="mb-6 rounded-xl bg-gray-900 p-5">
            <h2 className="mb-2 text-lg font-semibold text-white">Zahřívání</h2>
            <p className="text-sm text-gray-300">🔥 {inst.warmup}</p>
          </div>
        )}

        {/* Movement phases */}
        <h2 className="mb-3 text-lg font-semibold text-white">Fáze pohybu</h2>
        <div className="space-y-3">
          {exercise.phases.map((phase: any, i: number) => (
            <div key={i} className="rounded-lg bg-gray-900 p-4">
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16a34a] text-xs font-bold text-white">{i + 1}</span>
                <h3 className="font-semibold text-white">{phase.nameCs}</h3>
                <span className="text-xs text-gray-500">{phase.phase}</span>
              </div>
              <p className="mb-1 text-sm text-green-400">{phase.feedback_correct}</p>
              <p className="text-sm text-red-400">{phase.feedback_wrong}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {phase.rules.map((r: any, j: number) => (
                  <span key={j} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                    {r.joint}: {r.angle_min}°–{r.angle_max}°
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
