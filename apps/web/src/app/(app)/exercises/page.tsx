'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { getExercises, type ExerciseData } from '@/lib/api';

const MUSCLE_GROUPS = ['ALL', 'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CORE'];
const muscleLabels: Record<string, string> = {
  ALL: 'Vše', CHEST: 'Prsa', BACK: 'Záda', SHOULDERS: 'Ramena',
  BICEPS: 'Biceps', TRICEPS: 'Triceps', QUADRICEPS: 'Stehna',
  HAMSTRINGS: 'Zadní stehna', GLUTES: 'Hýždě', CORE: 'Core',
};

const difficultyColors: Record<string, string> = {
  BEGINNER: 'bg-green-600', INTERMEDIATE: 'bg-blue-600', ADVANCED: 'bg-red-600',
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filters = filter !== 'ALL' ? { muscleGroup: filter } : undefined;
    getExercises(filters)
      .then(setExercises)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Knihovna cviků</h1>

        <div className="mb-8 flex flex-wrap gap-2">
          {MUSCLE_GROUPS.map((mg) => (
            <button
              key={mg}
              onClick={() => setFilter(mg)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === mg ? 'bg-[#16a34a] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {muscleLabels[mg] || mg}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-800 p-6">
                <div className="mb-3 h-6 w-2/3 rounded bg-gray-700" />
                <div className="h-4 w-1/2 rounded bg-gray-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex) => (
              <Link
                key={ex.id}
                href={`/exercises/${ex.id}`}
                className="group rounded-xl bg-gray-900 p-6 transition hover:bg-gray-800"
              >
                <h3 className="mb-2 text-lg font-semibold text-white">{ex.nameCs}</h3>
                <p className="mb-3 text-sm text-gray-400 line-clamp-2">{ex.descriptionCs}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${difficultyColors[ex.difficulty] || 'bg-gray-600'}`}>
                    {ex.difficulty === 'BEGINNER' ? 'Začátečník' : ex.difficulty === 'INTERMEDIATE' ? 'Pokročilý' : 'Expert'}
                  </span>
                  {ex.muscleGroups.map((mg) => (
                    <span key={mg} className="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                      {muscleLabels[mg] || mg}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-500">{ex.phases.length} fází</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
