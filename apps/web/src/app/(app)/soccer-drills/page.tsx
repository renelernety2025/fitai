'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { SOCCER_MOVES, type SportAnimation } from '@/lib/sport-animations';
import ExerciseModelPlaceholder from '@/components/exercise/exercise-model-placeholder';
import { ExerciseModelError } from '@/components/exercise/exercise-model-error';

const SportViewer = dynamic(
  () => import('@/components/exercise/sport-viewer'),
  { ssr: false, loading: () => <ExerciseModelPlaceholder /> },
);

const CAT_COLORS: Record<string, string> = {
  attack: '#FF375F',
  defense: '#FF9F0A',
  goalkeeper: '#30D5C8',
};

export default function SoccerDrillsPage() {
  const [active, setActive] = useState<SportAnimation>(SOCCER_MOVES[0]);

  return (
    <>
      <Link
        href="/sports"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Sporty
      </Link>

      <section className="pt-8 pb-12">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#30D5C8]">
          Utok · Obrana · Brankar
        </div>
        <V2Display size="xl">Soccer Drills.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Fotbalove dovednosti s 3D vizualizaci — hlavicky, prihrávky, brankarsky trenink.
        </p>
      </section>

      <ExerciseModelError>
        <SportViewer clipPath={active.clipPath} speed={active.speed} />
      </ExerciseModelError>

      <div className="mb-8 text-center">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: CAT_COLORS[active.category] }}
        >
          {active.nameCs}
        </span>
      </div>

      <section className="mb-24">
        <V2SectionLabel>Dovednosti</V2SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOCCER_MOVES.map((move) => (
            <button
              key={move.name}
              onClick={() => setActive(move)}
              className={`rounded-xl border p-5 text-left transition ${
                active.name === move.name
                  ? 'border-white/25 bg-white/5'
                  : 'border-white/8 hover:border-white/15 hover:bg-white/3'
              }`}
            >
              <div
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: CAT_COLORS[move.category] }}
              >
                {move.category}
              </div>
              <div className="text-sm font-bold text-white">{move.nameCs}</div>
              <div className="mt-1 text-[11px] text-white/40">{move.name}</div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
