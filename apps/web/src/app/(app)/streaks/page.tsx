'use client';

/**
 * Streaks — Snapchat-style workout streaks with friends.
 */

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { GlassCard } from '@/components/v2/GlassCard';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';

interface PersonStreak {
  id: string;
  name: string;
  avatarUrl: string | null;
  streakCount: number;
  lastBothActive: string;
  partnerTrainedToday: boolean;
  youTrainedToday: boolean;
}

const MILESTONES = [7, 30, 100, 365];

function milestoneBadge(count: number): string | null {
  if (count >= 365) return '\uD83D\uDC8E';
  if (count >= 100) return '\uD83C\uDFC6';
  if (count >= 30) return '\uD83E\uDD47';
  if (count >= 7) return '\u2B50';
  return null;
}

function nextMilestone(count: number): number | null {
  for (const m of MILESTONES) {
    if (count < m) return m;
  }
  return null;
}

// Mock data (backend will add person streaks later)
const MOCK_STREAKS: PersonStreak[] = [
  {
    id: '1',
    name: 'Jakub K.',
    avatarUrl: null,
    streakCount: 42,
    lastBothActive: '2026-04-22',
    partnerTrainedToday: true,
    youTrainedToday: true,
  },
  {
    id: '2',
    name: 'Tereza M.',
    avatarUrl: null,
    streakCount: 108,
    lastBothActive: '2026-04-22',
    partnerTrainedToday: true,
    youTrainedToday: true,
  },
  {
    id: '3',
    name: 'Martin P.',
    avatarUrl: null,
    streakCount: 7,
    lastBothActive: '2026-04-21',
    partnerTrainedToday: false,
    youTrainedToday: true,
  },
  {
    id: '4',
    name: 'Anna V.',
    avatarUrl: null,
    streakCount: 365,
    lastBothActive: '2026-04-22',
    partnerTrainedToday: true,
    youTrainedToday: true,
  },
  {
    id: '5',
    name: 'Pavel R.',
    avatarUrl: null,
    streakCount: 3,
    lastBothActive: '2026-04-21',
    partnerTrainedToday: false,
    youTrainedToday: false,
  },
];

function StreakCard({ streak }: { streak: PersonStreak }) {
  const atRisk =
    !streak.partnerTrainedToday || !streak.youTrainedToday;
  const badge = milestoneBadge(streak.streakCount);
  const next = nextMilestone(streak.streakCount);

  return (
    <GlassCard
      className={`p-4 ${
        atRisk ? 'border-[#FF9F0A]/30' : ''
      }`}
      hover={false}
      glow={atRisk ? '#FF9F0A11' : undefined}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 text-sm font-bold"
          style={{ width: 44, height: 44 }}
        >
          {streak.avatarUrl ? (
            <img
              src={streak.avatarUrl}
              alt={streak.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white/50">
              {streak.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-white truncate">
              {streak.name}
            </h3>
            {badge && (
              <span className="text-sm">{badge}</span>
            )}
          </div>
          {atRisk && (
            <p className="mt-0.5 text-[10px] font-semibold text-[#FF9F0A]">
              Streak v ohrozeni!
            </p>
          )}
          {!atRisk && next && (
            <p className="mt-0.5 text-[10px] text-white/25">
              Dalsi milestone: {next} dni
            </p>
          )}
        </div>

        {/* Streak count */}
        <div className="flex-shrink-0 flex items-center gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-white">
            {streak.streakCount}
          </span>
          <span className="text-lg text-[#FF375F]">
            &#128293;
          </span>
        </div>
      </div>

      {/* Status dots */}
      <div className="mt-3 flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: streak.youTrainedToday
                ? '#A8FF00'
                : '#FF9F0A',
            }}
          />
          <span className="text-white/35">
            Ty:{' '}
            {streak.youTrainedToday
              ? 'Hotovo'
              : 'Ceka'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: streak.partnerTrainedToday
                ? '#A8FF00'
                : '#FF9F0A',
            }}
          />
          <span className="text-white/35">
            Partner:{' '}
            {streak.partnerTrainedToday
              ? 'Hotovo'
              : 'Ceka'}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

export default function StreaksPage() {
  const [streaks, setStreaks] = useState<PersonStreak[]>([]);

  useEffect(() => {
    document.title = 'FitAI — Streaks';
  }, []);

  useEffect(() => {
    // Use mock data for now, backend will add endpoint
    setStreaks(
      [...MOCK_STREAKS].sort(
        (a, b) => b.streakCount - a.streakCount,
      ),
    );
  }, []);

  const atRiskCount = streaks.filter(
    (s) => !s.partnerTrainedToday || !s.youTrainedToday,
  ).length;

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Workout Streaks</V2SectionLabel>
        <V2Display size="xl">Streaks.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Spolecne treninky s prateli. Trenujte oba kazdy den.
        </p>
      </section>

      {/* Summary */}
      <div className="mb-8 flex gap-4">
        <GlassCard className="px-5 py-3" hover={false}>
          <span className="text-2xl font-bold text-white">
            {streaks.length}
          </span>
          <span className="ml-2 text-[11px] text-white/40">
            aktivnich streaku
          </span>
        </GlassCard>
        {atRiskCount > 0 && (
          <GlassCard
            className="px-5 py-3 border-[#FF9F0A]/20"
            hover={false}
          >
            <span className="text-2xl font-bold text-[#FF9F0A]">
              {atRiskCount}
            </span>
            <span className="ml-2 text-[11px] text-white/40">
              v ohrozeni
            </span>
          </GlassCard>
        )}
      </div>

      {/* Milestone legend */}
      <div className="mb-8 flex flex-wrap gap-4 text-[11px] text-white/35">
        <span>\u2B50 7 dni</span>
        <span>\uD83E\uDD47 30 dni</span>
        <span>\uD83C\uDFC6 100 dni</span>
        <span>\uD83D\uDC8E 365 dni</span>
      </div>

      {/* Streak list */}
      {streaks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-white/30">
            Zatim zadne streaky. Pozvi pritelkyne.
          </p>
        </div>
      ) : (
        <StaggerContainer>
          <div className="space-y-3 mb-12">
            {streaks.map((s) => (
              <StaggerItem key={s.id}>
                <StreakCard streak={s} />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      )}
    </V2Layout>
  );
}
