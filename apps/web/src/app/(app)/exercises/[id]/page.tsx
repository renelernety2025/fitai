'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Card, SectionHeader, Tag, Button } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getExercise, getExercises, getExercisePersonalBest, type ExerciseData, type PersonalBest } from '@/lib/api';
import ExerciseModelPlaceholder from '@/components/exercise/exercise-model-placeholder';
import { ExerciseModelError } from '@/components/exercise/exercise-model-error';

const ExerciseModelViewer = dynamic(
  () => import('@/components/exercise/exercise-model-viewer'),
  { ssr: false, loading: () => <ExerciseModelPlaceholder /> },
);

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  const [ex, setEx] = useState<ExerciseData | null>(null);
  const [related, setRelated] = useState<ExerciseData[]>([]);
  const [pr, setPr] = useState<PersonalBest | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<number | undefined>();

  useEffect(() => {
    setSelectedPhase(undefined);
    setEx(null);
    setRelated([]);
    setPr(null);
    getExercise(params.id).then((data) => {
      setEx(data);
      if (data.muscleGroups[0]) {
        getExercises({ muscleGroup: data.muscleGroups[0] })
          .then((all) => setRelated(all.filter((e) => e.id !== data.id).slice(0, 4)))
          .catch(console.error);
      }
    }).catch(console.error);
    getExercisePersonalBest(params.id).then(setPr).catch(console.error);
  }, [params.id]);

  if (!ex) {
    return (
      <>
        <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1.5s infinite' }} />
        </div>
      </>
    );
  }

  const inst = (ex as any).instructions || {};

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <Link href="/exercises" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 32, color: 'var(--text-3)', fontSize: 12, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
          <FitIcon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} /> Cviky
        </Link>

        <section style={{ padding: '32px 0' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 12 }}>
            {ex.muscleGroups.map((g) => <Tag key={g} color="var(--accent)">{g}</Tag>)}
          </div>
          <h1 className="v3-display-2">{ex.nameCs}</h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 12, maxWidth: 640 }}>{ex.descriptionCs}</p>
          {pr?.hasPR && (
            <Card style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 16 }} padding={16}>
              <Tag color="#FF9F0A">PR</Tag>
              {pr.bestWeight && <span className="v3-numeric" style={{ color: 'var(--text-1)', fontWeight: 700 }}>{pr.bestWeight}kg</span>}
              <span className="v3-numeric" style={{ color: 'var(--text-3)' }}>x{pr.bestReps}</span>
              {pr.avgFormScore && (
                <span className="v3-numeric" style={{ color: pr.avgFormScore >= 80 ? 'var(--sage, #34d399)' : '#FF9F0A', fontWeight: 700 }}>{pr.avgFormScore}%</span>
              )}
            </Card>
          )}
        </section>

        {ex.phases.length > 0 && (
          <ExerciseModelError>
            <ExerciseModelViewer phases={ex.phases} muscleGroups={ex.muscleGroups} exerciseName={ex.name} externalPhaseIndex={selectedPhase} />
          </ExerciseModelError>
        )}

        {inst.targetMuscles && (
          <section style={{ marginBottom: 48 }}>
            <SectionHeader title="Target muscles" />
            <Card padding={20}>
              <p className="v3-body" style={{ color: 'var(--text-1)' }}>
                <span style={{ color: 'var(--accent)' }}>Primary:</span> {inst.targetMuscles.primary?.join(', ')}
              </p>
              {inst.targetMuscles.secondary && (
                <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 6 }}>
                  <span style={{ color: 'var(--text-3)' }}>Secondary:</span> {inst.targetMuscles.secondary.join(', ')}
                </p>
              )}
            </Card>
          </section>
        )}

        {inst.steps && (
          <section style={{ marginBottom: 48 }}>
            <SectionHeader title="How to" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {inst.steps.map((step: string, i: number) => (
                <Card key={i} padding={16}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span className="v3-numeric" style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: 14, flexShrink: 0, width: 24, textAlign: 'center' as const }}>{i + 1}</span>
                    <p className="v3-body" style={{ color: 'var(--text-2)' }}>{step}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {(inst.breathing || inst.tempo) && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 48 }}>
            {inst.breathing && (<Card padding={20}><SectionHeader title="Breathing" /><p className="v3-body" style={{ color: 'var(--text-2)' }}>{inst.breathing}</p></Card>)}
            {inst.tempo && (<Card padding={20}><SectionHeader title="Tempo" /><p className="v3-body" style={{ color: 'var(--text-2)' }}>{inst.tempo}</p></Card>)}
          </section>
        )}

        {inst.commonMistakes && (
          <section style={{ marginBottom: 48 }}>
            <SectionHeader title="Common mistakes" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inst.commonMistakes.map((m: string, i: number) => (
                <Card key={i} padding={14}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><FitIcon name="x" size={14} color="var(--danger, #ef4444)" /><span className="v3-body" style={{ color: 'var(--text-2)' }}>{m}</span></div></Card>
              ))}
            </div>
          </section>
        )}

        {inst.tips && (
          <section style={{ marginBottom: 48 }}>
            <SectionHeader title="Tips" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inst.tips.map((tip: string, i: number) => (
                <Card key={i} padding={14}><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><FitIcon name="arrow" size={14} color="var(--accent)" /><span className="v3-body" style={{ color: 'var(--text-2)' }}>{tip}</span></div></Card>
              ))}
            </div>
          </section>
        )}

        {inst.warmup && (
          <section style={{ marginBottom: 48 }}>
            <SectionHeader title="Warmup" />
            <Card padding={20}><p className="v3-body" style={{ color: 'var(--text-2)' }}>{inst.warmup}</p></Card>
          </section>
        )}

        <section style={{ marginBottom: 48 }}>
          <SectionHeader title="Movement phases" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ex.phases.map((phase: any, i: number) => (
              <Card key={i} hover padding={16} onClick={() => { setSelectedPhase(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ border: selectedPhase === i ? '1px solid var(--accent)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="v3-numeric" style={{ color: 'var(--text-3)' }}>{i + 1}.</span>
                  <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{phase.nameCs}</span>
                  <Tag>{phase.phase}</Tag>
                </div>
                <p className="v3-caption" style={{ color: 'var(--sage, #34d399)', marginTop: 6, marginLeft: 28 }}>{phase.feedback_correct}</p>
                <p className="v3-caption" style={{ color: 'var(--danger, #ef4444)', marginTop: 2, marginLeft: 28 }}>{phase.feedback_wrong}</p>
              </Card>
            ))}
          </div>
        </section>

        <section style={{ textAlign: 'center' as const, marginBottom: 48 }}>
          <Link href="/gym/start"><Button variant="accent" size="lg">Trenuj {ex.nameCs}</Button></Link>
        </section>

        {related.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <SectionHeader title="Related exercises" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {related.map((r) => (
                <Link key={r.id} href={`/exercises/${r.id}`} style={{ textDecoration: 'none' }}>
                  <Card hover padding={16}>
                    <div className="v3-body" style={{ color: 'var(--text-1)', fontWeight: 600 }}>{r.nameCs}</div>
                    <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>{r.muscleGroups.join(' / ')} / {r.difficulty}</div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
