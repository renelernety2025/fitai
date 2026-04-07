'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { getLessons, type Lesson } from '@/lib/api';

const CATEGORIES = [
  { value: 'all', label: 'Vše' },
  { value: 'technique', label: 'Technika' },
  { value: 'nutrition', label: 'Výživa' },
  { value: 'recovery', label: 'Regenerace' },
  { value: 'mindset', label: 'Mindset' },
];

const categoryColors: Record<string, string> = {
  technique: 'bg-blue-600', nutrition: 'bg-orange-600', recovery: 'bg-purple-600', mindset: 'bg-green-600',
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLessons(category === 'all' ? undefined : category)
      .then(setLessons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Lekce</h1>
        <p className="mb-6 text-gray-400">Krátké lekce o tréninku, výživě a regeneraci.</p>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                category === c.value ? 'bg-[#16a34a] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Načítání...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lekce/${lesson.slug}`}
                className="group rounded-xl bg-gray-900 p-5 transition hover:bg-gray-800"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${categoryColors[lesson.category] || 'bg-gray-600'}`}>
                    {lesson.category}
                  </span>
                  <span className="text-xs text-gray-500">{lesson.durationMin} min čtení</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-[#16a34a]">{lesson.titleCs}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{lesson.bodyCs}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
