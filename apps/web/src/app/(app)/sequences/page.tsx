'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { TRAINING_SEQUENCES, getCategoryColor, type TrainingSequence } from '@/lib/training-sequences';
import ExerciseModelPlaceholder from '@/components/exercise/exercise-model-placeholder';
import { ExerciseModelError } from '@/components/exercise/exercise-model-error';

const SequenceViewer = dynamic(
  () => import('@/components/exercise/sequence-viewer'),
  { ssr: false, loading: () => <ExerciseModelPlaceholder /> },
);

const FILTERS = ['all', 'warmup', 'boxing', 'hiit', 'golf'] as const;
const FILTER_LABELS: Record<string, string> = {
  all: 'Vse', warmup: 'Rozcvicka', boxing: 'Box/MMA', hiit: 'HIIT', golf: 'Golf',
};

export default function SequencesPage() {
  const [active, setActive] = useState<TrainingSequence | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? TRAINING_SEQUENCES
    : TRAINING_SEQUENCES.filter((s) => s.category === filter);

  return (
    <>
      <Link
        href="/sports"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Sporty
      </Link>

      <section className="pt-8 pb-12">
        <p className="v3-eyebrow-serif">Sekvence</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Plynule<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>treninky.</em>
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Kompletni treninky slozene z vice animaci — plynule prechody mezi cviky.
          Box kolo, HIIT, golf trenink, ranni rozcvicka.
        </p>
      </section>

      {/* Active sequence viewer */}
      {active && (
        <ExerciseModelError>
          <SequenceViewer steps={active.steps} />
        </ExerciseModelError>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              filter === f
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:text-white'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Sequence cards */}
      <section className="mb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((seq) => (
            <button
              key={seq.id}
              onClick={() => setActive(seq)}
              className={`rounded-xl border p-6 text-left transition ${
                active?.id === seq.id
                  ? 'border-white/25 bg-white/5'
                  : 'border-white/8 hover:border-white/15 hover:bg-white/3'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: getCategoryColor(seq.category) }}
                >
                  {seq.category} · {seq.durationMin} min
                </span>
                <span className="text-[10px] tabular-nums text-white/30">
                  {seq.steps.length} kroku
                </span>
              </div>
              <div className="text-lg font-bold text-white">{seq.nameCs}</div>
              <p className="mt-2 text-sm text-white/40">{seq.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {seq.steps.map((s, i) => (
                  <span key={i} className="rounded bg-white/8 px-2 py-0.5 text-[9px] text-white/40">
                    {s.nameCs}
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
