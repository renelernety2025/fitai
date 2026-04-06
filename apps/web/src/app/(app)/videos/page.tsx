'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVideos, type VideoData } from '@/lib/api';
import { Header } from '@/components/layout/Header';

const CATEGORIES = ['ALL', 'YOGA', 'PILATES', 'STRENGTH', 'CARDIO', 'MOBILITY'] as const;
const DIFFICULTIES = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;

const categoryColors: Record<string, string> = {
  YOGA: 'bg-emerald-500',
  PILATES: 'bg-blue-500',
  STRENGTH: 'bg-orange-500',
  CARDIO: 'bg-red-500',
  MOBILITY: 'bg-purple-500',
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('ALL');
  const [difficulty, setDifficulty] = useState<string>('ALL');

  useEffect(() => {
    setLoading(true);
    const filters: any = {};
    if (category !== 'ALL') filters.category = category;
    if (difficulty !== 'ALL') filters.difficulty = difficulty;
    getVideos(filters)
      .then(setVideos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, difficulty]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold text-white">Videa</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  category === c
                    ? 'bg-[#16a34a] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {c === 'ALL' ? 'Vše' : c.charAt(0) + c.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'Všechny úrovně' : d === 'BEGINNER' ? 'Začátečník' : d === 'INTERMEDIATE' ? 'Pokročilý' : 'Expert'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-800">
                <div className="aspect-video rounded-t-xl bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 rounded bg-gray-700" />
                  <div className="h-4 w-1/2 rounded bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video grid */}
        {!loading && (
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
                    {formatDuration(video.durationSeconds)}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-white">{video.title}</h3>
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
        )}

        {!loading && videos.length === 0 && (
          <p className="text-center text-gray-500">Žádná videa v této kategorii.</p>
        )}
      </main>
    </div>
  );
}
