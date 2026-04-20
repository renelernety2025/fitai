'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getWorkoutPlans, getMyStats, type WorkoutPlanData, type StatsData } from '@/lib/api';

const planAccent: Record<string, string> = {
  PUSH_PULL_LEGS: '#FF375F',
  UPPER_LOWER: '#A8FF00',
  FULL_BODY: '#00E5FF',
  CUSTOM: '#BF5AF2',
};

export default function GymV2Page() {
  const [plans, setPlans] = useState<WorkoutPlanData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    getWorkoutPlans().then(setPlans).catch(console.error);
    getMyStats().then(setStats).catch(console.error);
  }, []);

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Připraven?</V2SectionLabel>
        <V2Display size="xl">Trénink.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Vyber svůj plán nebo začni rychlý workout. Forma má přednost před váhou.
        </p>
        {stats && stats.totalSessions > 0 && (
          <div className="mt-4 flex gap-6 text-[11px] font-semibold tabular-nums text-white/30">
            <span>{stats.totalSessions} treninku</span>
            <span>{stats.currentStreak} dni streak</span>
            <span>{stats.totalXP} XP</span>
          </div>
        )}
      </section>

      {/* Quick start cards */}
      <section className="mb-24 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/doma"
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-white/30 hover:bg-white/[0.04]"
        >
          <div
            className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
            style={{ background: '#A8FF00' }}
          />
          <div className="relative">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Bez vybavení
            </div>
            <V2Display size="sm">Doma</V2Display>
            <p className="mt-2 text-sm text-white/50">15-35 min</p>
          </div>
        </Link>
        <Link
          href="/videos"
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-white/30 hover:bg-white/[0.04]"
        >
          <div
            className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
            style={{ background: '#00E5FF' }}
          />
          <div className="relative">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Video
            </div>
            <V2Display size="sm">Lekce</V2Display>
            <p className="mt-2 text-sm text-white/50">Yoga, HIIT, mobilita</p>
          </div>
        </Link>
        <Link
          href="/ai-coach"
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-white/30 hover:bg-white/[0.04]"
        >
          <div
            className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
            style={{ background: '#BF5AF2' }}
          />
          <div className="relative">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Personalizace
            </div>
            <V2Display size="sm">AI Plán</V2Display>
            <p className="mt-2 text-sm text-white/50">Vygeneruj svůj plán</p>
          </div>
        </Link>
        <Link
          href="/micro-workout"
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition hover:border-white/30 hover:bg-white/[0.04]"
        >
          <div
            className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
            style={{ background: '#FF9F0A' }}
          />
          <div className="relative">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              5 minut
            </div>
            <V2Display size="sm">Micro</V2Display>
            <p className="mt-2 text-sm text-white/50">3 random cviky</p>
          </div>
        </Link>
      </section>

      {/* Plans list */}
      <section>
        <V2SectionLabel>Plány</V2SectionLabel>
        <div className="space-y-1">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/plans/${plan.id}`}
              className="group flex items-baseline justify-between border-b border-white/8 py-8 transition hover:border-white/30"
            >
              <div className="flex-1">
                <div
                  className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em]"
                  style={{ color: planAccent[plan.type] || '#FFF' }}
                >
                  {plan.type.replace(/_/g, ' ')} · {plan.daysPerWeek}× týdně
                </div>
                <V2Display size="md">{plan.nameCs}</V2Display>
                <p className="mt-2 max-w-xl text-sm text-white/50 line-clamp-1">
                  {plan.description}
                </p>
              </div>
              <div className="text-2xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white">
                →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </V2Layout>
  );
}
