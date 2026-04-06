'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVideo, type VideoData } from '@/lib/api';

const categoryColors: Record<string, string> = {
  YOGA: 'bg-emerald-500',
  PILATES: 'bg-blue-500',
  STRENGTH: 'bg-orange-500',
  CARDIO: 'bg-red-500',
  MOBILITY: 'bg-purple-500',
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m} min`;
}

export default function VideoDetailPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getVideo(params.id)
      .then(setVideo)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="animate-pulse text-gray-500">Načítání...</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] gap-4">
        <p className="text-red-400">{error || 'Video nenalezeno'}</p>
        <Link href="/videos" className="text-[#16a34a] hover:underline">Zpět na videa</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Link href="/videos" className="text-gray-400 hover:text-white">&larr; Zpět</Link>
          <span className="text-xl font-bold text-white">FitAI</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Hero thumbnail */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="aspect-video w-full object-cover"
          />
          {!video.hlsUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300">
                Video se zpracovává...
              </span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-medium text-white ${categoryColors[video.category] || 'bg-gray-600'}`}>
            {video.category}
          </span>
          <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
            {video.difficulty === 'BEGINNER' ? 'Začátečník' : video.difficulty === 'INTERMEDIATE' ? 'Pokročilý' : 'Expert'}
          </span>
          <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
            {formatDuration(video.durationSeconds)}
          </span>
        </div>

        <h1 className="mb-4 text-3xl font-bold text-white">{video.title}</h1>
        <p className="mb-8 text-lg leading-relaxed text-gray-400">{video.description}</p>

        <Link
          href={`/workout/${video.id}`}
          className="inline-block rounded-xl bg-[#16a34a] px-8 py-4 text-lg font-bold text-white transition hover:bg-green-700"
        >
          Začít cvičit
        </Link>
      </main>
    </div>
  );
}
