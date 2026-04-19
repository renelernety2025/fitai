'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getMicroWorkout, type MicroWorkoutData } from '@/lib/api';

export default function MicroWorkoutPage() {
  const [data, setData] = useState<MicroWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);

  function loadChallenge() {
    setLoading(true);
    getMicroWorkout()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadChallenge(); }, []);

  return (
    <V2Layout>
      <Link
        href="/dashboard"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Dashboard
      </Link>

      <section className="pt-8 pb-8">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#FF9F0A]">
          5 minut - 3 cviky - zadne vymluvy
        </div>
        <V2Display size="xl">Micro Workout</V2Display>
        <p className="mt-4 max-w-2xl text-base text-white/55">
          Denni 5-minutovy challenge. 3 nahodne cviky, 2 sety po 12 repech, 30s pauza.
          Zadny plan, zadne premysleni — proste zacni.
        </p>
      </section>

      {loading && (
        <div className="flex h-40 items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      )}

      {data && !loading && (
        <>
          <section className="mb-12">
            <V2SectionLabel>Dnesni challenge</V2SectionLabel>
            <div className="space-y-4">
              {data.exercises.map((ex, i) => (
                <Link
                  key={ex.id}
                  href={`/exercises/${ex.id}`}
                  className="block rounded-xl border border-white/8 p-5 transition hover:border-white/15 hover:bg-white/3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-lg font-bold text-white/60">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{ex.nameCs}</div>
                        <div className="text-[11px] text-white/40">
                          {ex.muscleGroups.join(' · ')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-white/50">
                      <div>{ex.targetSets}x{ex.targetReps}</div>
                      <div className="text-[10px] text-white/30">{ex.restSeconds}s pauza</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div className="mb-24 flex gap-4">
            <button
              onClick={loadChallenge}
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/60 transition hover:border-white/30 hover:text-white"
            >
              Jiny challenge
            </button>
          </div>
        </>
      )}
    </V2Layout>
  );
}
