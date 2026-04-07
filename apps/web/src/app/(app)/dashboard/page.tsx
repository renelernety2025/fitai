'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import {
  getVideos, getMyStats, getReminderStatus, getInsights, getOnboardingStatus,
  getLessonOfTheWeek,
  type VideoData, type StatsData, type ReminderData, type Insights, type Lesson,
} from '@/lib/api';

const recoveryColors: Record<string, string> = {
  fresh: 'border-green-500/30 bg-green-900/20 text-green-300',
  normal: 'border-blue-500/30 bg-blue-900/20 text-blue-300',
  fatigued: 'border-yellow-500/30 bg-yellow-900/20 text-yellow-300',
  overreached: 'border-red-500/30 bg-red-900/20 text-red-300',
};

const recoveryLabels: Record<string, string> = {
  fresh: '✨ Svěží',
  normal: '👍 Normální',
  fatigued: '⚠️ Unavený',
  overreached: '🔥 Přetrénovaný',
};

const categoryColors: Record<string, string> = {
  YOGA: 'bg-emerald-500',
  PILATES: 'bg-blue-500',
  STRENGTH: 'bg-orange-500',
  CARDIO: 'bg-red-500',
  MOBILITY: 'bg-purple-500',
};

const levelColors: Record<string, string> = {
  'Začátečník': 'bg-gray-600',
  'Pokročilý': 'bg-blue-600',
  'Expert': 'bg-green-600',
  'Mistr': 'bg-purple-600',
  'Legenda': 'bg-[#F59E0B]',
};

