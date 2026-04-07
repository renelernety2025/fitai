'use client';

/**
 * Dashboard v2 — North Star design
 * Style: Apple Music (iOS 10-12 era) + Activity Rings glow
 * Principles: massive typography, tons of negative space, OLED black,
 *             single hero gradient per section, no emojis in UI chrome,
 *             progress as light not decoration.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  getMyStats,
  getInsights,
  getLessonOfTheWeek,
  getNutritionToday,
  type StatsData,
  type Insights,
  type Lesson,
  type NutritionToday,
} from '@/lib/api';

// ── Activity Ring (inspired by Apple Watch) ─────────────────────────
function ActivityRing({
  value,
  total,
  size = 220,
  stroke = 18,
  color = '#FF375F', // Apple Activity "Move" pink
  glow = true,
  label,
  unit,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  color?: string;
  glow?: boolean;
  label?: string;
  unit?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, total > 0 ? value / total : 0));
  const offset = circumference * (1 - pct);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeOpacity={0.12}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: glow ? `drop-shadow(0 0 12px ${color})` : 'none',
            transition: 'stroke-dashoffset 1s ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40">
          {label}
        </div>
        <div className="mt-1 text-5xl font-bold tracking-tight text-white tabular-nums">
          {value}
        </div>
        {unit && (
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-white/40">
            of {total} {unit}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section Header ──────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
      {children}
    </div>
  );
}

// ── Hero Card (massive typography) ──────────────────────────────────
function HeroGreeting({ name, level }: { name: string; level?: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobré odpoledne' : 'Dobrý večer';

  return (
    <div className="mb-12">
      <div className="mb-2 text-sm font-medium uppercase tracking-widest text-white/40">
        {greeting}
      </div>
      <h1 className="text-6xl font-bold tracking-tight text-white sm:text-7xl">
        {name}.
      </h1>
      {level && (
        <div className="mt-3 text-lg font-medium text-white/50">
          {level} · připraven na další úroveň
        </div>
      )}
    </div>
  );
}

export default function DashboardV2Page() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nutrition, setNutrition] = useState<NutritionToday | null>(null);

  useEffect(() => {
    getMyStats().then(setStats).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
    getLessonOfTheWeek().then(setLesson).catch(console.error);
    getNutritionToday().then(setNutrition).catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-2 w-2 animate-pulse rounded-full bg-white/30" />
      </div>
    );
  }

  // Recovery status — single source of truth for hero ring
  const recovery = insights?.recovery;

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* Top nav — minimal, no background */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
        <Link href="/dashboard-v2" className="text-sm font-bold tracking-tight">
          FitAI
        </Link>
        <div className="flex gap-8 text-[13px] font-medium text-white/60">
          <Link href="/gym/start" className="transition hover:text-white">Trénink</Link>
          <Link href="/vyziva" className="transition hover:text-white">Výživa</Link>
          <Link href="/lekce" className="transition hover:text-white">Lekce</Link>
          <Link href="/progress" className="transition hover:text-white">Pokrok</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-8 pb-32 pt-12">
        <HeroGreeting
          name={user?.name?.split(' ')[0] || 'Athlete'}
          level={stats?.levelName}
        />

        {/* ── Hero Activity: Big Ring + Vital Stats ── */}
        <section className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left: Activity Ring */}
          <div className="flex flex-col items-center justify-center lg:items-start">
            <SectionLabel>Dnes</SectionLabel>
            <ActivityRing
              value={stats?.totalSessions || 0}
              total={Math.max((stats?.totalSessions || 0) + 1, 5)}
              color="#FF375F"
              label="Sessions"
              unit="goal"
            />
            <div className="mt-8 text-base text-white/50">
              {recovery
                ? `Stav regenerace: ${recovery.overallStatus}`
                : 'Začni svůj první trénink dnes'}
            </div>
          </div>

          {/* Right: Vital Stats — typography hierarchy */}
          <div className="flex flex-col justify-center gap-8">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Streak
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-7xl font-bold tracking-tight text-white tabular-nums">
                  {stats?.currentStreak || 0}
                </span>
                <span className="text-lg font-medium text-white/40">dní v řadě</span>
              </div>
            </div>

            <div className="h-px w-full bg-white/8" />

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Total XP
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-7xl font-bold tracking-tight text-white tabular-nums">
                  {(stats?.totalXP || 0).toLocaleString('cs-CZ')}
                </span>
                <span className="text-lg font-medium text-white/40">bodů</span>
              </div>
            </div>

            <div className="h-px w-full bg-white/8" />

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Total Time
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-7xl font-bold tracking-tight text-white tabular-nums">
                  {Math.floor((stats?.totalMinutes || 0) / 60)}
                </span>
                <span className="text-lg font-medium text-white/40">hodin</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Nutrition Rings Trio ── */}
        {nutrition && (
          <section className="mb-24">
            <SectionLabel>Výživa dnes</SectionLabel>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <ActivityRing
                  value={nutrition.totals.kcal}
                  total={nutrition.goals.dailyKcal}
                  size={180}
                  stroke={14}
                  color="#FF9500"
                  label="Kalorie"
                  unit="kcal"
                />
              </div>
              <div className="flex flex-col items-center">
                <ActivityRing
                  value={nutrition.totals.proteinG}
                  total={nutrition.goals.dailyProteinG}
                  size={180}
                  stroke={14}
                  color="#FF2D55"
                  label="Protein"
                  unit="g"
                />
              </div>
              <div className="flex flex-col items-center">
                <ActivityRing
                  value={nutrition.totals.carbsG}
                  total={nutrition.goals.dailyCarbsG}
                  size={180}
                  stroke={14}
                  color="#30D158"
                  label="Sacharidy"
                  unit="g"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <Link
                href="/vyziva"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Otevřít jídelníček
              </Link>
            </div>
          </section>
        )}

        {/* ── Featured: Lesson of the Week (Apple Music style) ── */}
        {lesson && (
          <section className="mb-24">
            <SectionLabel>Lekce týdne</SectionLabel>
            <Link
              href={`/lekce/${lesson.slug}`}
              className="group block overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C1E] via-[#1C1C1E] to-[#0A84FF]/20 p-12 transition hover:from-[#1C1C1E] hover:via-[#1C1C1E] hover:to-[#0A84FF]/30"
            >
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0A84FF]">
                {lesson.category} · {lesson.durationMin} min čtení
              </div>
              <h2 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {lesson.titleCs}
              </h2>
              <p className="max-w-2xl text-lg leading-relaxed text-white/60 line-clamp-3">
                {lesson.bodyCs}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-white">
                Číst lekci
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </section>
        )}

        {/* ── AI Insights — minimal cards ── */}
        {insights && (insights.plateaus.length > 0 || insights.weakPoints.weakMuscleGroups.length > 0) && (
          <section className="mb-24">
            <SectionLabel>AI Insights</SectionLabel>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {insights.plateaus.slice(0, 2).map((p) => (
                <div
                  key={p.exerciseId}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:bg-white/[0.05]"
                >
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#FF9F0A]">
                    Plateau detected
                  </div>
                  <div className="mb-2 text-2xl font-bold tracking-tight text-white">
                    {p.exerciseName}
                  </div>
                  <div className="mb-3 text-sm text-white/50">
                    {p.weeksStagnant} týdnů na {p.currentMaxWeight}kg
                  </div>
                  <p className="text-sm leading-relaxed text-white/70">{p.recommendation}</p>
                </div>
              ))}
              {insights.weakPoints.weakMuscleGroups.slice(0, 2).map((w) => (
                <div
                  key={w.muscle}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:bg-white/[0.05]"
                >
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#BF5AF2]">
                    Weak point
                  </div>
                  <div className="mb-2 text-2xl font-bold tracking-tight text-white">
                    {w.muscle}
                  </div>
                  <p className="text-sm leading-relaxed text-white/70">{w.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Quick Actions — Apple Watch app launcher ── */}
        <section className="mb-24">
          <SectionLabel>Začni nyní</SectionLabel>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { href: '/gym/start', label: 'Gym', color: '#FF375F' },
              { href: '/doma', label: 'Doma', color: '#30D158' },
              { href: '/videos', label: 'Video', color: '#0A84FF' },
              { href: '/ai-coach', label: 'AI Plán', color: '#BF5AF2' },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-8 backdrop-blur-xl transition hover:border-white/15"
              >
                <div
                  className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl transition group-hover:opacity-50"
                  style={{ background: a.color }}
                />
                <div
                  className="relative mb-4 h-10 w-10 rounded-xl"
                  style={{ background: a.color, boxShadow: `0 0 24px ${a.color}55` }}
                />
                <div className="relative text-lg font-semibold tracking-tight text-white">
                  {a.label}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer — restraint */}
        <div className="mt-32 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white/20">
          FitAI · Designed for performance
        </div>
      </main>
    </div>
  );
}
