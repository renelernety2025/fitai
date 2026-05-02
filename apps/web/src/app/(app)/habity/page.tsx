'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getHabitsToday,
  updateHabitsToday,
  getHabitsStats,
  type DailyCheckIn,
  type HabitsStats,
} from '@/lib/api';

const FIELDS: { key: keyof DailyCheckIn; label: string; icon: string; unit?: string }[] = [
  { key: 'sleepHours', label: 'Sleep 7+ hours', icon: 'lungs', unit: 'h' },
  { key: 'energy', label: 'Energy level', icon: 'bolt' },
  { key: 'hydrationL', label: 'Drink 2L water', icon: 'drop', unit: 'L' },
  { key: 'steps', label: 'Steps 8000+', icon: 'shoe' },
  { key: 'mood', label: 'Mood check', icon: 'heart' },
  { key: 'soreness', label: 'Low soreness', icon: 'muscle' },
  { key: 'stress', label: 'Low stress', icon: 'brain' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HabityPage() {
  const [today, setToday] = useState<DailyCheckIn | null>(null);
  const [stats, setStats] = useState<HabitsStats | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'FitAI — Habits'; }, []);
  useEffect(() => {
    getHabitsToday().then(setToday).catch(console.error);
    getHabitsStats().then(setStats).catch(console.error);
  }, []);

  const TOGGLE_VALUES: Record<string, { on: number; off: number; threshold: number }> = {
    sleepHours: { on: 8, off: 0, threshold: 7 },
    energy: { on: 4, off: 1, threshold: 3 },
    hydrationL: { on: 2.5, off: 0, threshold: 2 },
    steps: { on: 8000, off: 0, threshold: 5000 },
    mood: { on: 4, off: 1, threshold: 3 },
    soreness: { on: 1, off: 1, threshold: 3 },
    stress: { on: 1, off: 1, threshold: 3 },
  };

  async function toggle(key: keyof DailyCheckIn) {
    if (!today) return;
    const current = (today as unknown as Record<string, unknown>)[key as string];
    const cfg = TOGGLE_VALUES[key as string] || { on: 5, off: 1, threshold: 3 };
    const isDone = typeof current === 'number' && current >= cfg.threshold;
    const next = isDone ? cfg.off : cfg.on;
    setSaving(true);
    try {
      const updated = await updateHabitsToday({ [key]: next } as Partial<DailyCheckIn>);
      setToday(updated);
      setStats(await getHabitsStats());
    } catch { /* silent — backend may reject partial updates */ }
    setSaving(false);
  }

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const done = today ? FIELDS.filter(f => {
    const v = (today as unknown as Record<string, unknown>)[f.key as string];
    const cfg = TOGGLE_VALUES[f.key as string];
    return typeof v === 'number' && v >= (cfg?.threshold ?? 3);
  }).length : 0;

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <HabitHeader date={todayDate} />
      <SummaryStrip done={done} total={FIELDS.length} stats={stats} />
      <HabitsList today={today} onToggle={toggle} />
      <EveningCTA />
    </div>
  );
}

function HabitHeader({ date }: { date: string }) {
  return (
    <div style={{ marginBottom: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Habits · {date}</div>
        <h1 className="v3-display-2" style={{ margin: 0, maxWidth: 720 }}>
          The small things,<br />
          <em style={{ color: 'var(--clay)', fontWeight: 300 }}>done daily.</em>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" icon={<FitIcon name="check" size={14} />} onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
          Check in
        </Button>
      </div>
    </div>
  );
}

function SummaryStrip({ done, total, stats }: { done: number; total: number; stats: HabitsStats | null }) {
  const items = [
    { eyebrow: 'Today', value: `${done}`, sub: `/ ${total}`, caption: `${total - done} remaining` },
    { eyebrow: 'Streak', value: `${stats?.streakDays ?? 0}`, sub: 'days', caption: 'consecutive check-ins' },
    { eyebrow: 'Recovery', value: `${stats?.recoveryScore ?? '--'}`, sub: '', caption: 'score out of 100' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 16, marginBottom: 48 }}>
      {items.map(i => (
        <Card key={i.eyebrow} padding={24}>
          <div className="v3-eyebrow" style={{ marginBottom: 12 }}>{i.eyebrow}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="v3-numeric" style={{ fontSize: 56 }}>{i.value}</span>
            {i.sub && <span style={{ fontSize: 18, color: 'var(--text-3)' }}>{i.sub}</span>}
          </div>
          <div className="v3-caption" style={{ marginTop: 8 }}>{i.caption}</div>
        </Card>
      ))}
    </div>
  );
}

function HabitsList({ today, onToggle }: { today: DailyCheckIn | null; onToggle: (key: keyof DailyCheckIn) => void }) {
  if (!today) return <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {FIELDS.map(f => {
        const val = (today as unknown as Record<string, unknown>)[f.key as string];
        const isDone = typeof val === 'number' && val >= 3;
        return (
          <HabitRow key={f.key} field={f} done={isDone} value={val} onToggle={() => onToggle(f.key)} />
        );
      })}
    </div>
  );
}

function HabitRow({ field, done, value, onToggle }: {
  field: typeof FIELDS[number]; done: boolean; value: unknown; onToggle: () => void;
}) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--stroke-1)',
      borderRadius: 'var(--r-md, 12px)', padding: '20px 24px',
      display: 'grid', gridTemplateColumns: '40px 1fr 80px 40px', gap: 24, alignItems: 'center',
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FitIcon name={field.icon} size={20} />
      </div>
      <div>
        <div className="v3-title" style={{ marginBottom: 2 }}>{field.label}</div>
        <div className="v3-caption" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FitIcon name="flame" size={12} color="var(--accent)" />
          {typeof value === 'number' ? `${value}${field.unit ?? ''}` : 'not set'}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <Tag color={done ? 'var(--sage, #A8B89A)' : undefined}>{done ? 'done' : 'pending'}</Tag>
      </div>
      <button onClick={onToggle} style={{
        width: 32, height: 32, borderRadius: '50%',
        background: done ? 'var(--sage, #A8B89A)' : 'transparent',
        border: done ? 'none' : '1.5px solid var(--stroke-2)',
        color: done ? '#000' : 'var(--text-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        {done && <FitIcon name="check" size={16} color="var(--bg-0)" />}
      </button>
    </div>
  );
}

function EveningCTA() {
  return (
    <Card padding={32} style={{ marginTop: 48, background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(232,93,44,0.08) 100%)', border: '1px solid var(--stroke-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="v3-eyebrow-serif" style={{ marginBottom: 8 }}>Evening ritual</div>
          <div className="v3-display-3" style={{ marginBottom: 4 }}>How did today feel?</div>
          <div className="v3-body">2-minute check-in: mood, energy, sleep readiness</div>
        </div>
        <Button variant="accent" iconRight={<FitIcon name="arrow" size={14} />} size="lg">Begin ritual</Button>
      </div>
    </Card>
  );
}
