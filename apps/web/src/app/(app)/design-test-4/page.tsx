'use client';

import { FitIcon, FitIconBox } from '@/components/icons/FitIcons';

const NAVY = '#0B1A2E';
const NAVY_LIGHT = '#132744';
const ORANGE = '#FF7A2F';
const CREAM = '#FFF8F0';

const metrics = [
  { label: 'Total Reps', value: '156', icon: 'dumbbell' },
  { label: 'Avg Form', value: '91%', icon: 'gauge' },
  { label: 'Volume', value: '4.2t', icon: 'barbell' },
  { label: 'XP Earned', value: '+320', icon: 'star' },
];

const exercises = [
  { name: 'Bench Press', sets: '4x10', weight: '80 kg', form: 94 },
  { name: 'Incline DB Press', sets: '3x12', weight: '28 kg', form: 89 },
  { name: 'Cable Fly', sets: '3x15', weight: '15 kg', form: 92 },
  { name: 'Tricep Pushdown', sets: '3x12', weight: '32 kg', form: 88 },
  { name: 'Overhead Extension', sets: '3x10', weight: '20 kg', form: 85 },
];

const prs = [
  { name: 'Bench Press', value: '80 kg x 10', prev: '75 kg x 10' },
  { name: 'Cable Fly', value: '15 kg x 15', prev: '12 kg x 15' },
];

const deltas = [
  { label: 'Volume', delta: '+8%', positive: true },
  { label: 'Avg Form', delta: '+3%', positive: true },
  { label: 'Duration', delta: '-2 min', positive: true },
  { label: 'Total Reps', delta: '+12', positive: true },
];

function formColor(pct: number): string {
  if (pct >= 90) return '#22c55e';
  if (pct >= 80) return ORANGE;
  return '#ef4444';
}

export default function WorkoutSummaryPage() {
  return (
    <div style={{ minHeight: '100vh', background: NAVY, color: '#fff' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Plus Jakarta Sans',sans-serif; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 32px 64px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 36, background: ORANGE, marginBottom: 20 }}>
            <FitIcon name="check" size={36} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>Workout Complete</h1>
          <p style={{ fontSize: 14, opacity: 0.45, marginTop: 8 }}>Push Day  //  Tuesday, April 22</p>
        </div>

        {/* Big duration */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -3, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>47:32</div>
          <div style={{ fontSize: 13, opacity: 0.4, marginTop: 8, fontWeight: 500 }}>Total Duration</div>
        </div>

        {/* Metrics row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 44 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{ background: NAVY_LIGHT, borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <FitIconBox name={m.icon} size={38} bg="rgba(255,122,47,0.15)" color={ORANGE} radius={12} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>{m.value}</div>
              <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Exercise breakdown */}
        <div style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.5 }}>Exercise Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {exercises.map((e) => (
              <div key={e.name} style={{ background: NAVY_LIGHT, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                <FitIcon name="dumbbell" size={18} color="rgba(255,255,255,0.3)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{e.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.4, marginTop: 2 }}>{e.sets}  {e.weight}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 60, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: formColor(e.form), width: `${e.form}%` }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: formColor(e.form), minWidth: 32, textAlign: 'right' }}>{e.form}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Records */}
        <div style={{ marginBottom: 44 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.5 }}>Personal Records</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prs.map((p) => (
              <div key={p.name} style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(34,197,94,0.2)' }}>
                <FitIconBox name="trending" size={36} bg="rgba(34,197,94,0.2)" color="#22c55e" radius={10} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, marginTop: 2 }}>{p.value}</div>
                </div>
                <div style={{ fontSize: 11, opacity: 0.35, textAlign: 'right' }}>prev: {p.prev}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div style={{ marginBottom: 52 }}>
          <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 18, textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.5 }}>vs. Last Push Day</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {deltas.map((d) => (
              <div key={d.label} style={{ background: NAVY_LIGHT, borderRadius: 12, padding: '14px 12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: d.positive ? '#22c55e' : '#ef4444' }}>{d.delta}</div>
                <div style={{ fontSize: 11, opacity: 0.35, marginTop: 4, fontWeight: 500 }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FitIcon name="users" size={18} /> Share
          </button>
          <button style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 14, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FitIcon name="home" size={18} color="#fff" /> Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
