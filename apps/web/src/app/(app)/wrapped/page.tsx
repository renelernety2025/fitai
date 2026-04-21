'use client';

/**
 * FitAI Wrapped — Spotify-Wrapped-inspired monthly/yearly stats recap.
 * Monumental typography, gradient section backgrounds, shareable card layout.
 */

import { useEffect, useState, useCallback } from 'react';
import { V2Layout, V2SectionLabel } from '@/components/v2/V2Layout';
import { getWrapped } from '@/lib/api';

type Period = 'monthly' | 'yearly';

interface WrappedData {
  totalWorkouts: number;
  totalHours: number;
  totalVolume: number;
  prCount: number;
  longestStreak: number;
  topExercises: { name: string; count: number }[];
  mostActiveDay: string;
  avgFormPercent: number;
  avgRecoveryScore: number;
  aiSummary: string;
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-');
  const names = ['Leden','Unor','Brezen','Duben','Kveten','Cerven','Cervenec','Srpen','Zari','Rijen','Listopad','Prosinec'];
  return `${names[parseInt(mo, 10) - 1]} ${y}`;
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function StatCard({ value, label, gradient }: {
  value: string | number;
  label: string;
  gradient: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6"
      style={{ background: gradient }}
    >
      <div
        className="font-bold tabular-nums tracking-tight text-white"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.05em', lineHeight: 1 }}
      >
        {typeof value === 'number' ? value.toLocaleString('cs-CZ') : value}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
        {label}
      </div>
    </div>
  );
}

export default function WrappedPage() {
  const [period, setPeriod] = useState<Period>('monthly');
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const m = period === 'monthly' ? month : undefined;
    getWrapped(period, m)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period, month]);

  useEffect(() => { load(); }, [load]);

  function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'FitAI Wrapped', text: data?.aiSummary || '', url: window.location.href }).catch(() => {});
    }
  }

  const title = period === 'monthly'
    ? `Tvuj ${monthLabel(month).toLowerCase()} v cislech`
    : 'Tvuj rok v cislech';

  return (
    <V2Layout>
      <section className="pt-12 pb-24">
        {/* Period toggle */}
        <div className="mb-10 flex items-center gap-4">
          {(['monthly', 'yearly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                period === p
                  ? 'bg-white text-black'
                  : 'border border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {p === 'monthly' ? 'Mesicni' : 'Rocni'}
            </button>
          ))}
        </div>

        {/* Month picker */}
        {period === 'monthly' && (
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => setMonth(shiftMonth(month, -1))}
              aria-label="Predchozi mesic"
              className="rounded-full border border-white/10 px-3 py-1 text-white/50 transition hover:text-white"
            >
              &larr;
            </button>
            <span className="text-sm font-semibold text-white/70">{monthLabel(month)}</span>
            <button
              onClick={() => setMonth(shiftMonth(month, 1))}
              aria-label="Dalsi mesic"
              className="rounded-full border border-white/10 px-3 py-1 text-white/50 transition hover:text-white"
            >
              &rarr;
            </button>
          </div>
        )}

        {/* Hero title */}
        <h1
          className="mb-16 font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          {title}
        </h1>

        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#A8FF00]" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Stats grid */}
            <div className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard value={data.totalWorkouts} label="Treninku" gradient="linear-gradient(135deg, #FF375F33 0%, #FF375F11 100%)" />
              <StatCard value={data.totalHours.toFixed(1)} label="Hodin" gradient="linear-gradient(135deg, #A8FF0033 0%, #A8FF0011 100%)" />
              <StatCard value={`${(data.totalVolume / 1000).toFixed(1)}t`} label="Objem" gradient="linear-gradient(135deg, #00E5FF33 0%, #00E5FF11 100%)" />
              <StatCard value={data.prCount} label="Osobni rekordy" gradient="linear-gradient(135deg, #FFD60033 0%, #FFD60011 100%)" />
              <StatCard value={data.longestStreak} label="Nejdelsi streak" gradient="linear-gradient(135deg, #BF5AF233 0%, #BF5AF211 100%)" />
              <StatCard value={`${data.avgFormPercent}%`} label="Prumer forma" gradient="linear-gradient(135deg, #FF9F0A33 0%, #FF9F0A11 100%)" />
            </div>

            {/* Top exercises */}
            <V2SectionLabel>Top 5 cviku</V2SectionLabel>
            {data.topExercises.length === 0 && (
              <p className="mb-16 text-sm text-white/30">Zatim zadna data o cvicich.</p>
            )}
            <div className="mb-16 space-y-3">
              {data.topExercises.slice(0, 5).map((ex, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl border border-white/8 px-5 py-4">
                  <span className="text-2xl font-bold tabular-nums text-white/20">{i + 1}</span>
                  <span className="flex-1 text-sm font-semibold text-white">{ex.name}</span>
                  <span className="text-sm tabular-nums text-white/40">{ex.count}x</span>
                </div>
              ))}
            </div>

            {/* Extra stats row */}
            <div className="mb-16 grid grid-cols-2 gap-6">
              <div>
                <V2SectionLabel>Nejaktivnejsi den</V2SectionLabel>
                <div className="text-xl font-bold text-white">{data.mostActiveDay}</div>
              </div>
              <div>
                <V2SectionLabel>Prumer regenerace</V2SectionLabel>
                <div className="text-xl font-bold text-white">{data.avgRecoveryScore}/100</div>
              </div>
            </div>

            {/* AI summary */}
            {data.aiSummary && (
              <div className="mb-12 rounded-2xl border border-[#A8FF00]/20 bg-[#A8FF00]/5 p-8">
                <V2SectionLabel>AI shruti</V2SectionLabel>
                <p className="text-base leading-relaxed text-white/70">{data.aiSummary}</p>
              </div>
            )}

            {/* Share button */}
            <button
              onClick={handleShare}
              aria-label="Sdilet wrapped"
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:scale-105"
            >
              Sdilet
            </button>
          </>
        )}

        {!loading && !data && (
          <p className="py-24 text-center text-white/40">Zadna data pro toto obdobi.</p>
        )}
      </section>
    </V2Layout>
  );
}
