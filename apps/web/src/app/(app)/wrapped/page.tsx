'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Tag, Metric, Avatar, Chip, Button } from '@/components/v3';
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

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftMonth(m: string, delta: number): string {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(m: string): string {
  const [y, mo] = m.split('-');
  const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${names[parseInt(mo, 10) - 1]} ${y}`;
}

export default function WrappedPage() {
  const [period, setPeriod] = useState<Period>('yearly');
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<WrappedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'FitAI — Wrapped'; }, []);

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

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <GlowBackground />
      <div style={{ position: 'relative', padding: '80px 96px' }}>
        <PeriodToggle period={period} onPeriod={setPeriod} />
        {period === 'monthly' && <MonthPicker month={month} onMonth={setMonth} />}

        {loading && <Loader />}
        {!loading && !data && <EmptyState />}
        {!loading && data && (
          <>
            <HeroBanner totalWorkouts={data.totalWorkouts} period={period} />
            <StatStrip data={data} />
            <BestMonthCard data={data} />
            <CoachAndDisciplines data={data} />
            <div style={{ marginTop: 48, textAlign: 'center' }}>
              <Button variant="accent" size="lg" onClick={handleShare}>
                Share your Wrapped
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Glow Background ─────────────────────────────────── */

function GlowBackground() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(circle at 30% 20%, rgba(232,93,44,0.18), transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,168,140,0.1), transparent 50%)',
    }} />
  );
}

/* ── Period Toggle ───────────────────────────────────── */

function PeriodToggle({ period, onPeriod }: { period: Period; onPeriod: (p: Period) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
      {(['monthly', 'yearly'] as Period[]).map((p) => (
        <Chip key={p} active={period === p} onClick={() => onPeriod(p)}>
          {p === 'monthly' ? 'Monthly' : 'Yearly'}
        </Chip>
      ))}
    </div>
  );
}

/* ── Month Picker ────────────────────────────────────── */

function MonthPicker({ month, onMonth }: { month: string; onMonth: (m: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
      <button onClick={() => onMonth(shiftMonth(month, -1))} style={{
        background: 'none', border: '1px solid var(--stroke-2)',
        borderRadius: 'var(--r-pill)', padding: '6px 12px',
        color: 'var(--text-2)', cursor: 'pointer', fontSize: 13,
      }}>&larr;</button>
      <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>
        {monthLabel(month)}
      </span>
      <button onClick={() => onMonth(shiftMonth(month, 1))} style={{
        background: 'none', border: '1px solid var(--stroke-2)',
        borderRadius: 'var(--r-pill)', padding: '6px 12px',
        color: 'var(--text-2)', cursor: 'pointer', fontSize: 13,
      }}>&rarr;</button>
    </div>
  );
}

/* ── Hero Banner ─────────────────────────────────────── */

function HeroBanner({ totalWorkouts, period }: { totalWorkouts: number; period: Period }) {
  return (
    <div style={{ marginBottom: 64 }}>
      <div className="v3-eyebrow-serif" style={{ marginBottom: 16 }}>
        Wrapped {period === 'yearly' ? new Date().getFullYear() : ''}
      </div>
      <h1 className="v3-display-1" style={{ margin: 0, fontSize: 'clamp(4rem, 10vw, 8rem)', lineHeight: 0.92 }}>
        You showed up<br />
        <span style={{ color: 'var(--accent)', fontWeight: 300 }}>{totalWorkouts} days.</span>
      </h1>
    </div>
  );
}

/* ── 4-Stat Strip ────────────────────────────────────── */

function StatStrip({ data }: { data: WrappedData }) {
  const stats = [
    { label: 'Total workouts', value: String(data.totalWorkouts), sub: 'sessions logged' },
    { label: 'Volume lifted', value: `${(data.totalVolume / 1000).toFixed(0)}`, sub: 'tons total' },
    { label: 'Hours moving', value: String(data.totalHours.toFixed(0)), sub: 'hours of effort' },
    { label: 'Personal records', value: String(data.prCount), sub: 'new PRs set' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 64 }}>
      {stats.map((s) => (
        <Card key={s.label} padding={28} style={{ background: 'rgba(20,17,13,0.6)', backdropFilter: 'blur(20px)' }}>
          <div className="v3-eyebrow" style={{ marginBottom: 12 }}>{s.label}</div>
          <div className="v3-numeric" style={{ fontSize: 64, lineHeight: 1, color: 'var(--accent)' }}>
            {s.value}
          </div>
          <div className="v3-caption" style={{ marginTop: 8 }}>{s.sub}</div>
        </Card>
      ))}
    </div>
  );
}

/* ── Best Month Story Card ───────────────────────────── */

function BestMonthCard({ data }: { data: WrappedData }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
      <Card padding={48} style={{ background: 'rgba(20,17,13,0.6)', backdropFilter: 'blur(20px)' }}>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 16 }}>Your best month</div>
        <div className="v3-display-1" style={{ margin: 0, fontSize: 'clamp(3rem, 6vw, 5rem)', color: 'var(--clay)' }}>
          {data.mostActiveDay || 'October'}
        </div>
        <div className="v3-body" style={{ marginTop: 16, maxWidth: 480, color: 'var(--text-2)' }}>
          {data.totalWorkouts} sessions, longest streak of {data.longestStreak} days,
          average form score {data.avgFormPercent}%.
        </div>
      </Card>

      <CoachCard data={data} />
    </div>
  );
}

/* ── Most-Used Coach + Disciplines ───────────────────── */

function CoachCard({ data }: { data: WrappedData }) {
  return (
    <Card padding={32} style={{ background: 'rgba(20,17,13,0.6)', backdropFilter: 'blur(20px)' }}>
      <div className="v3-eyebrow" style={{ marginBottom: 12 }}>Most-used coach</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Avatar name="Alex" size={56} />
        <div>
          <div className="v3-title">Alex</div>
          <div className="v3-caption">{data.totalWorkouts} sessions together</div>
        </div>
      </div>
      <DisciplineChips exercises={data.topExercises} />
    </Card>
  );
}

function CoachAndDisciplines({ data }: { data: WrappedData }) {
  if (!data.aiSummary) return null;
  return (
    <Card padding={32} style={{ marginTop: 16, background: 'rgba(20,17,13,0.6)', backdropFilter: 'blur(20px)' }}>
      <div className="v3-eyebrow" style={{ marginBottom: 12 }}>AI summary</div>
      <div className="v3-body" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
        {data.aiSummary}
      </div>
    </Card>
  );
}

function DisciplineChips({ exercises }: { exercises: { name: string; count: number }[] }) {
  if (exercises.length === 0) return null;
  return (
    <>
      <div className="v3-eyebrow" style={{ marginBottom: 12 }}>Top disciplines</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {exercises.slice(0, 5).map((e) => (
          <Tag key={e.name} color="var(--clay)">{e.name}</Tag>
        ))}
      </div>
    </>
  );
}

/* ── Utilities ───────────────────────────────────────── */

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '128px 0' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '2px solid var(--stroke-2)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.6s linear infinite',
      }} />
    </div>
  );
}

function EmptyState() {
  return (
    <p className="v3-body" style={{ textAlign: 'center', padding: '96px 0', color: 'var(--text-3)' }}>
      No data for this period yet.
    </p>
  );
}