const DAY_NAMES = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    getOnboardingStatus().then((status) => {
      if (!status.completed) router.push('/onboarding');
    }).catch(() => {});

    getVideos().then((v) => setVideos(v.slice(0, 3))).catch(console.error);
    getMyStats().then(setStats).catch(console.error);
    getReminderStatus().then(setReminder).catch(console.error);
    getInsights().then(setInsights).catch(console.error);
    getLessonOfTheWeek().then(setLesson).catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-500">Načítání...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Reminder banner */}
        {reminder?.shouldRemind && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-6 py-4">
            <p className="text-sm text-[#F59E0B]">{reminder.message}</p>
            <Link
              href="/videos"
              className="rounded-lg bg-[#F59E0B] px-4 py-1.5 text-sm font-semibold text-black transition hover:bg-yellow-400"
            >
              Cvičit teď
            </Link>
          </div>
        )}

        {/* User greeting + level badge */}
        <div className="mb-8 flex items-center gap-3">
          <h2 className="text-3xl font-bold text-white">
            Vítej, {user?.name}!
          </h2>
          {stats && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${levelColors[stats.levelName] || 'bg-gray-600'}`}>
              {stats.levelName}
            </span>
          )}
        </div>

        {/* Stats cards */}
        {stats && (
          <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl bg-gray-900 p-5">
              <p className="text-2xl font-bold text-[#EA580C]">🔥 {stats.currentStreak}</p>
              <p className="text-xs text-gray-400">Série (dní)</p>
            </div>
            <div className="rounded-xl bg-gray-900 p-5">
              <p className="text-2xl font-bold text-[#F59E0B]">{stats.totalXP}</p>
              <p className="text-xs text-gray-400">XP celkem</p>
            </div>
            <div className="rounded-xl bg-gray-900 p-5">
              <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
              <p className="text-xs text-gray-400">Cvičení</p>
            </div>
            <div className="rounded-xl bg-gray-900 p-5">
              <p className="text-2xl font-bold text-white">{stats.totalMinutes}</p>
              <p className="text-xs text-gray-400">Minut celkem</p>
            </div>
          </div>
        )}

        {/* Lesson of the Week */}
        {lesson && (
          <Link href={`/lekce/${lesson.slug}`} className="mb-6 block rounded-xl border border-blue-500/30 bg-blue-900/20 p-5 transition hover:bg-blue-900/30">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-blue-400">📚 Lekce týdne</span>
              <span className="text-xs text-blue-300/70">{lesson.durationMin} min</span>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-white">{lesson.titleCs}</h3>
            <p className="text-sm text-blue-100/80 line-clamp-2">{lesson.bodyCs}</p>
          </Link>
        )}

        {/* AI Insights */}
        {insights && (insights.recovery || insights.plateaus.length > 0 || insights.weakPoints.weakMuscleGroups.length > 0) && (
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-white">🧠 AI Insights</h3>
            <div className="space-y-3">
              {/* Recovery status */}
              {insights.recovery && (
                <div className={`rounded-xl border p-4 ${recoveryColors[insights.recovery.overallStatus] || recoveryColors.normal}`}>
                  <p className="mb-1 text-sm font-semibold">{recoveryLabels[insights.recovery.overallStatus]}</p>
                  <p className="text-xs opacity-90">{insights.recovery.recommendation}</p>
                </div>
              )}

              {/* Plateaus */}
              {insights.plateaus.slice(0, 3).map((p) => (
                <div key={p.exerciseId} className="rounded-xl border border-orange-500/30 bg-orange-900/20 p-4">
                  <p className="mb-1 text-sm font-semibold text-orange-300">📊 Plateau: {p.exerciseName}</p>
                  <p className="text-xs text-orange-200/80">Stagnuje {p.weeksStagnant} týdnů na {p.currentMaxWeight}kg</p>
                  <p className="mt-1 text-xs text-orange-100">{p.recommendation}</p>
                </div>
              ))}

              {/* Weak points */}
              {insights.weakPoints.weakMuscleGroups.slice(0, 2).map((w) => (
                <div key={w.muscle} className="rounded-xl border border-purple-500/30 bg-purple-900/20 p-4">
                  <p className="mb-1 text-sm font-semibold text-purple-300">🎯 Slabé místo: {w.muscle}</p>
                  <p className="text-xs text-purple-200/80">{w.reason}</p>
                  {w.suggestedExercises.length > 0 && (
                    <p className="mt-1 text-xs text-purple-100">
                      Doporučené cviky: {w.suggestedExercises.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>
              ))}

              {/* Asymmetries */}
              {insights.weakPoints.asymmetries.slice(0, 2).map((a, i) => (
                <div key={i} className="rounded-xl border border-yellow-500/30 bg-yellow-900/20 p-4">
                  <p className="mb-1 text-sm font-semibold text-yellow-300">⚖️ Asymetrie: {a.joint}</p>
                  <p className="text-xs text-yellow-200/80">{a.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly activity chart */}
        {stats && stats.weeklyActivity.length > 0 && (
          <div className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-white">Tento týden</h3>
            <div className="flex items-end gap-2 rounded-xl bg-gray-900 p-6" style={{ height: 180 }}>
              {stats.weeklyActivity.map((day) => {
                const maxMin = Math.max(...stats.weeklyActivity.map((d) => d.minutes), 1);
                const height = day.minutes > 0 ? Math.max(20, (day.minutes / maxMin) * 100) : 8;
                const d = new Date(day.date + 'T00:00:00');
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex flex-col items-center justify-end" style={{ height: 100 }}>
                      {day.minutes > 0 && (
                        <span className="mb-1 text-xs text-gray-400">{day.minutes}m</span>
                      )}
                      <div
                        className={`w-full max-w-[40px] rounded-t ${day.minutes > 0 ? 'bg-[#16a34a]' : 'bg-gray-700'}`}
                        style={{ height: `${height}%`, minWidth: 24 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{DAY_NAMES[d.getDay()]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended videos */}
        <h3 className="mb-4 text-xl font-semibold text-white">Doporučená videa</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/videos/${video.id}`}
              className="group overflow-hidden rounded-xl bg-gray-900 transition hover:scale-[1.02] hover:brightness-110"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                  {Math.floor(video.durationSeconds / 60)} min
                </span>
              </div>
              <div className="p-4">
                <h4 className="mb-2 font-semibold text-white">{video.title}</h4>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${categoryColors[video.category] || 'bg-gray-600'}`}>
                    {video.category}
                  </span>
                  <span className="text-xs text-gray-400">{video.difficulty}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {videos.length > 0 && (
          <div className="mt-6">
            <Link href="/videos" className="text-sm text-[#16a34a] hover:underline">
              Zobrazit všechna videa →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
