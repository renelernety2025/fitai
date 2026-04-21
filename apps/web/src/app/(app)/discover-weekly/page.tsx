'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getDiscoverWeekly } from '@/lib/api';

export default function DiscoverWeeklyPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    getDiscoverWeekly().then(setData).catch(() => setErr(true));
  }, []);

  const exercises = data?.exercises || [];

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Tvuj tydenni mix</V2SectionLabel>
        <V2Display size="xl">Discover Weekly.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          AI vybral trenink presne pro tebe. Novy kazde pondeli.
        </p>
      </section>

      {err && (
        <p className="mb-8 text-sm text-[#FF375F]">
          Nepodarilo se nacist. Zkus to pozdeji.
        </p>
      )}

      {data && (
        <>
          {/* Workout title & description */}
          <section className="mb-12 rounded-2xl border border-[#A8FF00]/15 bg-[#A8FF00]/5 p-8">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
              {data.title || 'Trenink tydne'}
            </h2>
            {data.description && (
              <p className="text-sm leading-relaxed text-white/60">{data.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-[11px] text-white/40">
              {data.estimatedMinutes && (
                <span>{data.estimatedMinutes} min</span>
              )}
              {data.difficulty && (
                <span className="rounded-full bg-white/8 px-3 py-1">{data.difficulty}</span>
              )}
            </div>
          </section>

          {/* Exercise list */}
          {exercises.length === 0 && (
            <div className="mb-12 py-12 text-center text-white/30">
              <p className="text-sm">Zatim zadne cviky v tomto tydennim mixu.</p>
            </div>
          )}
          <section className="mb-12 space-y-1">
            {exercises.map((ex: any, i: number) => (
              <div key={ex.id || i}
                className="flex items-start gap-5 border-b border-white/8 py-6 last:border-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#A8FF00]/20 text-sm font-bold text-[#A8FF00]">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-white">
                      {ex.nameCs || ex.name}
                    </span>
                    {ex.muscleGroups && (
                      <span className="text-[10px] text-white/30">
                        {(Array.isArray(ex.muscleGroups) ? ex.muscleGroups : []).join(' · ')}
                      </span>
                    )}
                  </div>
                  {ex.sets && (
                    <div className="mt-1 text-xs text-white/50">
                      {ex.sets}x{ex.reps} {ex.weightKg ? `@ ${ex.weightKg}kg` : ''}
                      {ex.restSeconds ? ` · ${ex.restSeconds}s pauza` : ''}
                    </div>
                  )}
                  {ex.rationale && (
                    <div className="mt-2 rounded-lg bg-white/3 px-3 py-2 text-[11px] italic text-[#A8FF00]/70">
                      Proc: {ex.rationale}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* CTA */}
          <div className="mb-16 flex flex-col items-center gap-4">
            <Link href="/gym/start"
              className="inline-flex items-center gap-3 rounded-full bg-[#A8FF00] px-10 py-4 text-base font-bold text-black transition hover:scale-105"
            >
              Zacit trenink →
            </Link>
            <p className="text-[11px] text-white/30">
              Novy trenink kazde pondeli
            </p>
          </div>
        </>
      )}

      {!data && !err && (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#A8FF00]" />
        </div>
      )}
    </V2Layout>
  );
}
