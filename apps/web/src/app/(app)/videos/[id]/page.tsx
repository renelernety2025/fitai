'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getVideo, type VideoData } from '@/lib/api';

const catAccent: Record<string, string> = {
  YOGA: 'var(--sage)',
  PILATES: 'var(--sage)',
  STRENGTH: '#FF9500',
  CARDIO: 'var(--accent)',
  MOBILITY: 'var(--clay-deep)',
};

export default function VideoV2DetailPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getVideo(params.id).then(setVideo).catch(() => setError(true));
  }, [params.id]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '60vh', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p className="v3-display-3">Video not found</p>
        <Link href="/videos" style={{ color: 'var(--accent)', fontSize: 14, textDecoration: 'none' }}>Back to videos</Link>
      </div>
    );
  }

  if (!video) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/videos"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Videa
      </Link>

      <section className="pt-8 pb-12">
        <div className="relative mb-12 overflow-hidden rounded-3xl">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="aspect-video w-full object-cover"
          />
          {!video.hlsUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
                Video se zpracovává…
              </span>
            </div>
          )}
        </div>

        <div
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: catAccent[video.category] || '#FFF' }}
        >
          {video.category} · {video.difficulty} · {Math.floor(video.durationSeconds / 60)} min
        </div>
        <h1 className="v3-display-2">{video.title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55">
          {video.description}
        </p>

        <div className="mt-12">
          <Link
            href={`/workout/${video.id}`}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105"
          >
            Začít cvičit
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
