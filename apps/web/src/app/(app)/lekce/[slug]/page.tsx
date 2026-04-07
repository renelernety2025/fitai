'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { getLesson, type Lesson } from '@/lib/api';

export default function LessonDetailPage({ params }: { params: { slug: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    getLesson(params.slug).then(setLesson).catch(console.error);
  }, [params.slug]);

  if (!lesson) {
    return <div className="min-h-screen bg-[#0a0a0a]"><Header /><p className="p-8 text-gray-500">Načítání...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/lekce" className="mb-4 inline-block text-sm text-gray-400 hover:text-white">&larr; Zpět na lekce</Link>

        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300">{lesson.category}</span>
          <span className="text-xs text-gray-500">{lesson.durationMin} min čtení</span>
        </div>

        <h1 className="mb-6 text-4xl font-bold text-white">{lesson.titleCs}</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-gray-300">{lesson.bodyCs}</p>
        </div>
      </main>
    </div>
  );
}
