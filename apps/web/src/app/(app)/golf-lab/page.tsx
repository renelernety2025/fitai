'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { GOLF_SHOTS, type SportAnimation } from '@/lib/sport-animations';
import ExerciseModelPlaceholder from '@/components/exercise/exercise-model-placeholder';
import { ExerciseModelError } from '@/components/exercise/exercise-model-error';

const SportViewer = dynamic(
  () => import('@/components/exercise/sport-viewer'),
  { ssr: false, loading: () => <ExerciseModelPlaceholder /> },
);

const SHOT_COLORS: Record<string, string> = {
  long: 'var(--accent)',
  short: '#FF9F0A',
  putt: 'var(--sage)',
};

export default function GolfLabPage() {
  const [activeShot, setActiveShot] = useState<SportAnimation>(GOLF_SHOTS[0]);

  return (
    <>
      <Link
        href="/sports"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Sporty
      </Link>

      <section className="pt-8 pb-12">
        <p className="v3-eyebrow-serif">Vizualizace svingu</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Golf Swing<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>Lab.</em>
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Procvic golfovy sving s 3D modelem. Drive, chip, putt — kazdý uder z ruzneho uhlu.
        </p>
      </section>

      {/* 3D viewer */}
      <ExerciseModelError>
        <SportViewer clipPath={activeShot.clipPath} speed={activeShot.speed} />
      </ExerciseModelError>

      {/* Shot name */}
      <div className="mb-8 text-center">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: SHOT_COLORS[activeShot.category] }}
        >
          {activeShot.nameCs}
        </span>
      </div>

      {/* Shot selector */}
      <section className="mb-24">
        <p className="v3-eyebrow">Typ uderu</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GOLF_SHOTS.map((shot) => (
            <button
              key={shot.name}
              onClick={() => setActiveShot(shot)}
              className={`rounded-xl border p-6 text-left transition ${
                activeShot.name === shot.name
                  ? 'border-white/25 bg-white/5'
                  : 'border-white/8 hover:border-white/15 hover:bg-white/3'
              }`}
            >
              <div
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: SHOT_COLORS[shot.category] }}
              >
                {shot.category}
              </div>
              <div className="text-lg font-bold text-white">{shot.nameCs}</div>
              <div className="mt-1 text-sm text-white/40">{shot.name}</div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
