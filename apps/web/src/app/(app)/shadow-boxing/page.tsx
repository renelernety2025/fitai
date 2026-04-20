'use client';

import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import {
  BOXING_COMBOS,
  BOXING_MOVES,
  generateBoxingRound,
  type BoxingCombo,
} from '@/lib/sport-animations';
import ExerciseModelPlaceholder from '@/components/exercise/exercise-model-placeholder';
import { ExerciseModelError } from '@/components/exercise/exercise-model-error';

const SportViewer = dynamic(
  () => import('@/components/exercise/sport-viewer'),
  { ssr: false, loading: () => <ExerciseModelPlaceholder /> },
);

const DIFFICULTIES = [
  { v: 'beginner' as const, l: 'Zacatecnik', color: '#A8FF00' },
  { v: 'intermediate' as const, l: 'Pokrocily', color: '#FF9F0A' },
  { v: 'advanced' as const, l: 'Expert', color: '#FF375F' },
];

export default function ShadowBoxingPage() {
  const [difficulty, setDifficulty] = useState<BoxingCombo['difficulty']>('beginner');
  const [activeCombo, setActiveCombo] = useState<BoxingCombo | null>(null);
  const [activeMoveIdx, setActiveMoveIdx] = useState(0);
  const [round, setRound] = useState<BoxingCombo[]>([]);

  const activeMove = useMemo(() => {
    if (!activeCombo) return null;
    const moveName = activeCombo.moves[activeMoveIdx];
    return BOXING_MOVES.find((m) => m.name === moveName) ?? null;
  }, [activeCombo, activeMoveIdx]);

  function startCombo(combo: BoxingCombo) {
    setActiveCombo(combo);
    setActiveMoveIdx(0);
  }

  function nextMove() {
    if (!activeCombo) return;
    if (activeMoveIdx < activeCombo.moves.length - 1) {
      setActiveMoveIdx((i) => i + 1);
    } else {
      setActiveMoveIdx(0);
    }
  }

  function generateRound() {
    setRound(generateBoxingRound(6, difficulty));
  }

  return (
    <V2Layout>
      <Link
        href="/sports"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Sporty
      </Link>

      <section className="pt-8 pb-12">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#FF375F]">
          Bojovy sport · Cardio · Koordinace
        </div>
        <V2Display size="xl">Shadow Boxing.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Procvic kombinace uderu s 3D vizualizaci. Kazdy pohyb se zobrazi na modelu.
        </p>
      </section>

      {/* 3D viewer */}
      {activeMove && (
        <ExerciseModelError>
          <SportViewer clipPath={activeMove.clipPath} speed={activeMove.speed} />
        </ExerciseModelError>
      )}

      {/* Active combo display */}
      {activeCombo && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <V2Display size="md">{activeCombo.nameCs}</V2Display>
              <p className="mt-1 text-sm text-white/40">{activeCombo.description}</p>
            </div>
            <button
              onClick={nextMove}
              className="rounded-full bg-[#FF375F] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
            >
              Dalsi uder →
            </button>
          </div>
          <div className="flex gap-2">
            {activeCombo.moves.map((move, i) => (
              <button
                key={i}
                onClick={() => setActiveMoveIdx(i)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  i === activeMoveIdx
                    ? 'border-[#FF375F] bg-[#FF375F]/10 text-[#FF375F]'
                    : 'border-white/10 text-white/50 hover:border-white/25'
                }`}
              >
                {move}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Difficulty filter */}
      <section className="mb-8">
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.v}
              onClick={() => setDifficulty(d.v)}
              className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
                difficulty === d.v ? 'text-black' : 'border-white/15 text-white/60 hover:text-white'
              }`}
              style={difficulty === d.v ? { borderColor: d.color, backgroundColor: d.color } : undefined}
            >
              {d.l}
            </button>
          ))}
        </div>
      </section>

      {/* Combo list */}
      <section className="mb-16">
        <V2SectionLabel>Kombinace</V2SectionLabel>
        <div className="space-y-3">
          {BOXING_COMBOS.filter(
            (c) => c.difficulty === difficulty || c.difficulty === 'beginner',
          ).map((combo) => (
            <button
              key={combo.name}
              onClick={() => startCombo(combo)}
              className={`block w-full rounded-xl border p-5 text-left transition ${
                activeCombo?.name === combo.name
                  ? 'border-[#FF375F]/30 bg-[#FF375F]/5'
                  : 'border-white/8 hover:border-white/15 hover:bg-white/3'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">{combo.nameCs}</span>
                  <span className="ml-3 text-sm text-white/40">{combo.name}</span>
                </div>
                <div className="flex gap-1">
                  {combo.moves.map((m, i) => (
                    <span key={i} className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Generate round */}
      <section className="mb-24">
        <V2SectionLabel>Generuj kolo</V2SectionLabel>
        <button
          onClick={generateRound}
          className="mb-6 rounded-xl border border-[#FF375F]/30 px-6 py-3 text-sm font-semibold text-[#FF375F] transition hover:bg-[#FF375F]/10"
        >
          Generuj 6 kombinaci
        </button>
        {round.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {round.map((combo, i) => (
              <button
                key={i}
                onClick={() => startCombo(combo)}
                className="rounded-xl border border-white/8 p-4 text-left transition hover:border-white/15"
              >
                <div className="mb-1 text-lg font-bold tabular-nums text-white/20">{i + 1}</div>
                <div className="text-sm font-semibold text-white">{combo.nameCs}</div>
                <div className="mt-1 text-[10px] text-white/40">{combo.moves.join(' → ')}</div>
              </button>
            ))}
          </div>
        )}
      </section>
    </V2Layout>
  );
}
