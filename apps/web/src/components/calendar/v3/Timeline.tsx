'use client';

import { Card } from '@/components/v3';

const PHASES = [
  { name: 'Anatomical Adaptation', weeks: 4, color: '#6BE3D2', current: false },
  { name: 'Hypertrophy', weeks: 4, color: '#FF4B12', current: true },
  { name: 'Strength', weeks: 3, color: '#FFB547', current: false },
  { name: 'Peak / Test', weeks: 1, color: '#fff', current: false },
];

const CURRENT_WEEK = 5.5;
const TOTAL_WEEKS = 12;

export function Timeline() {
  return (
    <Card padding={24}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="v3-eyebrow">PROGRAM TIMELINE &middot; {TOTAL_WEEKS} WEEKS</span>
        <span className="v3-caption">Started Sep 2 &middot; Ends Nov 24</span>
      </div>
      <div style={{ position: 'relative', height: 56 }}>
        {/* Background slots */}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)`, gap: 4 }}>
          {Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-2)', borderRadius: 4 }} />
          ))}
        </div>
        {/* Phase bars */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 4 }}>
          {PHASES.map((p) => (
            <div key={p.name} style={{
              flex: p.weeks, padding: '0 12px', background: p.color, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              color: p.color === '#FF4B12' ? '#fff' : '#000',
              boxShadow: p.current
                ? '0 0 0 2px var(--bg-0), 0 0 0 3px var(--accent), 0 0 30px rgba(255,75,18,0.5)'
                : 'none',
            }}>
              <span>{p.name}</span>
              <span className="v3-numeric" style={{ fontSize: 11, opacity: 0.7 }}>{p.weeks}W</span>
            </div>
          ))}
        </div>
        {/* Current week marker */}
        <div style={{
          position: 'absolute', top: -6, bottom: -6,
          left: `${(CURRENT_WEEK / TOTAL_WEEKS) * 100}%`,
          width: 2, background: '#fff',
          boxShadow: '0 0 12px rgba(255,255,255,0.8)',
        }}>
          <div style={{
            position: 'absolute', top: -22, left: -16,
            fontSize: 10, fontFamily: 'var(--font-mono)', color: '#fff',
            whiteSpace: 'nowrap', background: 'var(--bg-0)',
            padding: '2px 6px', borderRadius: 4,
          }}>
            WEEK 6 &middot; NOW
          </div>
        </div>
      </div>
    </Card>
  );
}
