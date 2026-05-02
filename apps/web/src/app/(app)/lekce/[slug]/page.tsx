'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/v3';
import { getLesson, type Lesson } from '@/lib/api';

const accent: Record<string, string> = {
  technique: '#00E5FF',
  nutrition: '#FF9500',
  recovery: '#BF5AF2',
  mindset: '#A8FF00',
};

export default function LessonDetailPage({ params }: { params: { slug: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setLesson(null);
    getLesson(params.slug)
      .then(setLesson)
      .catch(() => setError(true));
  }, [params.slug]);

  if (error) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '120px 16px', textAlign: 'center' }}>
        <p className="v3-display-3" style={{ marginBottom: 12 }}>Lesson not found</p>
        <p className="v3-body" style={{ color: 'var(--text-3)', marginBottom: 24 }}>
          This lesson may have been removed or the link is incorrect.
        </p>
        <Link href="/lekce" style={{ textDecoration: 'none' }}>
          <Button variant="ghost">Back to lessons</Button>
        </Link>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span>
      </div>
    );
  }

  const color = accent[lesson.category] || '#FFF';
  const title = lesson.titleCs;
  const body = lesson.bodyCs;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 128px' }}>
      <Link
        href="/lekce"
        style={{
          display: 'inline-block', marginTop: 32,
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
        }}
      >
        &larr; Lessons
      </Link>

      <article style={{ paddingTop: 48 }}>
        <div style={{
          marginBottom: 24, fontSize: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.3em', color,
        }}>
          {lesson.category} &middot; {lesson.durationMin} min read
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 700, letterSpacing: '-0.04em',
          lineHeight: 0.95, color: 'var(--text-1)',
          marginBottom: 48,
        }}>
          {title}
        </h1>

        <div style={{ fontSize: '1.125rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.75)' }}>
          {body.split('\n').map((p, i) => (
            <p key={i} style={{ marginBottom: 24 }}>{p}</p>
          ))}
        </div>

        <div style={{
          marginTop: 64, borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 32,
        }}>
          <Link
            href="/lekce"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 14, fontWeight: 600, color: 'var(--text-1)',
              textDecoration: 'none',
            }}
          >
            &larr; More lessons
          </Link>
        </div>
      </article>
    </div>
  );
}
