'use client';

import { useMemo } from 'react';
import { Card } from '@/components/v3';

const WEEKS = 52;
const DAYS_PER_WEEK = 7;
const MONTHS = ['OCT 2025', 'JAN', 'APR', 'JUL', 'OCT 2026'];

function generateHeatmap(): number[] {
  const seed = 42;
  const data: number[] = [];
  for (let i = 0; i < WEEKS * DAYS_PER_WEEK; i++) {
    const v = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
    data.push(v < 0.18 ? 0 : Math.floor(v * 5) + 1);
  }
  return data;
}

export function Heatmap() {
  const data = useMemo(generateHeatmap, []);

  return (
    <Card padding={24}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 6 }}>CONSISTENCY</div>
          <div className="v3-title">52-week training heatmap</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
          <span>LESS</span>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `var(--d-${i})` }} />
          ))}
          <span>MORE</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${WEEKS}, 1fr)`, gap: 2 }}>
        {data.map((v, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            background: v === 0 ? 'var(--bg-2)' : `var(--d-${v})`,
            borderRadius: 2,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
        {MONTHS.map((m) => <span key={m}>{m}</span>)}
      </div>
    </Card>
  );
}
