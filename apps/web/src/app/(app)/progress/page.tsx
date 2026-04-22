'use client';

import { useEffect, useState } from 'react';
import {
  V2Layout,
  V2SectionLabel,
  V2Display,
  V2Stat,
} from '@/components/v2/V2Layout';
import Link from 'next/link';
import { getMyStats, getInsights, getMyGymSessions, getMyWeeklyVolume, downloadExport, type StatsData, type Insights, type GymSessionData, type WeeklyVolumeEntry } from '@/lib/api';
import ActivityHeatmap from '@/components/progress/ActivityHeatmap';
import VolumeChart from '@/components/progress/VolumeChart';

export default function ProgressV2Page() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [sessions, setSessions] = useState<GymSessionData[]>([]);
  const [volume, setVolume] = useState<WeeklyVolumeEntry[]>([]);

  useEffect(() => { document.title = 'FitAI — Pokrok'; }, []);

  useEffect(() => {
    getMyStats().then(setStats).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
    getMyGymSessions().then(setSessions).catch(console.error);
    getMyWeeklyVolume().then(setVolume).catch(console.error);
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

      {/* Empty state for new users */}
      {stats.totalSessions === 0 && (
        <section className="mb-32 rounded-2xl border border-white/8 p-12 text-center">
          <p className="mb-2 text-lg text-white/50">Zatim zadne treninky</p>
          <p className="mb-6 text-sm text-white/30">Zacni cvicit a uvidis svuj pokrok zde.</p>
          <Link
            href="/gym/start"
            className="inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:scale-105"
          >
            Zacit prvni trenink →
          </Link>
        </section>
      )}

      {/* Activity heatmap */}
      {sessions.length > 0 && (
        <section className="mb-32">
          <V2SectionLabel>Aktivita</V2SectionLabel>
          <ActivityHeatmap sessionDates={sessions.map((s) => s.startedAt)} />
        </section>
      )}

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

      {/* Weekly volume */}
      {volume.length > 0 && (
        <section className="mb-32">
          <V2SectionLabel>Tydenni objem (svalove skupiny)</V2SectionLabel>
          <VolumeChart data={volume} />
        </section>
      )}

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
      {/* Export button */}
      {sessions.length > 0 && (
        <section className="mb-16 flex justify-end">
          <button
            onClick={() => downloadExport('export/workouts?format=csv', `fitai-workouts-${new Date().toISOString().slice(0, 10)}.csv`).catch(console.error)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 transition hover:border-white/25 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportovat CSV
          </button>
        </section>
      )}

      {/* Workout history */}
      {sessions.length > 0 && (
        <section className="mb-32">
          <V2SectionLabel>Historie treninku</V2SectionLabel>
          <div className="space-y-1">
            {sessions.slice(0, 10).map((s) => {
              const date = new Date(s.startedAt);
              const mins = Math.round(s.durationSeconds / 60);
              const uniqueExercises = new Set(s.exerciseSets?.map((e) => e.exerciseId) ?? []);
              return (
                <Link
                  key={s.id}
                  href={`/gym/${s.id}`}
                  className="group flex items-center justify-between border-b border-white/8 py-5 transition hover:border-white/20"
                >
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                      <span className="ml-2 text-white/40">{date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-white/40">
                      {uniqueExercises.size} cviku · {s.totalReps} repu · {mins} min
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.averageFormScore > 0 && (
                      <span className={`text-sm font-bold tabular-nums ${s.averageFormScore >= 80 ? 'text-[#A8FF00]' : s.averageFormScore >= 60 ? 'text-[#FF9F0A]' : 'text-[#FF375F]'}`}>
                        {Math.round(s.averageFormScore)}%
                      </span>
                    )}
                    <span className="text-white/20 transition group-hover:text-white">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </V2Layout>
  );
}
