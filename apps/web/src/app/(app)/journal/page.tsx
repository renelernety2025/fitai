'use client';

import { useCallback, useEffect, useState } from 'react';
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

  const loadMonth = useCallback(async (month: string) => {
    setLoading(true);
    setSummary(null);
    try {
      const [journalRes, milestonesRes] = await Promise.all([
        getJournalMonth(month),
        getJournalMilestones(),
      ]);
      setDays(journalRes.days);
      setMilestones(milestonesRes.milestones);
    } catch {
      /* fetch failed */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonth(currentMonth);
  }, [currentMonth, loadMonth]);

  async function handleLoadSummary() {
    try {
      const res = await getJournalMonthlySummary(currentMonth);
      setSummary(res);
    } catch {
      /* summary failed */
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
      /* update failed */
    }
  }

  async function handleRequestInsight(date: string) {
    try {
      await generateJournalInsight(date);
      await loadMonth(currentMonth);
    } catch {
      /* insight failed */
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
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 transition hover:text-white"
        >
          &rarr;
        </button>
      </div>

      {/* Month chapter */}
      <MonthChapter
        month={currentMonth}
        summary={summary}
        onLoadSummary={handleLoadSummary}
      />

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
