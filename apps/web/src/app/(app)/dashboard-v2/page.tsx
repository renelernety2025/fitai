'use client';

/**
 * Dashboard v2 — North Star (iteration 2)
 * Philosophy: Less, but monumental.
 * Three concentric Activity Rings as the entire above-the-fold experience.
 * Time of day shifts the ambient gradient.
 * Typography scales with viewport (clamp). No cards. No grids.
 * Below-the-fold: minimal flat list of the only things that matter today.
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

// ── Three concentric Activity Rings (Apple Watch Move/Exercise/Stand) ──
function TripleRing({
  move,    // 0..1
  exercise,
  stand,
  size = 520,
}: {
  move: number;
  exercise: number;
  stand: number;
  size?: number;
}) {
  const stroke = size * 0.075;
  const gap = stroke * 0.55;
  const buildRing = (i: number, value: number, color: string, glow: string) => {
    const radius = size / 2 - stroke / 2 - i * (stroke + gap);
    const c = 2 * Math.PI * radius;
    const off = c * (1 - Math.max(0, Math.min(1, value)));
    return (
      <g key={i}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeOpacity={0.13}
          strokeWidth={stroke}
          fill="none"
        />
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
            filter: `drop-shadow(0 0 ${stroke * 0.8}px ${glow})`,
            transition: 'stroke-dashoffset 1.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />
      </g>
    );
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      style={{ maxWidth: '90vw', height: 'auto' }}
    >
      {buildRing(0, move, '#FF375F', '#FF375F')}
      {buildRing(1, exercise, '#A8FF00', '#A8FF00')}
      {buildRing(2, stand, '#00E5FF', '#00E5FF')}
    </svg>
  );
}

// ── Ambient gradient orb that shifts with time of day ──
function AmbientOrb({ hour }: { hour: number }) {
  // Morning: cool blue. Day: white-warm. Evening: orange-red. Night: deep purple.
  const palette =
    hour < 6
      ? ['#1C0E3E', '#06010F'] // night
      : hour < 11
      ? ['#0E2A47', '#06010F'] // morning
      : hour < 17
      ? ['#3C2A1A', '#06010F'] // day-warm
      : hour < 21
      ? ['#3A0E1F', '#06010F'] // evening
      : ['#1C0E3E', '#06010F']; // late
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: `radial-gradient(circle at 50% 35%, ${palette[0]} 0%, ${palette[1]} 60%)`,
      }}
    />
  );
}

export default function DashboardV2Page() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nutrition, setNutrition] = useState<NutritionToday | null>(null);
  const [hour] = useState(() => new Date().getHours());

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

  // Three rings: Move = today's session (0 or 1), Exercise = streak progress, Stand = XP toward next level
  const move = stats && stats.totalSessions > 0 ? Math.min(1, stats.totalSessions / 5) : 0;
  const exercise = stats ? Math.min(1, (stats.currentStreak || 0) / 7) : 0;
  const stand = stats ? Math.min(1, ((stats.totalXP || 0) % 1000) / 1000) : 0;

  const greeting =
    hour < 6 ? 'Brzké ráno' : hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Odpoledne' : 'Večer';

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-black text-white antialiased"
      style={{
        fontFeatureSettings: '"ss01", "cv11"',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <AmbientOrb hour={hour} />

      {/* Floating nav — barely there */}
      <nav className="fixed left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-2 backdrop-blur-2xl">
        <Link href="/dashboard-v2" className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-white">
          Dnes
        </Link>
        <Link href="/gym/start" className="rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/60 transition hover:text-white">
          Trénink
        </Link>
        <Link href="/vyziva" className="rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/60 transition hover:text-white">
          Výživa
        </Link>
        <Link href="/lekce" className="rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/60 transition hover:text-white">
          Lekce
        </Link>
        <Link href="/progress" className="rounded-full px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/60 transition hover:text-white">
          Pokrok
        </Link>
      </nav>

      {/* ─────── HERO: full viewport, single composition ─────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6">
        {/* Top label */}
        <div className="absolute top-24 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
            {greeting}
          </div>
          <div
            className="mt-2 font-bold tracking-tight text-white"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.04em' }}
          >
            {user?.name?.split(' ')[0] || 'Athlete'}
          </div>
        </div>

        {/* THE composition: three rings */}
        <div className="relative">
          <TripleRing move={move} exercise={exercise} stand={stand} />

          {/* Center text — radically minimal */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="font-bold tracking-tight tabular-nums text-white"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.05em' }}
            >
              {stats?.currentStreak || 0}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Dní v řadě
            </div>
          </div>
        </div>

        {/* Bottom legend */}
        <div className="absolute bottom-24 flex gap-10 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: '#FF375F', boxShadow: '0 0 10px #FF375F' }} />
            Sessions
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: '#A8FF00', boxShadow: '0 0 10px #A8FF00' }} />
            Streak
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ background: '#00E5FF', boxShadow: '0 0 10px #00E5FF' }} />
            XP
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium uppercase tracking-[0.3em] text-white/30">
          ↓ Posuň
        </div>
      </section>

      {/* ─────── BELOW THE FOLD: monumental list of what matters ─────── */}
      <section className="mx-auto max-w-3xl px-6 py-32">
        {/* The numbers */}
        <div className="mb-32 grid grid-cols-2 gap-y-20 sm:grid-cols-3">
          <Stat value={stats?.totalSessions || 0} label="Cvičení" />
          <Stat value={Math.floor((stats?.totalMinutes || 0) / 60)} label="Hodin" suffix="h" />
          <Stat value={stats?.totalXP || 0} label="XP" big />
        </div>

        {/* Lesson — full bleed type, no card */}
        {lesson && (
          <Link href={`/lekce/${lesson.slug}`} className="group mb-32 block">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Lekce týdne
            </div>
            <h2
              className="mb-4 font-bold tracking-tight text-white transition group-hover:text-white/80"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.04em', lineHeight: 0.95 }}
            >
              {lesson.titleCs}
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-white/50">
              {lesson.bodyCs.slice(0, 180)}…
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white">
              Číst <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </Link>
        )}

        {/* Nutrition — single line */}
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
            <div className="mt-2 text-sm text-white/50">
              Protein {nutrition.totals.proteinG}g · Sacharidy {nutrition.totals.carbsG}g · Tuky {nutrition.totals.fatG}g
            </div>
          </Link>
        )}

        {/* AI Insight — only ONE, the most important */}
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
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/50">
              {insights.recovery.recommendation}
            </p>
          </div>
        )}

        {/* CTA — single, decisive */}
        <div className="mb-32">
          <Link
            href="/gym/start"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-[1.02] hover:bg-white/90"
          >
            Začít trénink
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-[9px] font-medium uppercase tracking-[0.4em] text-white/15">
          FitAI
        </div>
      </section>
    </div>
  );
}

function Stat({
  value,
  label,
  suffix,
  big,
}: {
  value: number;
  label: string;
  suffix?: string;
  big?: boolean;
}) {
  return (
    <div>
      <div
        className="font-bold tracking-tight tabular-nums text-white"
        style={{
          fontSize: big ? 'clamp(3rem, 7vw, 6rem)' : 'clamp(2.5rem, 5vw, 4.5rem)',
          letterSpacing: '-0.05em',
          lineHeight: 0.9,
        }}
      >
        {value.toLocaleString('cs-CZ')}
        {suffix && <span className="text-white/30">{suffix}</span>}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
    </div>
  );
}
