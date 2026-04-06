'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { getMyStats, getMySessions, type StatsData, type SessionData } from '@/lib/api';

const levelColors: Record<string, string> = {
  'Začátečník': 'bg-gray-600',
  'Pokročilý': 'bg-blue-600',
  'Expert': 'bg-green-600',
  'Mistr': 'bg-purple-600',
  'Legenda': 'bg-[#F59E0B]',
};

const DAY_NAMES = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

export default function ProgressPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyStats(), getMySessions()])
      .then(([s, sess]) => {
        setStats(s);
        setSessions(sess.slice(0, 10));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Build 30-day streak calendar
  const streakDays = new Set<string>();
  sessions.forEach((s) => {
    if (s.completedAt) {
      streakDays.add(new Date(s.startedAt).toISOString().slice(0, 10));
    }
  });

  const last30: { date: string; active: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    last30.push({ date: ds, active: streakDays.has(ds) });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Načítání...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">Progres</h1>
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

        {/* Streak calendar */}
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-white">Posledních 30 dní</h2>
          <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-15">
            {last30.map((d) => (
              <div
                key={d.date}
                title={d.date}
                className={`aspect-square rounded-sm ${d.active ? 'bg-[#16a34a]' : 'bg-gray-800'}`}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-gray-800" /> Necvičil
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-[#16a34a]" /> Cvičil
            </span>
          </div>
        </div>

        {/* Weekly chart */}
        {stats && stats.weeklyActivity.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-semibold text-white">Tento týden</h2>
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

        {/* Sessions table */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Poslední cvičení</h2>
          {sessions.length === 0 ? (
            <p className="text-gray-500">Zatím žádná cvičení. Začni ještě dnes!</p>
          ) : (
            <div className="overflow-x-auto rounded-xl bg-gray-900">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400">
                    <th className="px-4 py-3 font-medium">Datum</th>
                    <th className="px-4 py-3 font-medium">Video</th>
                    <th className="px-4 py-3 font-medium">Délka</th>
                    <th className="px-4 py-3 font-medium">Přesnost</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-gray-800/50">
                      <td className="px-4 py-3 text-gray-300">
                        {new Date(s.startedAt).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {s.video?.title || 'Neznámé'}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {Math.floor(s.durationSeconds / 60)} min
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${s.accuracyScore >= 70 ? 'text-[#16a34a]' : 'text-red-400'}`}>
                          {Math.round(s.accuracyScore)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
