'use client';

import { useEffect, useState } from 'react';
import { Card, Tag, SectionHeader, Button } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getDiscoverWeekly } from '@/lib/api';

function daysUntilMonday(): number {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 1 : day === 1 ? 7 : 8 - day;
}

export default function DiscoverWeeklyPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState(false);

  useEffect(() => { document.title = 'FitAI — Discover Weekly'; }, []);
  useEffect(() => { getDiscoverWeekly().then(setData).catch(() => setErr(true)); }, []);

  const exercises = data?.exercises || [];
  const topPicks = exercises.slice(0, 2);
  const morePicks = exercises.slice(2, 8);
  const refreshDays = daysUntilMonday();

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <HeroHeader refreshDays={refreshDays} />

      {err && (
        <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 32 }}>
          Could not load recommendations. Try again later.
        </p>
      )}

      {!data && !err && <Loader />}

      {data && (
        <>
          <TopPicks items={topPicks} description={data.description} />
          <MoreThisWeek items={morePicks} />
          <RefreshIndicator days={refreshDays} />
        </>
      )}
    </div>
  );
}

/* ── Hero Header ─────────────────────────────────────── */

function HeroHeader({ refreshDays }: { refreshDays: number }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>
        Discover — Updated every Monday
      </div>
      <h1 className="v3-display-2" style={{ margin: 0, maxWidth: 800 }}>
        Picked for{' '}
        <em style={{ color: 'var(--clay)', fontWeight: 300 }}>you.</em>
      </h1>
      <p className="v3-body" style={{ maxWidth: 580, marginTop: 16, color: 'var(--text-2)' }}>
        Sessions tuned to your goals, recovery, and what you have already done this week.
      </p>
    </div>
  );
}

/* ── Top Picks ───────────────────────────────────────── */

function TopPicks({ items, description }: { items: any[]; description?: string }) {
  if (items.length === 0) return null;

  return (
    <>
      <SectionHeader eyebrow="Top picks" title="Why these, why now" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 64 }}>
        {items.map((ex: any, i: number) => (
          <Card key={ex.id || i} padding={28} hover>
            <div style={{ marginBottom: 12 }}><Tag color="var(--accent)">For you</Tag></div>
            <div className="v3-display-3" style={{ marginBottom: 8 }}>
              {ex.name || ex.nameCs}
            </div>
            {ex.muscleGroups && (
              <div className="v3-caption" style={{ marginBottom: 12 }}>
                {(Array.isArray(ex.muscleGroups) ? ex.muscleGroups : []).join(' / ')}
              </div>
            )}
            {ex.sets && (
              <div className="v3-body" style={{ color: 'var(--text-2)', marginBottom: 12 }}>
                {ex.sets}x{ex.reps} {ex.weightKg ? `@ ${ex.weightKg}kg` : ''}
                {ex.restSeconds ? ` — ${ex.restSeconds}s rest` : ''}
              </div>
            )}
            {ex.rationale && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12 }}>
                <FitIcon name="bolt" size={14} color="var(--accent-hot)" />
                <span className="v3-caption" style={{ flex: 1, color: 'var(--clay)' }}>
                  {ex.rationale}
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

/* ── More This Week ──────────────────────────────────── */

function MoreThisWeek({ items }: { items: any[] }) {
  if (items.length === 0) return null;

  return (
    <>
      <SectionHeader eyebrow="Also for you" title="More this week" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 48 }}>
        {items.map((ex: any, i: number) => (
          <Card key={ex.id || i} padding={20} hover>
            {ex.category && (
              <div style={{ marginBottom: 10 }}><Tag>{ex.category}</Tag></div>
            )}
            <div className="v3-title" style={{ marginBottom: 4 }}>
              {ex.name || ex.nameCs}
            </div>
            <div className="v3-caption">
              {ex.muscleGroups && Array.isArray(ex.muscleGroups)
                ? ex.muscleGroups.join(' / ')
                : ''}
              {ex.sets ? ` — ${ex.sets}x${ex.reps}` : ''}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ── Refresh Indicator ───────────────────────────────── */

function RefreshIndicator({ days }: { days: number }) {
  return (
    <div style={{ textAlign: 'center', paddingBottom: 64 }}>
      <div className="v3-eyebrow" style={{ marginBottom: 8 }}>
        Next refresh in {days} {days === 1 ? 'day' : 'days'}
      </div>
      <div className="v3-caption">New recommendations every Monday</div>
    </div>
  );
}

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
