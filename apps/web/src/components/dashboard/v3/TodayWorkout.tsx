'use client';

import Link from 'next/link';
import { Card, Button, Tag } from '@/components/v3';
import type { DailyBrief } from '@/lib/api/coaching';

interface TodayWorkoutProps {
  brief: DailyBrief;
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function TodayWorkout({ brief }: TodayWorkoutProps) {
  const { workout, mood, recoveryStatus } = brief;
  const exerciseCount = workout.exercises.length;

  const moodLabel =
    mood === 'push' ? 'PUSH' : mood === 'maintain' ? 'MAINTAIN' : 'RECOVER';

  const focusMuscles = workout.exercises
    .slice(0, 3)
    .map((e) => e.nameCs || e.name)
    .join(', ');

  return (
    <Card
      padding={0}
      className="v3-today-workout"
      style={{
        position: 'relative', overflow: 'hidden', minHeight: 280,
      }}
    >
      {/* Gradient background */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,75,18,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative', padding: '36px 36px 32px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', height: '100%',
          minHeight: 280,
        }}
      >
        {/* Top tags */}
        <div>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 20,
            }}
          >
            <Tag color="var(--accent)">TODAY</Tag>
            <span className="v3-eyebrow">
              {moodLabel} &middot; {recoveryStatus.toUpperCase()}
            </span>
          </div>

          <div
            className="v3-display-3"
            style={{ marginBottom: 12, maxWidth: 500 }}
          >
            {workout.title}
          </div>

          <p
            className="v3-body"
            style={{ maxWidth: 440, color: 'var(--text-2)', margin: 0 }}
          >
            {workout.estimatedMinutes} min &middot; {exerciseCount} exercises
            {focusMuscles ? ` &middot; ${focusMuscles}` : ''}
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginTop: 28,
          }}
        >
          <Link href="/gym/start" style={{ textDecoration: 'none' }}>
            <Button variant="accent" size="lg" icon={<PlayIcon />}>
              Start training
            </Button>
          </Link>
          <Link href="/plans" style={{ textDecoration: 'none' }}>
            <Button variant="glass" size="lg">
              Preview
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
