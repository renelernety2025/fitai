'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { useAuth } from '@/lib/auth-context';
import { FadeIn, NumberTicker } from '@/components/v2/motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AdminStats {
  totalUsers: number;
  registrationsToday: number;
  activeToday: number;
  totalSessions: number;
  totalFoodLogs: number;
  totalCheckIns: number;
  aiCallsToday: number;
}

interface AdminAnalytics {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  newUsersMonth: number;
  sessionsToday: number;
  sessionsWeek: number;
  dauToday: number;
  wauWeek: number;
  retentionRate: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'FitAI — Admin';
  }, []);

  useEffect(() => {
    if (!user?.isAdmin) return;
    const token = localStorage.getItem('fitai_token');
    fetch(`${API_BASE}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(setStats)
      .catch(() => setError('Nelze nacist data'));

    fetch(`${API_BASE}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load analytics');
        return r.json();
      })
      .then(setAnalytics)
      .catch(() => {});
  }, [user]);

  if (!user?.isAdmin) {
    return (
      <>
        <section className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <V2Display size="xl">Pristup odepren</V2Display>
            <p className="mt-4 text-white/40">
              Tato stranka je dostupna pouze pro administratory.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
            >
              Zpet na dashboard
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white"
      >
        &larr; Dashboard
      </Link>

      <section className="pt-12 pb-16">
        <V2SectionLabel>Administrace</V2SectionLabel>
        <V2Display size="xl">Admin panel</V2Display>
      </section>

      {error && <p className="mb-8 text-sm text-[#FF375F]">{error}</p>}

      {stats && (
        <FadeIn delay={0.1}>
          <section className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard value={stats.totalUsers} label="Uzivatelu celkem" />
            <StatCard
              value={stats.registrationsToday}
              label="Registrace dnes"
              accent="#A8FF00"
            />
            <StatCard
              value={stats.activeToday}
              label="Aktivnich dnes"
              accent="#00E5FF"
            />
            <StatCard value={stats.totalSessions} label="Treninku celkem" />
            <StatCard value={stats.totalFoodLogs} label="Zaznamu jidla" />
            <StatCard value={stats.totalCheckIns} label="Check-inu" />
            <StatCard
              value={stats.aiCallsToday}
              label="AI volani dnes"
              accent="#BF5AF2"
            />
          </section>
        </FadeIn>
      )}

      {analytics && (
        <FadeIn delay={0.3}>
          <section className="mt-12">
            <div className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Analyticke metriky
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard
                value={analytics.dauToday}
                label="DAU (dnes)"
                accent="#00E5FF"
              />
              <StatCard
                value={analytics.wauWeek}
                label="WAU (7 dni)"
                accent="#00E5FF"
              />
              <StatCard
                value={analytics.newUsersMonth}
                label="MAU (30 dni)"
                accent="#A8FF00"
              />
              <StatCard
                value={analytics.retentionRate}
                label="Retence %"
                accent={
                  analytics.retentionRate > 30
                    ? '#A8FF00'
                    : '#FF375F'
                }
              />
              <StatCard
                value={analytics.sessionsWeek}
                label="Sessions (7d)"
              />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 p-6">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Noví uzivatele
                </div>
                <div className="space-y-3">
                  <BarMetric
                    label="Dnes"
                    value={analytics.newUsersToday}
                    max={Math.max(analytics.newUsersMonth, 1)}
                    color="#A8FF00"
                  />
                  <BarMetric
                    label="7 dni"
                    value={analytics.newUsersWeek}
                    max={Math.max(analytics.newUsersMonth, 1)}
                    color="#00E5FF"
                  />
                  <BarMetric
                    label="30 dni"
                    value={analytics.newUsersMonth}
                    max={Math.max(analytics.newUsersMonth, 1)}
                    color="#BF5AF2"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 p-6">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Treninky
                </div>
                <div className="space-y-3">
                  <BarMetric
                    label="Dnes"
                    value={analytics.sessionsToday}
                    max={Math.max(analytics.sessionsWeek, 1)}
                    color="#FF375F"
                  />
                  <BarMetric
                    label="7 dni"
                    value={analytics.sessionsWeek}
                    max={Math.max(analytics.sessionsWeek, 1)}
                    color="#FF9F0A"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 p-6">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Engagement
                </div>
                <div className="flex flex-col items-center justify-center py-4">
                  <div
                    className="font-bold tabular-nums"
                    style={{
                      fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                      color:
                        analytics.retentionRate > 30
                          ? '#A8FF00'
                          : '#FF375F',
                    }}
                  >
                    {analytics.retentionRate}%
                  </div>
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    7-day retence
                  </div>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>
      )}
    </>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 p-6">
      <div
        className="font-bold tabular-nums"
        style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          color: accent || 'white',
        }}
      >
        <NumberTicker value={value} />
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </div>
    </div>
  );
}

function BarMetric({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-white/50">{label}</span>
        <span className="text-[11px] font-semibold tabular-nums text-white">
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
