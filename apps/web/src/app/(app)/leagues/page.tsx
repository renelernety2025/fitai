'use client';

/**
 * Leagues — weekly XP competition with tier badges and leaderboard.
 * Tiers: Bronze, Silver, Gold, Diamond, Legend.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel } from '@/components/v2/V2Layout';
import { StaggerContainer, StaggerItem, NumberTicker } from '@/components/v2/motion';
import { getLeagueCurrent, joinLeague } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { SkeletonCard } from '@/components/v2/Skeleton';

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#00E5FF',
  legend: '#BF5AF2',
};

interface LeagueData {
  tier: string;
  rank: number;
  weeklyXP: number;
  nextTierXP: number;
  joined: boolean;
  endsAt: string;
  leaderboard: { userId: string; name: string; weeklyXP: number; rank: number }[];
  promotionLine: number;
  relegationLine: number;
}

function tierIcon(tier: string, size = 64): React.ReactNode {
  const c = TIER_COLORS[tier.toLowerCase()] || '#C0C0C0';
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${c}44 0%, ${c}11 70%)`,
        border: `2px solid ${c}`,
        boxShadow: `0 0 24px ${c}44`,
      }}
    >
      <span className="text-lg font-bold uppercase" style={{ color: c }}>
        {tier.charAt(0)}
      </span>
    </div>
  );
}

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Skonceno';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${days}d ${hours}h ${mins}m ${secs}s`;
}

function LiveCountdown({ endsAt }: { endsAt: string }) {
  const [text, setText] = useState(() => formatCountdown(endsAt));
  useEffect(() => {
    const id = setInterval(() => setText(formatCountdown(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return <span className="font-semibold text-white/70">{text}</span>;
}

function getHoursRemaining(endsAt: string): number {
  return Math.max(0, (new Date(endsAt).getTime() - Date.now()) / 3_600_000);
}

function LeagueUrgencyBanner({ endsAt }: { endsAt: string }) {
  const [hours, setHours] = useState(() => getHoursRemaining(endsAt));

  useEffect(() => {
    const id = setInterval(() => setHours(getHoursRemaining(endsAt)), 60_000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (hours > 24) return null;

  const isUrgent = hours <= 2;

  return (
    <div
      className={`mb-8 rounded-xl border px-6 py-4 text-center text-sm font-semibold ${
        isUrgent
          ? 'border-[#FF375F]/40 bg-[#FF375F]/10 text-[#FF375F]'
          : 'border-[#FF9F0A]/30 bg-[#FF9F0A]/5 text-[#FF9F0A]'
      }`}
      style={{
        animation: isUrgent
          ? 'pulse 1.5s ease-in-out infinite'
          : 'pulse 3s ease-in-out infinite',
      }}
    >
      {isUrgent
        ? `Posledni sance! Zbyva ${Math.max(1, Math.round(hours * 60))} minut do konce ligy!`
        : `Zbyva ${Math.round(hours)} hodin do konce ligy!`}
    </div>
  );
}

export default function LeaguesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Ligy'; }, []);

  useEffect(() => {
    getLeagueCurrent()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      const d = await joinLeague();
      setData(d);
    } catch {
      setError('Nepodarilo se pripojit k lige');
    }
    setJoining(false);
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-24">
        <V2SectionLabel>Ligy</V2SectionLabel>
        <h1
          className="mb-16 font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          Tydeni soutez
        </h1>

        {error && (
          <div className="mb-6 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
            {error}
          </div>
        )}

        {loading && (
          <div className="py-8">
            <SkeletonCard lines={8} />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Hero: tier + rank + XP */}
            <div className="mb-12 flex flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-3">
                {tierIcon(data.tier, 80)}
                <button onClick={() => getLeagueCurrent().then(setData).catch(() => {})} className="text-white/20 hover:text-white/50 transition" aria-label="Obnovit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                </button>
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: TIER_COLORS[data.tier.toLowerCase()] }}>
                {data.tier}
              </div>
              <div
                className="font-bold tabular-nums tracking-tight text-white"
                style={{ fontSize: 'clamp(3rem, 7vw, 5rem)', letterSpacing: '-0.05em', lineHeight: 1 }}
              >
                #{data.rank}
              </div>
              <div className="text-sm text-white/50"><NumberTicker value={data.weeklyXP} /> XP tento tyden</div>
            </div>

            {/* XP progress bar */}
            {data.nextTierXP > 0 && (
              <div className="mx-auto mb-12 max-w-md">
                <div className="mb-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  <span>Dalsi tier</span>
                  <span>{data.weeklyXP} / {data.nextTierXP} XP</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (data.weeklyXP / data.nextTierXP) * 100)}%`,
                      background: TIER_COLORS[data.tier.toLowerCase()] || '#A8FF00',
                    }}
                  />
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mb-12 text-center">
              <Link href="/gym" className="mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold text-black" style={{ backgroundColor: '#A8FF00' }}>
                Získej XP tréninkem
              </Link>
            </div>

            {/* Urgency banner */}
            <LeagueUrgencyBanner endsAt={data.endsAt} />

            {/* Timer */}
            <div className="mb-12 text-center text-sm text-white/40">
              Tyden konci za <LiveCountdown endsAt={data.endsAt} />
            </div>

            {/* Join button */}
            {!data.joined && (
              <div className="mb-12 text-center">
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:scale-105 disabled:opacity-50"
                >
                  {joining ? 'Pripojuji...' : 'Pripojit se'}
                </button>
              </div>
            )}

            {/* Leaderboard */}
            <V2SectionLabel>Zebricek</V2SectionLabel>
            {data.leaderboard.length === 0 && (
              <p className="py-12 text-center text-sm text-white/30">
                Zatim zadni soutezici. Bud prvni!
              </p>
            )}
            <StaggerContainer className="space-y-2">
              {data.leaderboard.map((entry) => {
                const isMe = entry.userId === user?.id;
                const promoted = entry.rank <= data.promotionLine;
                const relegated = entry.rank > data.leaderboard.length - data.relegationLine;
                return (
                  <StaggerItem key={entry.userId}>
                  <div
                    className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition ${
                      isMe
                        ? 'border-[#A8FF00]/30 bg-[#A8FF00]/5'
                        : 'border-white/8 hover:border-white/15'
                    }`}
                  >
                    <span className="w-8 text-center text-lg font-bold tabular-nums text-white/30">
                      {entry.rank}
                    </span>
                    {promoted && <span className="text-xs text-green-400">&#9650;</span>}
                    {relegated && <span className="text-xs text-red-400">&#9660;</span>}
                    <span className={`flex-1 text-sm font-semibold ${isMe ? 'text-[#A8FF00]' : 'text-white'}`}>
                      {entry.name}
                      {isMe && ' (ty)'}
                    </span>
                    <span className="text-sm tabular-nums text-white/50">{entry.weeklyXP.toLocaleString('cs-CZ')} XP</span>
                  </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </>
        )}

        {!loading && !data && (
          <div className="py-24 text-center">
            <p className="mb-6 text-white/40">Ligy nejsou aktivni.</p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:scale-105 disabled:opacity-50"
            >
              {joining ? 'Pripojuji...' : 'Pripojit se k lige'}
            </button>
          </div>
        )}
      </section>
    </V2Layout>
  );
}
