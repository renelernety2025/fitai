'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getLesson, type Lesson } from '@/lib/api';

const accent: Record<string, string> = {
  technique: '#00E5FF',
  nutrition: '#FF9500',
  recovery: '#BF5AF2',
  mindset: '#A8FF00',
};

export default function LessonV2DetailPage({ params }: { params: { slug: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    getLesson(params.slug).then(setLesson).catch(console.error);
  }, [params.slug]);

  if (!lesson) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  const color = accent[lesson.category] || '#FFF';

  return (
    <V2Layout>
      <Link
        href="/lekce"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Lekce
      </Link>

      <article className="mx-auto max-w-2xl pt-12 pb-32">
        <div
          className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color }}
        >
          {lesson.category} · {lesson.durationMin} min čtení
        </div>
        <h1
          className="mb-12 font-bold tracking-tight text-white"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
          }}
        >
          {lesson.titleCs}
        </h1>

        <div
          className="text-lg leading-relaxed text-white/75"
          style={{ fontSize: '1.125rem', lineHeight: 1.8 }}
        >
          {lesson.bodyCs.split('\n').map((p, i) => (
            <p key={i} className="mb-6">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <Link
            href="/lekce"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            ← Více lekcí
          </Link>
        </div>
      </article>
    </V2Layout>
  );
}
