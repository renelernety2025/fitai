'use client';

import { useEffect, useState } from 'react';
import {
  V2Layout,
  V2SectionLabel,
  V2Display,
  V2Stat,
} from '@/components/v2/V2Layout';
import { getMyStats, getInsights, type StatsData, type Insights } from '@/lib/api';

export default function ProgressV2Page() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);

  useEffect(() => {
    getMyStats().then(setStats).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Vše co jsi udělal</V2SectionLabel>
        <V2Display size="xl">Pokrok.</V2Display>
      </section>

      {/* Big stats */}
      <section className="mb-32 grid grid-cols-2 gap-y-16 sm:grid-cols-4">
        <V2Stat value={stats.totalSessions} label="Cvičení" />
        <V2Stat value={stats.currentStreak} label="Streak" />
        <V2Stat value={stats.longestStreak || 0} label="Best Streak" />
        <V2Stat value={stats.totalXP} label="XP" />
      </section>

      {/* Time breakdown */}
      <section className="mb-32 border-y border-white/10 py-16">
        <V2SectionLabel>Čas v tréninku</V2SectionLabel>
        <V2Display size="xl">
          {Math.floor((stats.totalMinutes || 0) / 60).toLocaleString('cs-CZ')}
          <span className="text-white/30"> hodin</span>
        </V2Display>
        <p className="mt-4 text-sm text-white/55">
          {stats.totalMinutes.toLocaleString('cs-CZ')} minut · průměrně{' '}
          {stats.totalSessions > 0
            ? Math.round(stats.totalMinutes / stats.totalSessions)
            : 0}{' '}
          min na cvičení
        </p>
      </section>

      {/* Recovery */}
      {insights?.recovery && (
        <section className="mb-32">
          <V2SectionLabel>Stav regenerace</V2SectionLabel>
          <V2Display size="lg">
            {insights.recovery.overallStatus === 'fresh' && 'Svěží.'}
            {insights.recovery.overallStatus === 'normal' && 'Normální.'}
            {insights.recovery.overallStatus === 'fatigued' && 'Unavený.'}
            {insights.recovery.overallStatus === 'overreached' && 'Přetrénovaný.'}
          </V2Display>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
            {insights.recovery.recommendation}
          </p>
        </section>
      )}

      {/* Plateaus */}
      {insights && insights.plateaus.length > 0 && (
        <section className="mb-32">
          <V2SectionLabel>Plateaus</V2SectionLabel>
          <div className="space-y-1">
            {insights.plateaus.slice(0, 5).map((p) => (
              <div
                key={p.exerciseId}
                className="border-b border-white/8 py-6"
              >
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FF9F0A]">
                  {p.weeksStagnant} týdnů na {p.currentMaxWeight}kg
                </div>
                <V2Display size="md">{p.exerciseName}</V2Display>
                <p className="mt-2 max-w-xl text-sm text-white/55">{p.recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Weak points */}
      {insights && insights.weakPoints.weakMuscleGroups.length > 0 && (
        <section className="mb-32">
          <V2SectionLabel>Slabá místa</V2SectionLabel>
          <div className="space-y-1">
            {insights.weakPoints.weakMuscleGroups.slice(0, 5).map((w) => (
              <div key={w.muscle} className="border-b border-white/8 py-6">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#BF5AF2]">
                  Méně objemu
                </div>
                <V2Display size="md">{w.muscle}</V2Display>
                <p className="mt-2 max-w-xl text-sm text-white/55">{w.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </V2Layout>
  );
}
