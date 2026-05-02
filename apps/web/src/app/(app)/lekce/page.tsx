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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => { document.title = 'FitAI — Lessons'; }, []);
  useEffect(() => {
    setLoading(true);
    setError(false);
    getLessons(cat === 'all' ? undefined : cat)
      .then(setLessons)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [cat, retryKey]);

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

        {loading && (
          <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center' }}>
            <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading lessons...</span>
          </div>
        )}

        {error && !loading && (
          <Card padding={32} style={{ textAlign: 'center' }}>
            <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 12 }}>Failed to load lessons.</p>
            <button onClick={() => setRetryKey((k) => k + 1)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Try again</button>
          </Card>
        )}

        {!loading && !error && lessons.length === 0 && (
          <Card padding={48} style={{ textAlign: 'center' }}>
            <p className="v3-body" style={{ color: 'var(--text-3)' }}>No lessons in this category.</p>
          </Card>
        )}

        {!loading && !error && (
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
                      <p className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{lesson.bodyCs}</p>
                    </div>
                    <FitIcon name="arrow" size={18} color="var(--text-3)" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
