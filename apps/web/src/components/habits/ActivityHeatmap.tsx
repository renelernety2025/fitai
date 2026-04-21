'use client';

import { useMemo, useState } from 'react';
import type { DailyCheckIn } from '@/lib/api';

const DAY_LABELS = ['Po', '', 'St', '', 'Pa', '', 'Ne'];
const MONTH_LABELS = [
  'Led', 'Uno', 'Bre', 'Dub', 'Kve', 'Cer',
  'Cec', 'Srp', 'Zar', 'Rij', 'Lis', 'Pro',
];
const WEEKS = 12;
const CELL = 14;
const GAP = 3;

function calcRecoveryScore(c: DailyCheckIn): number | null {
  const parts: number[] = [];
  if (c.sleepHours != null) {
    const diff = Math.abs(c.sleepHours - 8);
    parts.push(Math.max(0, 100 - diff * 20));
  }
  if (c.energy != null) parts.push((c.energy / 5) * 100);
  if (c.soreness != null) parts.push(((5 - c.soreness) / 4) * 100);
  if (c.stress != null) parts.push(((5 - c.stress) / 4) * 100);
  if (parts.length === 0) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

function scoreColor(score: number | null): string {
  if (score == null) return '#1a1a1a';
  if (score <= 40) return 'rgba(255,55,95,0.6)';
  if (score <= 60) return 'rgba(255,149,0,0.6)';
  if (score <= 80) return 'rgba(168,255,0,0.6)';
  return '#A8FF00';
}

function calcLongestStreak(history: DailyCheckIn[]): number {
  if (history.length === 0) return 0;
  const dates = history
    .filter((h) => h.date)
    .map((h) => new Date(h.date as string).toISOString().slice(0, 10))
    .sort();

  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }
  return longest;
}

export function ActivityHeatmap({
  history,
  streakDays,
  totalCheckIns,
}: {
  history: DailyCheckIn[];
  streakDays: number;
  totalCheckIns: number;
}) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    score: number | null;
  } | null>(null);

  const { grid, monthLabels, longestStreak } = useMemo(() => {
    // Build lookup: dateStr -> DailyCheckIn
    const lookup = new Map<string, DailyCheckIn>();
    for (const h of history) {
      if (h.date) {
        const key = new Date(h.date).toISOString().slice(0, 10);
        lookup.set(key, h);
      }
    }

    // Build grid: 12 weeks back from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the Monday of the current week
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + mondayOffset);

    // Start date: 11 weeks before current Monday
    const startDate = new Date(currentMonday);
    startDate.setDate(startDate.getDate() - (WEEKS - 1) * 7);

    const cells: {
      date: Date;
      dateStr: string;
      score: number | null;
      isToday: boolean;
      col: number;
      row: number;
    }[] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let col = 0; col < WEEKS; col++) {
      for (let row = 0; row < 7; row++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + col * 7 + row);
        const dateStr = d.toISOString().slice(0, 10);
        const todayStr = today.toISOString().slice(0, 10);
        const checkin = lookup.get(dateStr);
        const score = checkin ? calcRecoveryScore(checkin) : null;

        if (row === 0 && d.getMonth() !== lastMonth) {
          months.push({ label: MONTH_LABELS[d.getMonth()], col });
          lastMonth = d.getMonth();
        }

        cells.push({
          date: d,
          dateStr,
          score,
          isToday: dateStr === todayStr,
          col,
          row,
        });
      }
    }

    return {
      grid: cells,
      monthLabels: months,
      longestStreak: calcLongestStreak(history),
    };
  }, [history]);

  const gridWidth = WEEKS * (CELL + GAP) - GAP;
  const gridHeight = 7 * (CELL + GAP) - GAP;
  const labelWidth = 24;

  return (
    <div>
      {/* Month labels */}
      <div className="flex" style={{ paddingLeft: labelWidth }}>
        <div className="relative" style={{ width: gridWidth, height: 18 }}>
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute text-[10px] font-medium text-white/40"
              style={{ left: m.col * (CELL + GAP) }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid with day labels */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div
          className="flex flex-col justify-between"
          style={{ width: labelWidth, height: gridHeight }}
        >
          {DAY_LABELS.map((label, i) => (
            <span
              key={i}
              className="text-[10px] leading-[14px] font-medium text-white/40"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Heatmap cells */}
        <div
          className="relative"
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(7, ${CELL}px)`,
            gridAutoFlow: 'column',
            gridAutoColumns: `${CELL}px`,
            gap: GAP,
          }}
        >
          {grid.map((cell) => (
            <div
              key={cell.dateStr}
              className="rounded-sm"
              style={{
                width: CELL,
                height: CELL,
                backgroundColor: scoreColor(cell.score),
                boxShadow: cell.isToday ? 'inset 0 0 0 2px white' : undefined,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top - 8,
                  date: cell.date.toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  }),
                  score: cell.score,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-xs text-white shadow-lg backdrop-blur"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-medium">{tooltip.date}</div>
          <div className="text-white/60">
            {tooltip.score != null ? `Score: ${tooltip.score}/100` : 'Zadna data'}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-4 text-xs text-white/40" style={{ paddingLeft: labelWidth }}>
        {totalCheckIns} check-inu &middot; Nejdelsi streak: {longestStreak} dni &middot;
        Aktualni: {streakDays} dni
      </div>
    </div>
  );
}
