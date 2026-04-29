'use client';

import { Logo } from '@/components/v3';

interface ShareCardProps {
  workoutName: string;
  duration: string;
  totalReps: number;
  avgForm: number;
  xpEarned: number;
  prs: { exercise: string; value: string }[];
  date: string;
  userName: string;
}

export function ShareCard({
  workoutName, duration, totalReps,
  avgForm, xpEarned, prs, date, userName,
}: ShareCardProps) {
  const dateStr = new Date(date).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={rootStyle}>
      <Header dateStr={dateStr} />
      <WorkoutTitle name={workoutName} duration={duration} />
      <StatsGrid
        totalReps={totalReps}
        avgForm={avgForm}
        xpEarned={xpEarned}
        prCount={prs.length}
      />
      {prs.length > 0 && <PRList prs={prs} />}
      <Footer userName={userName} />
    </div>
  );
}

function Header({ dateStr }: { dateStr: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Logo size={20} color="#fff" />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
        {dateStr}
      </span>
    </div>
  );
}

function WorkoutTitle({ name, duration }: { name: string; duration: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <div className="v3-display-2" style={{ color: '#fff', textAlign: 'center' }}>{name}</div>
      <div className="v3-numeric" style={{ fontSize: 56, fontWeight: 200, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>
        {duration}
      </div>
      <div className="v3-caption" style={{ color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: 10 }}>
        minutes
      </div>
    </div>
  );
}

function StatsGrid({ totalReps, avgForm, xpEarned, prCount }: {
  totalReps: number; avgForm: number; xpEarned: number; prCount: number;
}) {
  const items = [
    { label: 'Reps', value: String(totalReps) },
    { label: 'Form', value: `${avgForm}%`, accent: avgForm >= 80 },
    { label: 'XP', value: `+${xpEarned}`, accent: true },
    { label: 'PRs', value: String(prCount), accent: prCount > 0 },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {items.map((it) => (
        <div key={it.label} style={{ textAlign: 'center', padding: '16px 0', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
          <div className="v3-numeric" style={{ fontSize: 22, fontWeight: 600, color: it.accent ? 'var(--accent)' : '#fff' }}>{it.value}</div>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function PRList({ prs }: { prs: { exercise: string; value: string }[] }) {
  return (
    <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(168,255,0,0.08), rgba(168,255,0,0.02))', borderRadius: 12, border: '1px solid rgba(168,255,0,0.15)' }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: 10 }}>Personal Records</div>
      {prs.map((pr) => (
        <div key={pr.exercise} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{pr.exercise}</span>
          <span className="v3-numeric" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{pr.value}</span>
        </div>
      ))}
    </div>
  );
}

function Footer({ userName }: { userName: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{userName}</span>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>Powered by FitAI</span>
    </div>
  );
}

const rootStyle: React.CSSProperties = {
  width: 400,
  aspectRatio: '9 / 16',
  background: 'linear-gradient(165deg, #1a1a1a 0%, #0d0d0d 50%, #111 100%)',
  borderRadius: 24,
  padding: '32px 28px',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
  fontFamily: 'var(--font-sans)',
  overflow: 'hidden',
  position: 'relative',
};
