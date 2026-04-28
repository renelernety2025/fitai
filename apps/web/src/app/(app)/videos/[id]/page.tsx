'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getVideo, type VideoData } from '@/lib/api';

const catAccent: Record<string, string> = {
  YOGA: '#A8FF00',
  PILATES: '#00E5FF',
  STRENGTH: '#FF9500',
  CARDIO: '#FF375F',
  MOBILITY: '#BF5AF2',
};

export default function VideoV2DetailPage({ params }: { params: { id: string } }) {
  const [video, setVideo] = useState<VideoData | null>(null);

  useEffect(() => {
    getVideo(params.id).then(setVideo).catch(console.error);
  }, [params.id]);

  if (!video) {
    return (
      <>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </>
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
        <V2Display size="xl">{video.title}</V2Display>
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
