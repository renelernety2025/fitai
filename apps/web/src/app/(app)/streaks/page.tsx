'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getHabitsStats, getHabitsHistory, type DailyCheckIn, type HabitsStats } from '@/lib/api';
import { getStreakFreezeStatus, useStreakFreeze } from '@/lib/api';

const MILESTONES = [
  { day: 7, label: 'First week' },
  { day: 30, label: 'A month strong' },
  { day: 100, label: 'Triple digits' },
  { day: 365, label: 'A whole year' },
];

export default function StreaksPage() {
  const [stats, setStats] = useState<HabitsStats | null>(null);
  const [history, setHistory] = useState<DailyCheckIn[]>([]);
  const [freezes, setFreezes] = useState<{ available: number; max: number } | null>(null);

  useEffect(() => { document.title = 'FitAI — Streaks'; }, []);
  useEffect(() => {
    getHabitsStats().then(setStats).catch(console.error);
    getHabitsHistory(365).then(setHistory).catch(console.error);
    getStreakFreezeStatus().then(setFreezes).catch(() => {});
  }, []);

  const streak = stats?.streakDays ?? 0;
  const grid = useHeatmapGrid(history);

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <StreakHero streak={streak} />
      <StatCards streak={streak} stats={stats} />
      <HeatmapSection grid={grid} />
      <MilestonesSection streak={streak} />
      <FreezesSection freezes={freezes} />
    </div>
  );
}

function useHeatmapGrid(history: DailyCheckIn[]): number[] {
  return useMemo(() => {
    const dateSet = new Set(history.map(h => String(h.date).slice(0, 10)));
    return Array.from({ length: 364 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (363 - i));
      const key = d.toISOString().slice(0, 10);
      if (!dateSet.has(key)) return 0;
      const entry = history.find(h => String(h.date).slice(0, 10) === key);
      const e = entry?.energy ?? 3;
      return Math.min(4, Math.max(1, e));
    });
  }, [history]);
}

function StreakHero({ streak }: { streak: number }) {
  return (
    <div style={{ marginBottom: 56 }}>
      <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Streaks</div>
      <h1 className="v3-display-2" style={{ margin: 0, maxWidth: 980 }}>
        Show up.<br /><em style={{ color: 'var(--clay)', fontWeight: 300 }}>Every day.</em>
      </h1>
      <div className="v3-numeric" style={{ fontSize: 96, color: 'var(--accent)', marginTop: 24, lineHeight: 1 }}>
        {streak}
      </div>
      <div className="v3-caption" style={{ marginTop: 8 }}>consecutive days</div>
    </div>
  );
}

function StatCards({ streak, stats }: { streak: number; stats: HabitsStats | null }) {
  const items = [
    ['Current', String(streak), 'days'],
    ['Longest ever', String(streak), 'days'],
    ['Total check-ins', String(stats?.totalCheckIns ?? 0), 'this year'],
    ['Avg sleep 7d', stats?.avgSleep ? `${stats.avgSleep}` : '--', 'hours'],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 56 }}>
      {items.map(([label, value, sub]) => (
        <Card key={label} padding={24}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>{label}</div>
          <div className="v3-numeric" style={{ fontSize: 56, lineHeight: 1 }}>{value}</div>
          <div className="v3-caption" style={{ marginTop: 8 }}>{sub}</div>
        </Card>
      ))}
    </div>
  );
}

function HeatmapSection({ grid }: { grid: number[] }) {
  const colors = ['var(--bg-3)', 'var(--d-1, #2a2a2a)', 'var(--d-2, #4a4a2a)', 'var(--d-3, #6a6a2a)', 'var(--d-4, #8a8a2a)'];
  return (
    <>
      <SectionHeader eyebrow="Your year" title="Every day, in one glance" />
      <Card padding={32} style={{ marginBottom: 56 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gap: 3 }}>
          {grid.map((v, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 2, background: colors[v] }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24, fontSize: 11, color: 'var(--text-3)' }}>
          <span className="v3-caption">Less</span>
          {[0, 1, 2, 3, 4].map(v => (
            <div key={v} style={{ width: 14, height: 14, borderRadius: 2, background: colors[v] }} />
          ))}
          <span className="v3-caption">More</span>
        </div>
      </Card>
    </>
  );
}

function MilestonesSection({ streak }: { streak: number }) {
  return (
    <>
      <SectionHeader eyebrow="Milestones" title="The road already walked" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 56 }}>
        {MILESTONES.map(m => {
          const earned = streak >= m.day;
          return (
            <Card key={m.day} padding={28} style={{
              opacity: earned ? 1 : 0.55,
              background: earned ? 'linear-gradient(180deg, var(--bg-card), rgba(232,93,44,0.04))' : 'var(--bg-card)',
            }}>
              <div className="v3-numeric" style={{ fontSize: 56, color: earned ? 'var(--accent)' : 'var(--text-3)', lineHeight: 1 }}>{m.day}</div>
              <div className="v3-title" style={{ marginTop: 12 }}>{m.label}</div>
              <div className="v3-caption" style={{ marginTop: 6 }}>
                {earned ? 'earned' : `${m.day - streak} days away`}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function FreezesSection({ freezes }: { freezes: { available: number; max: number } | null }) {
  const avail = freezes?.available ?? 0;
  const max = freezes?.max ?? 4;
  return (
    <Card padding={32}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <div className="v3-eyebrow-serif" style={{ marginBottom: 8 }}>Safety net</div>
          <div className="display-3" style={{ marginBottom: 8 }}>Streak freezes</div>
          <div className="v3-body" style={{ maxWidth: 560 }}>
            Life happens. Use a freeze to skip a day without losing your streak.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: max }, (_, i) => (
            <div key={i} style={{
              width: 56, height: 64, borderRadius: 12,
              background: i < avail ? 'rgba(168,184,154,0.15)' : 'var(--bg-3)',
              border: i < avail ? '1px solid var(--sage, #A8B89A)' : '1px dashed var(--stroke-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: i < avail ? 1 : 0.4,
            }}>
              <FitIcon name="shield" size={20} color={i < avail ? 'var(--sage, #A8B89A)' : 'var(--text-3)'} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
