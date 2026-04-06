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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/exercises" className="mb-4 inline-block text-sm text-gray-400 hover:text-white">&larr; Zpět</Link>
        <h1 className="mb-2 text-3xl font-bold text-white">{exercise.nameCs}</h1>
        <p className="mb-6 text-gray-400">{exercise.descriptionCs}</p>

        <h2 className="mb-3 text-lg font-semibold text-white">Fáze pohybu</h2>
        <div className="space-y-3">
          {exercise.phases.map((phase: any, i: number) => (
            <div key={i} className="rounded-lg bg-gray-900 p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16a34a] text-xs font-bold text-white">
                  {i + 1}
                </span>
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
