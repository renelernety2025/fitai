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
import { V2Layout } from '@/components/v2/V2Layout';
import { V2DailyBrief } from '@/components/v2/V2DailyBrief';
import TodayActionCard from '@/components/dashboard/TodayActionCard';
import {
  getMyStats,
  getInsights,
  getLessonOfTheWeek,
  getNutritionToday,
  getWeeklyReview,
  getDailyBrief,
  getDailyMotivation,
  getMicroWorkout,
  getTodayAction,
  getStreakFreezeStatus,
  useStreakFreeze,
  type StatsData,
  type Insights,
  type Lesson,
  type NutritionToday,
  type WeeklyReview,
  type DailyBrief,
  type MicroWorkoutData,
  type TodayAction,
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
  const [weekly, setWeekly] = useState<WeeklyReview | null>(null);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [micro, setMicro] = useState<MicroWorkoutData | null>(null);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [todayAction, setTodayAction] = useState<TodayAction | null>(null);
  const [freezeStatus, setFreezeStatus] = useState<any>(null);
  const [freezeModal, setFreezeModal] = useState(false);
  const [freezing, setFreezing] = useState(false);

  useEffect(() => {
    getMyStats().then(setStats).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
    getLessonOfTheWeek().then(setLesson).catch(console.error);
    getNutritionToday().then(setNutrition).catch(console.error);
    getWeeklyReview().then((r) => setWeekly(r.review)).catch(console.error);
    getDailyBrief().then((r) => setBrief(r.brief)).catch(console.error);
    getMicroWorkout().then(setMicro).catch(console.error);
    getDailyMotivation().then((r) => setMotivation(r.message)).catch(console.error);
    getTodayAction().then(setTodayAction).catch(console.error);
    getStreakFreezeStatus().then(setFreezeStatus).catch(() => {});
  }, []);

  async function handleFreeze() {
    setFreezing(true);
    try {
      await useStreakFreeze();
      setFreezeStatus((prev: any) => prev ? { ...prev, remaining: prev.remaining - 1, usedToday: true } : prev);
      setFreezeModal(false);
    } catch { /* noop */ } finally {
      setFreezing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#A8FF00]" />
      </div>
    );
  }

  const move = stats && stats.totalSessions > 0 ? Math.min(1, stats.totalSessions / 5) : 0.15;
  const exercise = stats ? Math.min(1, (stats.currentStreak || 0) / 7) : 0.25;
  const stand = stats ? Math.min(1, ((stats.totalXP || 0) % 1000) / 1000) : 0.5;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dobré ráno' : hour < 18 ? 'Dobré odpoledne' : 'Dobrý večer';
  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  const isNewUser = stats?.totalSessions === 0;

  return (
    <V2Layout>
      <>
        {/* ── WELCOME for new users ── */}
        {isNewUser && (
          <section className="mb-16 rounded-2xl border border-[#A8FF00]/15 bg-[#A8FF00]/5 p-10 text-center">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#A8FF00]">
              Vitej v FitAI
            </div>
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-white">
              Tvuj AI trener je pripraveny
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm text-white/50">
              Zacni prvnim treninkem. AI ti bude davat zpetnou vazbu v realnem case,
              sledovat tvuj pokrok a prizpusobovat plan tvym cilum.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/gym/start"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:scale-105"
              >
                Zacit trenink →
              </Link>
              <Link
                href="/micro-workout"
                className="inline-flex items-center gap-2 rounded-full border border-[#FF9F0A]/30 px-8 py-4 text-sm font-semibold text-[#FF9F0A] transition hover:bg-[#FF9F0A]/10"
              >
                5-min challenge →
              </Link>
              <Link
                href="/exercises"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-semibold text-white/60 transition hover:text-white"
              >
                Prohlizet cviky →
              </Link>
            </div>
          </section>
        )}

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

          {/* AI motivation */}
          {motivation && (
            <p className="mb-12 max-w-lg text-base italic text-white/40">
              &ldquo;{motivation}&rdquo;
            </p>
          )}

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
              {freezeStatus && !freezeStatus.usedToday && freezeStatus.remaining > 0 && (
                <button
                  onClick={() => setFreezeModal(true)}
                  className="mt-3 pointer-events-auto rounded-full border border-[#00E5FF]/30 px-3 py-1 text-[10px] font-semibold text-[#00E5FF] transition hover:bg-[#00E5FF]/10"
                  title="Zmrazit streak"
                >
                  Zmrazit
                </button>
              )}
            </div>
          </div>

          {/* Streak freeze modal */}
          {freezeModal && (
            <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center">
              <div className="rounded-2xl border border-[#00E5FF]/20 bg-black/95 p-8 text-center shadow-2xl backdrop-blur">
                <div className="mb-3 text-3xl">&#10052;</div>
                <div className="mb-2 text-sm font-semibold text-white">Zmrazit streak?</div>
                <p className="mb-4 text-xs text-white/50">
                  Mas {freezeStatus?.remaining ?? 0}/2 zmrazeni tento mesic.
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => setFreezeModal(false)}
                    className="rounded-full border border-white/15 px-5 py-2 text-xs text-white/50 transition hover:text-white"
                  >
                    Zrusit
                  </button>
                  <button onClick={handleFreeze} disabled={freezing}
                    className="rounded-full bg-[#00E5FF] px-5 py-2 text-xs font-semibold text-black transition hover:bg-[#00E5FF]/80 disabled:opacity-50"
                  >
                    {freezing ? '...' : 'Zmrazit dnes'}
                  </button>
                </div>
              </div>
            </div>
          )}

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

        {/* ── TODAY ACTION (smart widget) ── */}
        {todayAction && <TodayActionCard action={todayAction} />}

        {/* ── DAILY BRIEF (AI Coach flagship) ── */}
        {brief && <V2DailyBrief brief={brief} />}

        {/* ── STATS ── */}
        <section className="mb-32 grid grid-cols-3 gap-6 border-y border-white/10 py-16 text-center">
          <Stat value={stats?.totalSessions || 0} label="Cvičení" />
          <Stat value={Math.floor((stats?.totalMinutes || 0) / 60)} label="Hodin" />
          <Stat value={stats?.totalXP || 0} label="XP" />
        </section>

        {/* ── WEEKLY REVIEW (AI) ── */}
        {weekly && (
          <section className="mb-32">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              AI Týdenní review
            </div>
            <h2
              className="mb-6 max-w-3xl font-bold tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.04em', lineHeight: 1.1 }}
            >
              {weekly.summary}
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {weekly.highlights.length > 0 && (
                <div>
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A8FF00]">
                    ✓ Povedlo se
                  </div>
                  <ul className="space-y-2">
                    {weekly.highlights.map((h, i) => (
                      <li key={i} className="text-base text-white/75">{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              {weekly.improvements.length > 0 && (
                <div>
                  <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FF9F0A]">
                    → Zlepšit
                  </div>
                  <ul className="space-y-2">
                    {weekly.improvements.map((h, i) => (
                      <li key={i} className="text-base text-white/75">{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                Cíl příštího týdne
              </div>
              <p className="mt-2 text-lg text-white">{weekly.nextWeekFocus}</p>
            </div>
          </section>
        )}

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

        {/* ── MICRO WORKOUT ── */}
        {micro && micro.exercises.length > 0 && (
          <section className="mb-24">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#FF9F0A]">
              5-min challenge
            </div>
            <h2
              className="mb-6 font-bold tracking-tight text-white"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', letterSpacing: '-0.03em', lineHeight: 1.15 }}
            >
              Dnesni micro workout
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {micro.exercises.map((ex, i) => (
                <Link
                  key={ex.id}
                  href={`/exercises/${ex.id}`}
                  className="rounded-xl border border-white/8 p-4 transition hover:border-white/15 hover:bg-white/3"
                >
                  <div className="mb-1 text-lg font-bold tabular-nums text-white/20">{i + 1}</div>
                  <div className="text-sm font-semibold text-white">{ex.nameCs}</div>
                  <div className="mt-1 text-[10px] text-white/40">{ex.muscleGroups.join(' · ')}</div>
                  <div className="mt-2 text-[11px] text-white/50">{ex.targetSets}x{ex.targetReps} · {ex.restSeconds}s pauza</div>
                </Link>
              ))}
            </div>
            <Link
              href="/micro-workout"
              className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FF9F0A]/60 transition hover:text-[#FF9F0A]"
            >
              Jiny challenge →
            </Link>
          </section>
        )}

        {/* ── CTA ── */}
        <div className="mb-24 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/gym/start"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105 hover:bg-white/90"
          >
            Začít trénink
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/micro-workout"
            className="group inline-flex items-center gap-3 rounded-full border border-[#FF9F0A]/40 px-8 py-5 text-base font-semibold tracking-tight text-[#FF9F0A] transition hover:scale-105 hover:bg-[#FF9F0A]/10"
          >
            5-min Micro
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="text-center text-[9px] font-semibold uppercase tracking-[0.4em] text-white/20">
          FitAI
        </div>
      </>
    </V2Layout>
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
