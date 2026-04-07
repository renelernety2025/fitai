'use client';

/**
 * Dashboard v2 — North Star (iteration 3)
 * Conservative layout: pure flex column, no absolute chaos.
 * Three concentric Activity Rings as the hero.
 * Monumental typography below.
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

function TripleRing({
  move,
  exercise,
  stand,
  size = 440,
}: {
  move: number;
  exercise: number;
  stand: number;
  size?: number;
}) {
  const stroke = size * 0.075;
  const gap = stroke * 0.55;
  const ring = (i: number, value: number, color: string) => {
    const radius = size / 2 - stroke / 2 - i * (stroke + gap);
    const c = 2 * Math.PI * radius;
    const off = c * (1 - Math.max(0, Math.min(1, value)));
    return (
      <g key={i}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeOpacity={0.13} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{
            filter: `drop-shadow(0 0 ${stroke * 0.7}px ${color})`,
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />
      </g>
    );
  };
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="block h-auto w-full max-w-[440px] -rotate-90">
      {ring(0, move, '#FF375F')}
      {ring(1, exercise, '#A8FF00')}
      {ring(2, stand, '#00E5FF')}
    </svg>
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
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
      </div>
    );
  }

  const move = stats && stats.totalSessions > 0 ? Math.min(1, stats.totalSessions / 5) : 0.15;
  const exercise = stats ? Math.min(1, (stats.currentStreak || 0) / 7) : 0.25;
  const stand = stats ? Math.min(1, ((stats.totalXP || 0) % 1000) / 1000) : 0.5;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobré odpoledne' : 'Dobrý večer';
  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* Ambient gradient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(255, 55, 95, 0.08) 0%, rgba(0, 0, 0, 1) 60%)',
        }}
      />

      {/* Top navigation */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/dashboard-v2" className="text-sm font-bold tracking-tight">
          FitAI
        </Link>
        <nav className="hidden gap-7 text-[13px] font-medium text-white/55 sm:flex">
          <Link href="/gym/start" className="transition hover:text-white">Trénink</Link>
          <Link href="/vyziva" className="transition hover:text-white">Výživa</Link>
          <Link href="/lekce" className="transition hover:text-white">Lekce</Link>
          <Link href="/progress" className="transition hover:text-white">Pokrok</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-32">
        {/* ── HERO ── */}
        <section className="flex flex-col items-center pt-12 pb-24 text-center">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            {greeting}
          </div>
          <h1
            className="mb-12 font-bold tracking-tight text-white"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em' }}
          >
            {firstName}.
          </h1>

          {/* Ring with overlay */}
          <div className="relative w-full max-w-[440px]">
            <TripleRing move={move} exercise={exercise} stand={stand} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="font-bold tracking-tight tabular-nums text-white"
                style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', letterSpacing: '-0.05em', lineHeight: 1 }}
              >
                {stats?.currentStreak || 0}
              </div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                Dní v řadě
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: '#FF375F', boxShadow: '0 0 8px #FF375F' }} />
              Sessions
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: '#A8FF00', boxShadow: '0 0 8px #A8FF00' }} />
              Streak
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
              XP
            </span>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="mb-32 grid grid-cols-3 gap-6 border-y border-white/10 py-16 text-center">
          <Stat value={stats?.totalSessions || 0} label="Cvičení" />
          <Stat value={Math.floor((stats?.totalMinutes || 0) / 60)} label="Hodin" />
          <Stat value={stats?.totalXP || 0} label="XP" />
        </section>

        {/* ── LESSON ── */}
        {lesson && (
          <Link href={`/lekce/${lesson.slug}`} className="group mb-32 block">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Lekce týdne
            </div>
            <h2
              className="mb-5 font-bold tracking-tight text-white transition group-hover:text-white/80"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
            >
              {lesson.titleCs}
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-white/55">
              {lesson.bodyCs.slice(0, 200)}…
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
              Číst <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </Link>
        )}

        {/* ── NUTRITION ── */}
        {nutrition && (
          <Link href="/vyziva" className="group mb-32 block">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Výživa
            </div>
            <div
              className="font-bold tracking-tight text-white transition group-hover:text-white/80"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}
            >
              {nutrition.totals.kcal.toLocaleString('cs-CZ')}
              <span className="text-white/30"> / {nutrition.goals.dailyKcal.toLocaleString('cs-CZ')} kcal</span>
            </div>
            <div className="mt-3 text-sm text-white/55">
              Protein {nutrition.totals.proteinG}g · Sacharidy {nutrition.totals.carbsG}g · Tuky {nutrition.totals.fatG}g
            </div>
          </Link>
        )}

        {/* ── AI INSIGHT ── */}
        {insights?.recovery && (
          <div className="mb-32">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              AI · Stav regenerace
            </div>
            <div
              className="font-bold tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}
            >
              {insights.recovery.overallStatus === 'fresh' && 'Svěží.'}
              {insights.recovery.overallStatus === 'normal' && 'Normální.'}
              {insights.recovery.overallStatus === 'fatigued' && 'Unavený.'}
              {insights.recovery.overallStatus === 'overreached' && 'Přetrénovaný.'}
            </div>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/55">
              {insights.recovery.recommendation}
            </p>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="mb-24 text-center">
          <Link
            href="/gym/start"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105 hover:bg-white/90"
          >
            Začít trénink
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="text-center text-[9px] font-semibold uppercase tracking-[0.4em] text-white/20">
          FitAI
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div
        className="font-bold tracking-tight tabular-nums text-white"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.05em', lineHeight: 1 }}
      >
        {value.toLocaleString('cs-CZ')}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
    </div>
  );
}
