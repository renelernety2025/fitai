'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const SPORTS = [
  {
    href: '/shadow-boxing',
    title: 'Shadow Boxing',
    subtitle: 'Combos, strikes, defense',
    description: 'AI training program for boxing and MMA. Strike combinations, defense, cardio.',
    accent: 'var(--accent)',
    icon: 'punch',
  },
  {
    href: '/golf-lab',
    title: 'Golf Swing Lab',
    subtitle: 'Drive, Chip, Putt',
    description: 'Visualize and analyze your golf swing. Practice technique without a course.',
    accent: 'var(--sage)',
    icon: 'golf',
  },
  {
    href: '/micro-workout',
    title: 'Micro Workout',
    subtitle: '5 minutes, 3 exercises',
    description: 'Quick daily challenge. No excuses, no thinking.',
    accent: '#FF9F0A',
    icon: 'timer',
  },
  {
    href: '/soccer-drills',
    title: 'Soccer Drills',
    subtitle: 'Headers, passes, keeper',
    description: 'Football skills — dribbling, headers, goalkeeper training.',
    accent: '#30D5C8',
    icon: 'soccer',
  },
  {
    href: '/workout-mode',
    title: 'Workout Mode',
    subtitle: 'Follow-along · Timer',
    description: 'Train alongside a 3D model. Timer, rest, beep signals. Just follow along.',
    accent: 'var(--sage)',
    icon: 'timer',
  },
  {
    href: '/sequences',
    title: 'Sequences',
    subtitle: 'Choreography · Player',
    description: 'Browse animation sequences — boxing round, HIIT, golf. No timer.',
    accent: 'var(--clay-deep)',
    icon: 'sequence',
  },
  {
    href: '/gym/start',
    title: 'Gym Workout',
    subtitle: 'Plan + AI Coach',
    description: 'Classic gym training with your AI personal trainer. Form, reps, progress.',
    accent: 'var(--sage)',
    icon: 'gym',
  },
];

export default function SportsHubPage() {
  useEffect(() => { document.title = 'FitAI — Sports'; }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
      <section style={{ padding: '48px 0 32px' }}>
        <p className="v3-eyebrow-serif">Train anything</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Every<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>sport.</em>
        </h1>
        <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 16, maxWidth: 560 }}>
          Fitness, combat sports, golf — all in one place with 3D visualization and AI coaching.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {SPORTS.map((sport) => (
          <Link
            key={sport.href}
            href={sport.href}
            style={{
              textDecoration: 'none', position: 'relative', overflow: 'hidden',
              borderRadius: 'var(--r-lg, 16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.02)',
              padding: 32, display: 'block',
              transition: 'border-color .2s, background .2s',
            }}
          >
            <div style={{
              position: 'absolute', right: -32, top: -32, width: 112, height: 112,
              borderRadius: '50%', opacity: 0.2, filter: 'blur(48px)',
              background: sport.accent,
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{
                marginBottom: 8, fontSize: 10, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.25em',
                color: sport.accent,
              }}>
                {sport.subtitle}
              </div>
              <h2 className="v3-title" style={{ color: 'var(--text-1)' }}>{sport.title}</h2>
              <p style={{
                marginTop: 12, maxWidth: 380, fontSize: 14,
                lineHeight: 1.6, color: 'rgba(255,255,255,0.5)',
              }}>
                {sport.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
