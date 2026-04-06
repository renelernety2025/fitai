'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import {
  getVideos, getMyStats, getReminderStatus,
  type VideoData, type StatsData, type ReminderData,
} from '@/lib/api';

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
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [reminder, setReminder] = useState<ReminderData | null>(null);

  useEffect(() => {
    getVideos().then((v) => setVideos(v.slice(0, 3))).catch(console.error);
    getMyStats().then(setStats).catch(console.error);
    getReminderStatus().then(setReminder).catch(console.error);
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
