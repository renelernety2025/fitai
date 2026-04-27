'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Chip, Button } from '@/components/v3';
import { Timeline } from '@/components/calendar/v3/Timeline';
import { Heatmap } from '@/components/calendar/v3/Heatmap';
import { getCalendarMonth } from '@/lib/api';

interface ScheduledWorkout { id: string; date: string; title: string; completed: boolean }
interface CalendarDay { date: string; workouts: ScheduledWorkout[] }

type ViewMode = 'day' | 'week' | 'month' | 'block';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const SESSION_COLORS: Record<string, string> = {
  push: '#FF4B12', pull: '#FF4B12', lower: '#FF4B12', upper: '#FF4B12',
  run: '#6BE3D2', mobility: '#6BE3D2', yoga: '#6BE3D2', recovery: '#6BE3D2', breathwork: '#6BE3D2',
  tempo: '#FFB547', test: '#fff',
};

function sessionColor(title: string): string {
  const key = title.toLowerCase().split(/[\s·]/)[0];
  return SESSION_COLORS[key] ?? '#FF4B12';
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

function buildCells(month: string) {
  const [y, mo] = month.split('-').map(Number);
  const first = new Date(y, mo - 1, 1);
  const last = new Date(y, mo, 0);
  const offset = (first.getDay() + 6) % 7;
  const total = last.getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  return Array.from({ length: Math.ceil((offset + total) / 7) * 7 }).map((_, i) => {
    const date = i - offset + 1;
    const valid = date > 0 && date <= total;
    const dateStr = valid ? `${month}-${String(date).padStart(2, '0')}` : '';
    return { date: valid ? date : null, dateStr, offMonth: !valid, isToday: dateStr === todayStr, isPast: dateStr < todayStr && valid };
  });
}

export default function CalendarPage() {
  const [month, setMonth] = useState(currentMonth);
  const [view, setView] = useState<ViewMode>('month');
  const [days, setDays] = useState<CalendarDay[]>([]);

  useEffect(() => { document.title = 'FitAI — Calendar'; }, []);

  const load = useCallback(() => {
    getCalendarMonth(month)
      .then((d) => setDays(d.days || d || []))
      .catch(() => setDays([]));
  }, [month]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setMonth((m) => shiftMonth(m, -1));
      if (e.key === 'ArrowRight') setMonth((m) => shiftMonth(m, 1));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const [y, mo] = month.split('-').map(Number);
  const monthName = MONTH_NAMES[mo - 1].toUpperCase();
  const cells = useMemo(() => buildCells(month), [month]);
  const dayMap = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const rows = Math.ceil(cells.length / 7);

  return (
    <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100vh', padding: '32px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>{monthName} {y} &middot; MICROCYCLE 6 / 12</div>
          <div className="v3-display-2">Hypertrophy <em className="v3-clay" style={{ fontWeight: 300 }}>Block.</em></div>
          <p className="v3-body" style={{ marginTop: 8, color: 'var(--text-2)', maxWidth: 540, fontSize: 14 }}>
            Adaptive 12-week plan &middot; Coach Maya. Currently in week 6 — peak volume phase.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(['day', 'week', 'month', 'block'] as ViewMode[]).map((v) => (
            <Chip key={v} active={view === v} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</Chip>
          ))}
          <div style={{ width: 1, height: 24, background: 'var(--stroke-2)', margin: '0 4px' }} />
          <Button size="sm" variant="ghost" onClick={() => setMonth(shiftMonth(month, -1))}>&larr;</Button>
          <Button size="sm" variant="ghost" onClick={() => setMonth(shiftMonth(month, 1))}>&rarr;</Button>
          <Button size="sm" variant="accent">Add session</Button>
        </div>
      </div>

      {/* Periodization timeline */}
      <div style={{ marginBottom: 28 }}><Timeline /></div>

      {/* Month grid */}
      <Card padding={0} style={{ overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--stroke-1)' }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{
              padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
              letterSpacing: '0.08em', color: 'var(--text-3)',
              borderRight: i < 6 ? '1px solid var(--stroke-1)' : 'none',
            }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${rows}, 132px)` }}>
          {cells.map((c, i) => {
            const sess = c.dateStr ? (dayMap.get(c.dateStr)?.workouts ?? []) : [];
            return (
              <div key={i} style={{
                borderRight: (i % 7 < 6) ? '1px solid var(--stroke-1)' : 'none',
                borderBottom: i < (rows - 1) * 7 ? '1px solid var(--stroke-1)' : 'none',
                padding: 10, position: 'relative', opacity: c.offMonth ? 0.3 : 1,
                background: c.isToday ? 'rgba(255,75,18,0.04)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="v3-numeric" style={{
                    fontSize: 13, fontWeight: c.isToday ? 700 : 500,
                    color: c.isToday ? 'var(--accent)' : c.isPast ? 'var(--text-3)' : 'var(--text-1)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 22, height: 22, borderRadius: '50%',
                    background: c.isToday ? 'rgba(255,75,18,0.15)' : 'transparent',
                  }}>{c.date ?? ''}</span>
                  {sess.length > 1 && <span className="v3-caption">{sess.length}</span>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {sess.map((s) => {
                    const col = sessionColor(s.title);
                    return (
                      <div key={s.id} style={{
                        padding: '4px 8px', borderRadius: 4, borderLeft: `2px solid ${col}`,
                        background: `${col}1a`, fontSize: 11, fontWeight: 500,
                        color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 52-week heatmap */}
      <Heatmap />
    </div>
  );
}
