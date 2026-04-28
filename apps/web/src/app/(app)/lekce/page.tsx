'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Chip, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getLessons, type Lesson } from '@/lib/api';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'technique', label: 'Technique' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'mindset', label: 'Mindset' },
];

const accent: Record<string, string> = {
  technique: '#00E5FF', nutrition: '#FF9F0A', recovery: '#BF5AF2', mindset: 'var(--sage, #34d399)',
};

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [cat, setCat] = useState('all');

  useEffect(() => { document.title = 'FitAI — Lekce'; }, []);
  useEffect(() => { getLessons(cat === 'all' ? undefined : cat).then(setLessons).catch(console.error); }, [cat]);

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Library</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Learn the<br />
            <em className="v3-clay" style={{ fontWeight: 300 }}>fundamentals.</em>
          </h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 16, maxWidth: 560 }}>
            Short, deep lessons on training, nutrition, recovery, and mindset. Not news. Principles.
          </p>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 32 }}>
          {CATEGORIES.map((c) => (
            <Chip key={c.value} active={cat === c.value} onClick={() => setCat(c.value)}>{c.label}</Chip>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {lessons.map((lesson) => (
            <Link key={lesson.id} href={`/lekce/${lesson.slug}`} style={{ textDecoration: 'none' }}>
              <Card hover padding="20px">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <Tag color={accent[lesson.category]}>{lesson.category}</Tag>
                      <Tag>{lesson.durationMin} min</Tag>
                    </div>
                    <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 16 }}>{lesson.titleCs}</div>
                    <p className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{lesson.bodyCs}</p>
                  </div>
                  <FitIcon name="arrow" size={18} color="var(--text-3)" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
