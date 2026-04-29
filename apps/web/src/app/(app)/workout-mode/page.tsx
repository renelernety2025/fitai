'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TRAINING_SEQUENCES, getCategoryColor, type TrainingSequence } from '@/lib/training-sequences';
import FollowAlongWorkout from '@/components/workout/follow-along-workout';

export default function WorkoutModePage() {
  const [active, setActive] = useState<TrainingSequence | null>(null);
  const [finished, setFinished] = useState(false);
  const [totalSec, setTotalSec] = useState(0);

  const workouts = TRAINING_SEQUENCES.filter((s) => s.workout && s.workout.length > 0);

  function handleFinish(sec: number) {
    setTotalSec(sec);
    setFinished(true);
    setActive(null);
  }

  // Active workout — full screen
  if (active?.workout) {
    return (
      <FollowAlongWorkout
        title={active.nameCs}
        steps={active.workout}
        onFinish={handleFinish}
      />
    );
  }

  return (
    <>
      <Link
        href="/sports"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Sporty
      </Link>

      <section className="pt-8 pb-12">
        <p className="v3-eyebrow-serif">Follow-along</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Workout<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>Mode.</em>
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Cvic spolecne s 3D modelem. Timer ti rekne kdy zacit, kdy odpocivat,
          kdy prepnout. Staci sledovat a delat to same.
        </p>
      </section>

      {/* Post-workout message */}
      {finished && (
        <div className="mb-12 rounded-2xl border border-[var(--sage)]/20 bg-[var(--sage)]/5 p-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--sage)]">
            Trenink dokoncen!
          </p>
          <p className="mt-2 text-3xl font-bold text-white">
            {Math.floor(totalSec / 60)}:{(totalSec % 60).toString().padStart(2, '0')}
          </p>
        </div>
      )}

      {/* Workout cards */}
      <section className="mb-24">
        <p className="v3-eyebrow">Vyber trenink</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {workouts.map((seq) => (
            <button
              key={seq.id}
              onClick={() => { setFinished(false); setActive(seq); }}
              className="group rounded-xl border border-white/8 p-6 text-left transition hover:border-white/20 hover:bg-white/3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: getCategoryColor(seq.category) }}
                >
                  {seq.category} · {seq.durationMin} min
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/50 transition group-hover:bg-[var(--sage)] group-hover:text-black">
                  START
                </span>
              </div>
              <div className="text-lg font-bold text-white">{seq.nameCs}</div>
              <p className="mt-2 text-sm text-white/40">{seq.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {seq.workout!.map((s, i) => (
                  <span key={i} className="rounded bg-white/8 px-2 py-0.5 text-[9px] tabular-nums text-white/40">
                    {s.nameCs} {s.durationSec}s
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
