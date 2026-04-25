'use client';

import { FitIcon, FitIconBox } from '@/components/icons/FitIcons';

const NAVY = '#0B1A2E';
const NAVY_LIGHT = '#132744';
const ORANGE = '#FF7A2F';
const CREAM = '#FFF8F0';
const ORANGE_15 = 'rgba(255,122,47,0.15)';

const steps = [
  'Lie flat on the bench with feet firmly on the floor, shoulder blades retracted.',
  'Grip the bar slightly wider than shoulder width, wrists straight.',
  'Unrack and lower the bar to mid-chest with control (2-3 sec eccentric).',
  'Touch your chest lightly — no bouncing. Keep elbows at ~75 degrees.',
  'Press up explosively, lock out at the top. Exhale on the push.',
];

const stats = [
  { label: 'Your PR', value: '95 kg', icon: 'trophy' },
  { label: 'Avg Form', value: '91%', icon: 'gauge' },
  { label: 'Total Volume', value: '24.8t', icon: 'chart' },
  { label: 'Last Performed', value: '2 days ago', icon: 'timer' },
];

const muscles: { name: string; role: string; pct: number }[] = [
  { name: 'Chest', role: 'Primary', pct: 100 },
  { name: 'Triceps', role: 'Secondary', pct: 65 },
  { name: 'Shoulders', role: 'Secondary', pct: 45 },
];

const tips = [
  { icon: 'shield', title: 'Arch Your Back', text: 'A slight arch protects shoulders and increases pressing power.' },
  { icon: 'target', title: 'Bar Path Matters', text: 'Aim for a slight J-curve — down to chest, up toward the rack.' },
  { icon: 'bolt', title: 'Leg Drive', text: 'Push feet into the floor to create a stable base and transfer force.' },
];

export default function ExerciseDetailPage() {
  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Plus Jakarta Sans',sans-serif; }
      `}</style>

      {/* Hero */}
      <div style={{ background: NAVY, padding: '64px 40px 48px', color: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, opacity: 0.6, fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            <FitIcon name="dumbbell" size={16} color={ORANGE} /> Compound Exercise
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>Bench Press</h1>
          <p style={{ marginTop: 12, fontSize: 16, opacity: 0.55, maxWidth: 480 }}>
            The king of upper-body pressing. Builds chest, shoulders and triceps.
          </p>
        </div>
      </div>

      {/* Two-column */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 48 }}>
        {/* Left — Steps */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 24 }}>How to perform</h2>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {steps.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: i === 0 ? ORANGE : NAVY_LIGHT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{i + 1}</span>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: NAVY, paddingTop: 4 }}>{s}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Right — Stats card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid rgba(11,26,46,0.08)', alignSelf: 'start' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <FitIconBox name={s.icon} size={40} bg={ORANGE_15} color={ORANGE} radius={12} />
                <div>
                  <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: NAVY }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Muscles */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 40px 48px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 20 }}>Targeted Muscles</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {muscles.map((m) => (
            <div key={m.name} style={{ background: '#fff', borderRadius: 14, padding: '16px 24px', border: '1px solid rgba(11,26,46,0.08)', minWidth: 180 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: NAVY, fontSize: 15 }}>{m.name}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: m.role === 'Primary' ? ORANGE : '#888', textTransform: 'uppercase' }}>{m.role}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(11,26,46,0.08)' }}>
                <div style={{ height: '100%', borderRadius: 3, background: m.role === 'Primary' ? ORANGE : NAVY_LIGHT, width: `${m.pct}%`, transition: 'width 0.6s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coaching Tips */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 40px 48px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 20 }}>Coaching Tips</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {tips.map((t) => (
            <div key={t.title} style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid rgba(11,26,46,0.08)' }}>
              <FitIconBox name={t.icon} size={44} bg={NAVY} color={ORANGE} radius={14} style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#666' }}>{t.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Community Clips */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 40px 48px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 20 }}>Community Clips</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ background: NAVY_LIGHT, borderRadius: 16, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FitIconBox name="camera" size={52} bg="rgba(255,255,255,0.1)" color="rgba(255,255,255,0.4)" radius={26} />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 40px 64px', textAlign: 'center' }}>
        <button style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 14, padding: '16px 48px', fontSize: 17, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <FitIcon name="bolt" size={20} color="#fff" /> Zacit trenovat
          </span>
        </button>
      </div>
    </div>
  );
}
