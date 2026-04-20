'use client';

import { useMemo } from 'react';

interface ActivityHeatmapProps {
  /** ISO date strings of workout sessions */
  sessionDates: string[];
  /** Number of weeks to show */
  weeks?: number;
}

const DAYS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const CELL_SIZE = 14;
const GAP = 3;

/** GitHub-style activity heatmap showing workout frequency. */
export default function ActivityHeatmap({
  sessionDates,
  weeks = 12,
}: ActivityHeatmapProps) {
  const { grid, months } = useMemo(
    () => buildGrid(sessionDates, weeks),
    [sessionDates, weeks],
  );

  const totalDays = weeks * 7;
  const w = weeks * (CELL_SIZE + GAP);
  const h = 7 * (CELL_SIZE + GAP);

  return (
    <div>
      <div className="mb-3 flex gap-4 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg width={w} height={h + 20} className="block">
          {grid.map((cell, i) => (
            <rect
              key={i}
              x={Math.floor(i / 7) * (CELL_SIZE + GAP)}
              y={(i % 7) * (CELL_SIZE + GAP)}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={3}
              fill={colorForCount(cell.count)}
            >
              <title>
                {cell.date}: {cell.count} {cell.count === 1 ? 'trenink' : 'treninku'}
              </title>
            </rect>
          ))}
          {/* Day labels */}
          {[1, 3, 5].map((d) => (
            <text
              key={d}
              x={-2}
              y={d * (CELL_SIZE + GAP) + CELL_SIZE - 3}
              textAnchor="end"
              className="fill-white/20 text-[8px]"
            >
              {DAYS[d]}
            </text>
          ))}
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[9px] text-white/30">
        <span>Min</span>
        {[0, 1, 2, 3].map((n) => (
          <span
            key={n}
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: colorForCount(n) }}
          />
        ))}
        <span>Max</span>
      </div>
    </div>
  );
}

function buildGrid(dates: string[], weeks: number) {
  const countMap = new Map<string, number>();
  for (const d of dates) {
    const key = d.slice(0, 10);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  const today = new Date();
  const startDay = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1) - startDay);

  const grid: { date: string; count: number }[] = [];
  const monthsSet = new Set<string>();
  const cursor = new Date(start);

  for (let i = 0; i < weeks * 7; i++) {
    const key = cursor.toISOString().slice(0, 10);
    grid.push({ date: key, count: countMap.get(key) ?? 0 });
    if (cursor.getDate() <= 7) {
      monthsSet.add(cursor.toLocaleDateString('cs-CZ', { month: 'short' }));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return { grid, months: [...monthsSet] };
}

function colorForCount(count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.05)';
  if (count === 1) return 'rgba(168,255,0,0.3)';
  if (count === 2) return 'rgba(168,255,0,0.55)';
  return 'rgba(168,255,0,0.85)';
}
