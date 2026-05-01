'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TRAINING_SEQUENCES, getCategoryColor, type TrainingSequence } from '@/lib/training-sequences';
import FollowAlongWorkout from '@/components/workout/follow-along-workout';

export default function WorkoutModePage() {
  const [active, setActive] = useState<TrainingSequence | null>(null);
  const [finished, setFinished] = useState(false);
  const [totalSec, setTotalSec] = useState(0);

  const workouts = TRAINING_SEQUENCES.filter((s) => s.workout && s.workout.length > 0);

  function handleFinish(sec: number) {
    setTotalSec(sec);
    setFinished(true);
    setActive(null);
  }

  // Active workout — full screen
  if (active?.workout) {
    return (
      <FollowAlongWorkout
        title={active.name || active.nameCs}
        steps={active.workout}
        onFinish={handleFinish}
      />
    );
  }

  return (
    <>
      <Link
        href="/sports"
        style={{
          display: 'inline-block', marginTop: 32,
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none', transition: 'color .2s',
        }}
      >
        &larr; Sports
      </Link>

      <section style={{ paddingTop: 32, paddingBottom: 48 }}>
        <p className="v3-eyebrow-serif">Follow-along</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Workout<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>Mode.</em>
        </h1>
        <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 16, maxWidth: 560 }}>
          Train alongside a 3D model. Timer tells you when to start, rest,
          and switch. Just follow along.
        </p>
      </section>

      {finished && (
        <div style={{
          marginBottom: 48, borderRadius: 'var(--r-lg, 16px)',
          border: '1px solid rgba(34,197,94,0.2)',
          background: 'rgba(34,197,94,0.05)',
          padding: 32, textAlign: 'center',
        }}>
          <p style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.3em', color: 'var(--sage)',
          }}>
            Workout complete!
          </p>
          <p style={{ marginTop: 8, fontSize: 30, fontWeight: 700, color: 'var(--text-1)' }}>
            {Math.floor(totalSec / 60)}:{(totalSec % 60).toString().padStart(2, '0')}
          </p>
        </div>
      )}

      <section style={{ marginBottom: 96 }}>
        <p className="v3-eyebrow">Choose a workout</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {workouts.map((seq) => (
            <button
              key={seq.id}
              onClick={() => { setFinished(false); setActive(seq); }}
              style={{
                borderRadius: 'var(--r-md, 12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 24, textAlign: 'left',
                background: 'transparent', cursor: 'pointer',
                transition: 'border-color .2s, background .2s',
                color: 'var(--text-1)',
              }}
            >
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.2em', color: getCategoryColor(seq.category),
                }}>
                  {seq.category} · {seq.durationMin} min
                </span>
                <span style={{
                  borderRadius: 'var(--r-pill)', background: 'rgba(255,255,255,0.1)',
                  padding: '4px 12px', fontSize: 10, fontWeight: 600,
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  START
                </span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{seq.name || seq.nameCs}</div>
              <p style={{ marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{seq.description}</p>
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {seq.workout!.map((s, i) => (
                  <span key={i} style={{
                    borderRadius: 4, background: 'rgba(255,255,255,0.08)',
                    padding: '2px 8px', fontSize: 9, color: 'rgba(255,255,255,0.4)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {s.name || s.nameCs} {s.durationSec}s
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
