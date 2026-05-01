'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getMicroWorkout, type MicroWorkoutData } from '@/lib/api';

export default function MicroWorkoutPage() {
  const [data, setData] = useState<MicroWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadChallenge() {
    setLoading(true);
    setError(null);
    getMicroWorkout()
      .then(setData)
      .catch((err) => setError(err?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { document.title = 'FitAI — Micro Workout'; }, []);
  useEffect(() => { loadChallenge(); }, []);

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; 5-min challenge</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Five minutes.<br />
            <em className="v3-clay" style={{ fontWeight: 300 }}>No excuses.</em>
          </h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 16, maxWidth: 560 }}>
            3 random exercises, 2 sets of 12, 30s rest. No plan, no thinking -- just start.
          </p>
        </section>

        {loading && (
          <div style={{ display: 'flex', height: 160, alignItems: 'center', justifyContent: 'center' }}>
            <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span>
          </div>
        )}

        {error && !loading && (
          <Card padding={24} style={{ textAlign: 'center' as const, marginBottom: 32 }}>
            <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 12 }}>{error}</p>
            <Button variant="ghost" onClick={loadChallenge}>Try again</Button>
          </Card>
        )}

        {data && !loading && !error && (
          <>
            <SectionHeader title="Today's challenge" />
            {data.exercises.length === 0 ? (
              <Card padding={32} style={{ textAlign: 'center' as const }}>
                <p className="v3-body" style={{ color: 'var(--text-3)' }}>No exercises available.</p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.exercises.map((ex, i) => (
                  <Link key={ex.id} href={`/exercises/${ex.id}`} style={{ textDecoration: 'none' }}>
                    <Card hover padding={20}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span className="v3-numeric" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-3)', width: 32, textAlign: 'center' as const }}>{i + 1}</span>
                          <div>
                            <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{ex.name || ex.nameCs}</span>
                            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                              {ex.muscleGroups.map((mg) => <Tag key={mg}>{mg}</Tag>)}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' as const }}>
                          <span className="v3-numeric" style={{ color: 'var(--text-1)', fontWeight: 600 }}>{ex.targetSets}x{ex.targetReps}</span>
                          <div className="v3-caption" style={{ color: 'var(--text-3)' }}>{ex.restSeconds}s rest</div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <div style={{ marginTop: 32 }}>
              <Button variant="ghost" icon={<FitIcon name="bolt" size={16} />} onClick={loadChallenge}>
                Different challenge
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
