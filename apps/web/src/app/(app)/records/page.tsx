'use client';

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getPersonalRecords } from '@/lib/api';

type PersonalRecord = {
  exerciseId: string; exerciseName: string; category: string;
  bestWeight: number; bestReps: number; date: string;
  delta: number | null; achievedAt: string;
  eccentricMs?: number; holdMs?: number; concentricMs?: number;
};

const FILTERS = [
  { v: 'ALL', l: 'All' },
  { v: 'COMPOUND', l: 'Compound' },
  { v: 'ISOLATION', l: 'Isolation' },
  { v: 'ACCESSORY', l: 'Accessory' },
];

export default function RecordsPage() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Personal Records'; }, []);

  useEffect(() => {
    getPersonalRecords()
      .then((data) => setRecords(data as any as PersonalRecord[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL'
    ? records
    : records.filter((r) => r.category === filter);

  if (loading) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Performance</V2SectionLabel>
        <V2Display size="xl">Personal Records.</V2Display>
      </section>

      {/* Filter tabs */}
      <section className="mb-10 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              filter === f.v
                ? 'bg-white text-black'
                : 'border border-white/10 text-white/50 hover:border-white/25 hover:text-white'
            }`}
          >
            {f.l}
          </button>
        ))}
      </section>

      {/* Empty state */}
      {filtered.length === 0 && (
        <section className="mb-32 rounded-2xl border border-white/8 p-12 text-center">
          <p className="mb-2 text-lg text-white/50">
            Zatim nemas zadne osobni rekordy.
          </p>
          <p className="text-sm text-white/30">
            Zacni trenovat!
          </p>
        </section>
      )}

      {/* PR grid */}
      {filtered.length > 0 && (
        <section className="stagger-container mb-32 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pr) => {
            const isExpanded = expanded === pr.exerciseId;
            const hasSectors = pr.eccentricMs || pr.holdMs || pr.concentricMs;
            return (
              <button
                key={pr.exerciseId}
                onClick={() => setExpanded(isExpanded ? null : pr.exerciseId)}
                className="stagger-item animate-fadeIn rounded-2xl border border-white/8 bg-white/[0.03] p-6 text-left transition hover:border-white/20"
              >
                {/* Category badge */}
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  {pr.category}
                </div>

                {/* Exercise name */}
                <div className="mb-4 text-base font-semibold tracking-tight text-white">
                  {pr.exerciseName}
                </div>

                {/* Big weight number */}
                <div className="mb-1 flex items-baseline gap-2">
                  <span
                    className="font-bold tabular-nums"
                    style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1, letterSpacing: '-0.04em' }}
                  >
                    {pr.bestWeight}
                  </span>
                  <span className="text-sm text-white/40">kg</span>
                </div>

                {/* Reps + delta row */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-white/55">
                    {pr.bestReps} reps
                  </span>
                  {pr.delta !== null && (
                    <span
                      className="flex items-center gap-1 text-sm font-semibold tabular-nums"
                      style={{ color: pr.delta >= 0 ? '#A8FF00' : '#FF375F' }}
                    >
                      {pr.delta >= 0 ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 10V2M6 2L2 6M6 2l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 2v8M6 10l-4-4M6 10l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {pr.delta > 0 ? '+' : ''}{pr.delta} kg
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="mt-3 text-[11px] text-white/30">
                  {new Date(pr.achievedAt).toLocaleDateString('cs-CZ', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </div>

                {/* Expanded sector times */}
                {isExpanded && hasSectors && (
                  <div className="mt-5 animate-scaleIn border-t border-white/8 pt-5">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                      Sector Times
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {pr.eccentricMs != null && (
                        <div>
                          <div className="text-[10px] text-white/30">Eccentric</div>
                          <div className="text-sm font-semibold tabular-nums text-[#00E5FF]">
                            {(pr.eccentricMs / 1000).toFixed(1)}s
                          </div>
                        </div>
                      )}
                      {pr.holdMs != null && (
                        <div>
                          <div className="text-[10px] text-white/30">Hold</div>
                          <div className="text-sm font-semibold tabular-nums text-[#FF9F0A]">
                            {(pr.holdMs / 1000).toFixed(1)}s
                          </div>
                        </div>
                      )}
                      {pr.concentricMs != null && (
                        <div>
                          <div className="text-[10px] text-white/30">Concentric</div>
                          <div className="text-sm font-semibold tabular-nums text-[#A8FF00]">
                            {(pr.concentricMs / 1000).toFixed(1)}s
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </section>
      )}
    </V2Layout>
  );
}
