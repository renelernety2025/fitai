'use client';

import { useState } from 'react';
import type { MonthlySummary } from '@/lib/api';

interface MonthChapterProps {
  month: string;
  summary: MonthlySummary | null;
  onLoadSummary: () => void;
}

const MONTH_NAMES_CS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];

function formatMonthTitle(month: string): string {
  const [year, m] = month.split('-');
  const idx = parseInt(m, 10) - 1;
  return `${MONTH_NAMES_CS[idx] || m} ${year}`;
}

function DiffArrow({ value, unit }: { value: number; unit: string }) {
  if (value === 0) return null;
  const positive = value > 0;
  return (
    <span className={`text-xs font-medium ${positive ? 'text-[#30D158]' : 'text-[#FF375F]'}`}>
      {positive ? '\u2191' : '\u2193'} {Math.abs(value)} {unit}
    </span>
  );
}

export function MonthChapter({ month, summary, onLoadSummary }: MonthChapterProps) {
  const [loading, setLoading] = useState(false);

  function handleLoad() {
    setLoading(true);
    onLoadSummary();
  }

  return (
    <div className="relative mb-10 rounded-2xl p-6">
      <div className="absolute inset-0 rounded-2xl opacity-30" style={{
        background: 'radial-gradient(circle at 30% 40%, rgba(168,255,0,0.1), transparent 60%), radial-gradient(circle at 70% 60%, rgba(0,229,255,0.08), transparent 50%)',
      }} />
      <h2
        className="relative mb-6 text-white/90"
        style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontStyle: 'italic' }}
      >
        {formatMonthTitle(month)}
      </h2>

      {summary ? (
        <>
          {/* AI summary */}
          <div
            className="mb-5 rounded-r-lg py-3 pl-4 pr-3 text-sm leading-relaxed text-white/70"
            style={{
              borderLeft: '3px solid #A8FF00',
              backgroundColor: 'rgba(168, 255, 0, 0.04)',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            {summary.summary}
          </div>

          {/* Stat chips */}
          <div className="mb-3 flex flex-wrap gap-3">
            <StatChip label="Tréninky" value={String(summary.stats.workouts)} />
            <StatChip label="Objem" value={`${Math.round(summary.stats.totalVolume / 1000)}t`} />
            <StatChip label="PR" value={String(summary.stats.prCount)} accent />
            <StatChip label="Forma" value={`${Math.round(summary.stats.avgForm)}%`} />
          </div>

          {/* Month-over-month comparison */}
          {summary.comparison && (
            <div className="flex gap-4 text-white/50">
              <DiffArrow value={summary.comparison.workoutsDiff} unit="tréninky" />
              <DiffArrow value={summary.comparison.volumeDiff} unit="kg" />
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={handleLoad}
          disabled={loading}
          className="rounded-lg border border-[#A8FF00]/20 bg-[#A8FF00]/5 px-4 py-2 text-sm text-[#A8FF00] transition hover:bg-[#A8FF00]/10 disabled:opacity-50"
        >
          {loading ? 'Generuji...' : 'Nacíst AI shrnutí'}
        </button>
      )}
    </div>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-1.5"
      style={{
        borderColor: accent ? 'rgba(255, 214, 0, 0.3)' : 'rgba(255, 255, 255, 0.08)',
        backgroundColor: accent ? 'rgba(255, 214, 0, 0.06)' : 'rgba(255, 255, 255, 0.03)',
      }}
    >
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: accent ? '#FFD600' : '#fff' }}
      >
        {value}
      </span>
      <span className="ml-1.5 text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </span>
    </div>
  );
}
