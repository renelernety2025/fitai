'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import {
  getQuickWorkout,
  getHomeWorkout,
  getTravelWorkout,
  type HomeWorkoutData,
} from '@/lib/api';

type Mode = 'quick' | 'home' | 'travel';

const MODES: { value: Mode; label: string; emoji: string; desc: string }[] = [
  { value: 'quick', label: 'Rychlý 15min', emoji: '⚡', desc: 'Nemáš čas? 15 minut, plné tělo, bez vybavení.' },
  { value: 'home', label: 'Doma 35min', emoji: '🏠', desc: 'Plnohodnotný workout doma. Žádné vybavení.' },
  { value: 'travel', label: 'Na cestách 20min', emoji: '✈️', desc: 'Hotel, byt, dovolená — 20 minut, malý prostor.' },
];

export default function HomeTrainingPage() {
  const [mode, setMode] = useState<Mode>('quick');
  const [workout, setWorkout] = useState<HomeWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fn =
      mode === 'quick' ? getQuickWorkout : mode === 'home' ? getHomeWorkout : getTravelWorkout;
    fn()
      .then(setWorkout)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mode]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Trénink doma & na cestách</h1>
        <p className="mb-6 text-gray-400">
          Bez vybavení, bez výmluv. Vyber si režim podle situace.
        </p>

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`rounded-xl border p-4 text-left transition ${
                mode === m.value
                  ? 'border-[#16a34a] bg-[#16a34a]/10'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-700'
              }`}
            >
              <div className="mb-1 text-2xl">{m.emoji}</div>
              <div className="font-semibold text-white">{m.label}</div>
              <div className="mt-1 text-xs text-gray-400">{m.desc}</div>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Načítání...</p>
        ) : workout ? (
          <div className="rounded-xl bg-gray-900 p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-2xl font-bold text-white">{workout.title}</h2>
              <span className="text-sm text-gray-400">{workout.durationMin} min</span>
            </div>
            <div className="mb-6 flex gap-4 text-sm text-gray-400">
              <span>🔁 {workout.rounds} kola</span>
              <span>⏱ {workout.rest}</span>
            </div>

            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Cviky v jednom kole
            </h3>
            <ol className="space-y-3">
              {workout.exercises.map((ex, i) => (
                <li
                  key={ex.id}
                  className="flex items-center justify-between rounded-lg bg-gray-800 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16a34a] text-sm font-bold text-white">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{ex.nameCs}</div>
                      <div className="text-xs text-gray-500">
                        {ex.muscleGroups.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#16a34a]">{ex.reps}</div>
                    {ex.duration && (
                      <div className="text-xs text-gray-500">{ex.duration}s</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 rounded-lg bg-blue-500/10 p-4 text-sm text-blue-300">
              💡 Workout je sada cviků v {workout.rounds} kolech. Mezi cviky{' '}
              {workout.rest.toLowerCase()}.
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Workout se nepodařilo načíst.</p>
        )}
      </main>
    </div>
  );
}
