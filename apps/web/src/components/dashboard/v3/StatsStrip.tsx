'use client';

import { Card, Metric, Sparkline } from '@/components/v3';
import type { StatsData } from '@/lib/api/workouts';

interface StatsStripProps {
  stats: StatsData;
}

function buildSparkFromWeekly(
  weekly: { date: string; minutes: number }[],
): number[] {
  if (!weekly || weekly.length === 0) return [];
  return weekly.slice(-7).map((d) => d.minutes);
}

export default function StatsStrip({ stats }: StatsStripProps) {
  const hours = Math.floor((stats.totalMinutes || 0) / 60);
  const weeklySpark = buildSparkFromWeekly(stats.weeklyActivity);

  const items = [
    {
      label: 'SESSIONS',
      value: String(stats.totalSessions),
      delta: stats.totalSessions > 0 ? undefined : undefined,
      sparkData: weeklySpark,
    },
    {
      label: 'HOURS',
      value: String(hours),
      unit: 'h',
      sparkData: weeklySpark,
    },
    {
      label: 'STREAK',
      value: String(stats.currentStreak || 0),
      unit: 'd',
      deltaPositive: (stats.currentStreak || 0) > 0,
    },
    {
      label: 'XP',
      value: (stats.totalXP || 0).toLocaleString(),
      sub: stats.levelName,
    },
  ];

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        {items.map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: 24,
              borderRight:
                i < items.length - 1
                  ? '1px solid var(--stroke-1)'
                  : 'none',
            }}
          >
            <Metric
              label={item.label}
              value={item.value}
              unit={item.unit}
              delta={item.delta}
              deltaPositive={item.deltaPositive}
              sub={item.sub}
            />
            {item.sparkData && item.sparkData.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <Sparkline
                  data={item.sparkData}
                  width={120}
                  height={28}
                  color="var(--accent)"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
