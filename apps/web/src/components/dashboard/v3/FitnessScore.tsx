'use client';

import { useEffect, useState } from 'react';
import { Card, Ring, SectionHeader } from '@/components/v3';
import { getFitnessScore, type FitnessScoreData } from '@/lib/api/progress';

const DIMS: { key: keyof FitnessScoreData['breakdown']; label: string }[] = [
  { key: 'consistency', label: 'Konzistence' },
  { key: 'strength', label: 'Sila' },
  { key: 'cardio', label: 'Kardio' },
  { key: 'nutrition', label: 'Vyziva' },
  { key: 'recovery', label: 'Regenerace' },
];

function scoreColor(v: number): string {
  if (v <= 40) return 'var(--danger, #ef4444)';
  if (v <= 70) return 'var(--warning, #f59e0b)';
  return 'var(--sage, #22c55e)';
}

const TREND_ICON: Record<string, string> = {
  improving: '\u2191',
  stable: '\u2192',
  declining: '\u2193',
};

export default function FitnessScore() {
  const [data, setData] = useState<FitnessScoreData | null>(null);

  useEffect(() => {
    getFitnessScore().then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  const color = scoreColor(data.score);

  return (
    <section style={{ marginBottom: 32 }}>
      <SectionHeader eyebrow="FITNESS SCORE" title="Tvoje celkove skore." />
      <Card padding={28}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Ring value={data.score} size={96} stroke={6} color={color} label={String(data.score)} sub="/ 100" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20, color }}>{TREND_ICON[data.trend] || ''}</span>
              <span className="v3-body" style={{ color: 'var(--text-2)' }}>
                {data.trend === 'improving' ? 'Zlepsujes se' : data.trend === 'declining' ? 'Klesajici' : 'Stabilni'}
              </span>
              {data.previousScore !== null && (
                <span className="v3-caption" style={{ color: 'var(--text-3)' }}>
                  (predchozi {data.previousScore})
                </span>
              )}
            </div>
            <span className="v3-caption" style={{
              background: 'var(--bg-2)', padding: '4px 10px',
              borderRadius: 12, color: 'var(--text-2)', fontSize: 11,
            }}>
              Top {data.percentile}% uzivatelu
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 24 }}>
          {DIMS.map(({ key, label }) => {
            const val = data.breakdown[key];
            const pct = (val / 20) * 100;
            return (
              <div key={key} style={{ textAlign: 'center' }}>
                <div className="v3-caption" style={{ color: 'var(--text-3)', marginBottom: 6, fontSize: 10 }}>
                  {label}
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-3)', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: scoreColor(val * 5), transition: 'width .6s ease' }} />
                </div>
                <div className="v3-caption" style={{ color: 'var(--text-2)', marginTop: 4, fontSize: 11 }}>
                  {val}/20
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
