'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel } from '@/components/v2/V2Layout';
import { MonthChapter } from '@/components/journal/MonthChapter';
import { DayCard } from '@/components/journal/DayCard';
import { MilestoneBadge } from '@/components/journal/MilestoneBadge';
import {
  getJournalMonth,
  getJournalMilestones,
  getJournalMonthlySummary,
  upsertJournalEntry,
  generateJournalInsight,
  deleteJournalPhoto,
  downloadExport,
  type JournalDay,
  type MonthlySummary,
  type Milestone,
} from '@/lib/api';

function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const MONTH_NAMES_CS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];

function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  return `${MONTH_NAMES_CS[parseInt(m, 10) - 1]} ${year}`;
}

export default function JournalPage() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth);
  const [days, setDays] = useState<JournalDay[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Deník'; }, []);

  const loadMonth = useCallback(async (month: string) => {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const [journalRes, milestonesRes] = await Promise.all([
        getJournalMonth(month),
        getJournalMilestones(),
      ]);
      setDays(journalRes.days);
      setMilestones(milestonesRes.milestones);
    } catch {
      setError('Nepodarilo se nacist zaznamy');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonth(currentMonth);
  }, [currentMonth, loadMonth]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goToPreviousMonth();
      if (e.key === 'ArrowRight') goToNextMonth();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  async function handleLoadSummary() {
    try {
      const res = await getJournalMonthlySummary(currentMonth);
      setSummary(res);
    } catch {
      setError('Nepodarilo se nacist mesicni shrnuti');
    }
  }

  async function handleUpdate(date: string, data: Record<string, unknown>) {
    // Handle special photo delete action
    if (data.deletePhoto) {
      await deleteJournalPhoto(data.deletePhoto as string);
      await loadMonth(currentMonth);
      return;
    }
    // Empty update = refresh (e.g., after photo upload)
    if (Object.keys(data).length === 0) {
      await loadMonth(currentMonth);
      return;
    }
    // Optimistic update
    try {
      await upsertJournalEntry(date, data);
      await loadMonth(currentMonth);
    } catch {
      setError('Nepodarilo se ulozit zaznam');
    }
  }

  async function handleRequestInsight(date: string) {
    try {
      await generateJournalInsight(date);
      await loadMonth(currentMonth);
    } catch {
      setError('Nepodarilo se vygenerovat AI insight');
    }
  }

  function goToPreviousMonth() {
    setCurrentMonth((m) => shiftMonth(m, -1));
  }

  function goToNextMonth() {
    setCurrentMonth((m) => shiftMonth(m, 1));
  }

  // Stats from current month data
  const entriesCount = days.filter((d) => d.entry).length;
  const workoutsCount = days.filter((d) => d.gymSession).length;
  const prCount = days.filter(
    (d) => d.gymSession && d.gymSession.averageFormScore > 80,
  ).length;

  // Sort days reverse chronological
  const sortedDays = [...days].sort(
    (a, b) => b.date.localeCompare(a.date),
  );

  // Build milestone date set for rendering between days
  const milestoneDateSet = new Map<string, string>();
  for (const ms of milestones) {
    if (ms.achievedAt) {
      const dateKey = ms.achievedAt.slice(0, 10);
      milestoneDateSet.set(dateKey, ms.label);
    }
  }

  return (
    <V2Layout>
      {/* Hero */}
      <div className="mb-10 pt-4">
        <h1
          className="mb-2 text-4xl font-bold tracking-tight text-white"
          style={{ letterSpacing: '-0.04em' }}
        >
          Můj deník
        </h1>
        <div className="flex gap-6 text-sm text-white/40">
          <span>{entriesCount} záznamů</span>
          <span>{workoutsCount} tréninků</span>
          <span style={{ color: '#FFD600' }}>{prCount} PR</span>
        </div>
      </div>

      {/* Month navigation */}
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          aria-label="Predchozi mesic"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 transition hover:text-white"
        >
          &larr;
        </button>
        <span className="text-sm font-medium text-white/70">
          {formatMonthLabel(currentMonth)}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Dalsi mesic"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 transition hover:text-white"
        >
          &rarr;
        </button>
        <button onClick={() => loadMonth(currentMonth)} className="text-white/20 hover:text-white/50 transition" aria-label="Obnovit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => downloadExport(`export/journal?month=${currentMonth}`, `fitai-journal-${currentMonth}.csv`).catch(console.error)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 transition hover:border-white/25 hover:text-white"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          CSV
        </button>
      </div>

      {/* Cross-links */}
      <div className="mb-6 flex gap-3">
        <Link href="/wrapped" className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/40 transition hover:text-white hover:border-white/25">
          Wrapped shrnutí
        </Link>
        <Link href="/gym" className="rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/40 transition hover:text-white hover:border-white/25">
          Začít trénink
        </Link>
      </div>

      {/* Month chapter */}
      <MonthChapter
        month={currentMonth}
        summary={summary}
        onLoadSummary={handleLoadSummary}
      />

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
          {error}
        </div>
      )}

      {/* Days */}
      {loading ? (
        <div className="py-20 text-center text-white/30">Načítám...</div>
      ) : sortedDays.length === 0 ? (
        <div className="py-20 text-center text-white/20">
          Žádné záznamy pro tento měsíc
        </div>
      ) : (
        <div>
          <V2SectionLabel>Záznamy</V2SectionLabel>
          {sortedDays.map((day) => {
            const milestoneLabel = milestoneDateSet.get(day.date);
            return (
              <div key={day.date}>
                {milestoneLabel && <MilestoneBadge label={milestoneLabel} />}
                <DayCard
                  day={day}
                  onUpdate={handleUpdate}
                  onRequestInsight={handleRequestInsight}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Load older */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="text-sm text-white/30 transition hover:text-white/60"
        >
          Načíst starší &darr;
        </button>
      </div>
    </V2Layout>
  );
}
