'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getVideos, type VideoData } from '@/lib/api';

const CATS = [
  { v: 'ALL', l: 'Vše' },
  { v: 'YOGA', l: 'Yoga' },
  { v: 'PILATES', l: 'Pilates' },
  { v: 'STRENGTH', l: 'Strength' },
  { v: 'CARDIO', l: 'Cardio' },
  { v: 'MOBILITY', l: 'Mobilita' },
];

const catAccent: Record<string, string> = {
  YOGA: '#A8FF00',
  PILATES: '#00E5FF',
  STRENGTH: '#FF9500',
  CARDIO: '#FF375F',
  MOBILITY: '#BF5AF2',
};

export default function VideosV2Page() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [cat, setCat] = useState('ALL');

  useEffect(() => {
    const f: any = {};
    if (cat !== 'ALL') f.category = cat;
    getVideos(f).then(setVideos).catch(console.error);
  }, [cat]);

  return (
    <V2Layout>
      <section className="pt-12 pb-12">
        <V2SectionLabel>Knihovna</V2SectionLabel>
        <V2Display size="xl">Videa.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Yoga, Pilates, strength, cardio, mobilita. S real-time pose detection.
        </p>
      </section>

      <div className="mb-16 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button
            key={c.v}
            onClick={() => setCat(c.v)}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              cat === c.v
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            {c.l}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {videos.map((v) => (
          <Link
            key={v.id}
            href={`/videos/${v.id}`}
            className="group block"
          >
            <div className="relative mb-4 overflow-hidden rounded-3xl">
              <img
                src={v.thumbnailUrl}
                alt={v.title}
                className="aspect-video w-full object-cover transition group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
                {Math.floor(v.durationSeconds / 60)} min
              </span>
            </div>
            <div
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em]"
              style={{ color: catAccent[v.category] || '#FFF' }}
            >
              {v.category} · {v.difficulty}
            </div>
            <V2Display size="sm">{v.title}</V2Display>
          </Link>
        ))}
      </section>
    </V2Layout>
  );
}
