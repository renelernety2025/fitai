'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getExercise, type ExerciseData } from '@/lib/api';

export default function ExerciseV2DetailPage({ params }: { params: { id: string } }) {
  const [ex, setEx] = useState<ExerciseData | null>(null);

  useEffect(() => {
    getExercise(params.id).then(setEx).catch(console.error);
  }, [params.id]);

  if (!ex) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  const inst = (ex as any).instructions || {};

  return (
    <V2Layout>
      <Link
        href="/exercises"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Cviky
      </Link>

      <section className="pt-8 pb-16">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          {ex.muscleGroups.join(' · ')}
        </div>
        <V2Display size="xl">{ex.nameCs}</V2Display>
        <p className="mt-4 max-w-2xl text-base text-white/55">{ex.descriptionCs}</p>
      </section>

      {/* Target muscles */}
      {inst.targetMuscles && (
        <section className="mb-24">
          <V2SectionLabel>Cílové svaly</V2SectionLabel>
          <div className="space-y-2">
            <p className="text-base text-white">
              <span className="text-[#A8FF00]">Hlavní:</span>{' '}
              {inst.targetMuscles.primary?.join(', ')}
            </p>
            {inst.targetMuscles.secondary && (
              <p className="text-base text-white/60">
                <span className="text-white/40">Vedlejší:</span>{' '}
                {inst.targetMuscles.secondary.join(', ')}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Steps */}
      {inst.steps && (
        <section className="mb-24">
          <V2SectionLabel>Jak na to</V2SectionLabel>
          <ol className="space-y-6">
            {inst.steps.map((step: string, i: number) => (
              <li key={i} className="flex gap-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm font-bold tabular-nums text-white">
                  {i + 1}
                </div>
                <p className="pt-1 text-base leading-relaxed text-white/80">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Breathing & Tempo */}
      {(inst.breathing || inst.tempo) && (
        <section className="mb-24 grid grid-cols-1 gap-12 sm:grid-cols-2">
          {inst.breathing && (
            <div>
              <V2SectionLabel>Dýchání</V2SectionLabel>
              <p className="text-lg leading-relaxed text-white/75">{inst.breathing}</p>
            </div>
          )}
          {inst.tempo && (
            <div>
              <V2SectionLabel>Tempo</V2SectionLabel>
              <p className="text-lg leading-relaxed text-white/75">{inst.tempo}</p>
            </div>
          )}
        </section>
      )}

      {/* Common mistakes */}
      {inst.commonMistakes && (
        <section className="mb-24">
          <V2SectionLabel>Časté chyby</V2SectionLabel>
          <ul className="space-y-3">
            {inst.commonMistakes.map((m: string, i: number) => (
              <li key={i} className="flex gap-3 text-base text-white/75">
                <span className="text-[#FF375F]">✗</span>
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tips */}
      {inst.tips && (
        <section className="mb-24">
          <V2SectionLabel>Tipy</V2SectionLabel>
          <ul className="space-y-3">
            {inst.tips.map((tip: string, i: number) => (
              <li key={i} className="flex gap-3 text-base text-white/75">
                <span className="text-[#FF9F0A]">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Warmup */}
      {inst.warmup && (
        <section className="mb-24">
          <V2SectionLabel>Zahřívání</V2SectionLabel>
          <p className="text-lg leading-relaxed text-white/75">{inst.warmup}</p>
        </section>
      )}

      {/* Phases */}
      <section className="mb-24">
        <V2SectionLabel>Fáze pohybu</V2SectionLabel>
        <div className="space-y-1">
          {ex.phases.map((phase: any, i: number) => (
            <div key={i} className="border-b border-white/8 py-6">
              <div className="mb-2 flex items-baseline gap-3">
                <div className="font-bold tabular-nums text-white/40">{i + 1}.</div>
                <V2Display size="sm">{phase.nameCs}</V2Display>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  {phase.phase}
                </span>
              </div>
              <p className="ml-7 text-sm text-[#A8FF00]">{phase.feedback_correct}</p>
              <p className="ml-7 text-sm text-[#FF375F]">{phase.feedback_wrong}</p>
            </div>
          ))}
        </div>
      </section>
    </V2Layout>
  );
}
