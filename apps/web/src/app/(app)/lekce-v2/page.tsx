'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getLessons, type Lesson } from '@/lib/api';

const CATEGORIES = [
  { value: 'all', label: 'Vše' },
  { value: 'technique', label: 'Technika' },
  { value: 'nutrition', label: 'Výživa' },
  { value: 'recovery', label: 'Regenerace' },
  { value: 'mindset', label: 'Mindset' },
];

const accent: Record<string, string> = {
  technique: '#00E5FF',
  nutrition: '#FF9500',
  recovery: '#BF5AF2',
  mindset: '#A8FF00',
};

export default function LessonsV2Page() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [cat, setCat] = useState('all');

  useEffect(() => {
    getLessons(cat === 'all' ? undefined : cat).then(setLessons).catch(console.error);
  }, [cat]);

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Knihovna</V2SectionLabel>
        <V2Display size="xl">Lekce.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Krátké, hluboké lekce o tréninku, výživě, regeneraci a mentalitě. Ne novinky. Principy.
        </p>
      </section>

      {/* Category filter */}
      <div className="mb-16 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCat(c.value)}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              cat === c.value
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Lessons list — magazine style */}
      <section className="space-y-1">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lekce/${lesson.slug}`}
            className="group flex items-baseline justify-between border-b border-white/8 py-8 transition hover:border-white/30"
          >
            <div className="flex-1 pr-6">
              <div
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: accent[lesson.category] || '#FFF' }}
              >
                {lesson.category} · {lesson.durationMin} min
              </div>
              <V2Display size="md">{lesson.titleCs}</V2Display>
              <p className="mt-3 max-w-xl text-sm text-white/50 line-clamp-2">{lesson.bodyCs}</p>
            </div>
            <div className="text-2xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white">
              →
            </div>
          </Link>
        ))}
      </section>
    </V2Layout>
  );
}
