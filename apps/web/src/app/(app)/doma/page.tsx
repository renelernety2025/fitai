'use client';

import { useEffect, useState } from 'react';
import { Card, Chip, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getQuickWorkout, getHomeWorkout, getTravelWorkout, type HomeWorkoutData } from '@/lib/api';

type Mode = 'quick' | 'home' | 'travel';

const MODES: { value: Mode; label: string; minutes: string; desc: string; icon: string }[] = [
  { value: 'quick', label: 'Quick', minutes: '15 min', desc: 'Full body, no gear', icon: 'flame' },
  { value: 'home', label: 'Home', minutes: '35 min', desc: 'Complete workout', icon: 'home' },
  { value: 'travel', label: 'Travel', minutes: '20 min', desc: 'Hotel, vacation', icon: 'run' },
];

export default function DomaPage() {
  const [mode, setMode] = useState<Mode>('quick');
  const [workout, setWorkout] = useState<HomeWorkoutData | null>(null);

  useEffect(() => {
    const fn = mode === 'quick' ? getQuickWorkout : mode === 'home' ? getHomeWorkout : getTravelWorkout;
    fn().then(setWorkout).catch(console.error);
  }, [mode]);

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; No equipment</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Train anywhere,<br />
            <em className="v3-clay" style={{ fontWeight: 300 }}>anytime.</em>
          </h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 16 }}>
            Three modes for three situations. Never an excuse.
          </p>
        </section>

        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' as const }}>
          {MODES.map((m) => (
            <Chip key={m.value} active={mode === m.value} onClick={() => setMode(m.value)}
              icon={<FitIcon name={m.icon} size={14} />}>
              {m.label} ({m.minutes})
            </Chip>
          ))}
        </div>

        {workout && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
              <span className="v3-display-3">{workout.title}</span>
              <Tag>{workout.rounds} rounds / {workout.rest}</Tag>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {workout.exercises.map((ex, i) => (
                <Card key={ex.id} padding="16px 20px">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span className="v3-numeric" style={{ color: 'var(--text-3)', fontWeight: 600, width: 24 }}>
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <span className="v3-body" style={{ color: 'var(--text-1)', fontWeight: 600 }}>{ex.name || ex.nameCs}</span>
                        <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 2 }}>
                          {ex.muscleGroups.slice(0, 3).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' as const }}>
                      <span className="v3-numeric" style={{ fontWeight: 700, color: 'var(--text-1)' }}>{ex.reps}</span>
                      {ex.duration && <div className="v3-caption" style={{ color: 'var(--text-3)' }}>{ex.duration}s</div>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
