'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
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

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
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
  }, [user]);

  if (!user?.isAdmin) {
    return (
      <V2Layout>
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
      </V2Layout>
    );
  }

  return (
    <V2Layout>
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
    </V2Layout>
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
