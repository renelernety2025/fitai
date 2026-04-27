'use client';

import { Card } from '@/components/v3';
import { Chip } from '@/components/v3';
import { FitIcon, FitIconBox } from '@/components/icons/FitIcons';

/* ── Types ──────────────────────────────────────────────── */
export interface OnboardingData {
  name: string;
  age: string;
  goal: string | null;
  experience: string | null;
  activityLevel: number;
  days: boolean[];
  preferredTime: string | null;
  duration: number | null;
}

/* ── Step 1: Welcome ────────────────────────────────────── */
export function StepWelcome({
  data, onChange,
}: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <>
      <div className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16, textAlign: 'center' }}>
        &#9670; Step 1 &mdash; Let&apos;s begin
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 48 }}>
        Welcome to<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>FitAI.</span>
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420, margin: '0 auto' }}>
        <label style={{ display: 'block' }}>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Your name</span>
          <input value={data.name} onChange={e => onChange({ name: e.target.value })} placeholder="Sara"
            style={inputStyle} />
        </label>
        <label style={{ display: 'block' }}>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Age</span>
          <input type="number" value={data.age} onChange={e => onChange({ age: e.target.value })} placeholder="25"
            style={inputStyle} />
        </label>
      </div>
    </>
  );
}

/* ── Step 2: Goal ───────────────────────────────────────── */
const GOALS = [
  { id: 'move', icon: 'run', title: 'Move every day', sub: 'Walks, stretches, light cardio. Show up.' },
  { id: 'strength', icon: 'dumbbell', title: 'Build strength', sub: 'Get stronger, lift more, feel capable.' },
  { id: 'run', icon: 'target', title: 'Run further', sub: '5K, 10K, half-marathon, marathon.' },
  { id: 'mind', icon: 'leaf', title: 'Mind & body', sub: 'Yoga, mobility, breathwork, sleep.' },
  { id: 'weight', icon: 'heart', title: 'Lose weight', sub: 'Sustainable, no crash diets.' },
  { id: 'event', icon: 'star', title: 'Specific event', sub: 'Race, photoshoot, vacation, recovery.' },
] as const;

export function StepGoal({
  data, onChange,
}: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <>
      <div className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16, textAlign: 'center' }}>
        &#9670; Step 2 &mdash; Your goal
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 16 }}>
        What brings you<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>here today?</span>
      </h1>
      <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--text-2)', marginBottom: 48, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
        We&apos;ll tailor your plan, your coach, and your home screen around this.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {GOALS.map(g => {
          const sel = data.goal === g.id;
          return (
            <Card key={g.id} padding={24} onClick={() => onChange({ goal: g.id })} style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              background: sel ? 'linear-gradient(135deg, rgba(232,93,44,0.08) 0%, var(--bg-card) 70%)' : undefined,
              borderColor: sel ? 'var(--accent)' : undefined,
            }}>
              <FitIconBox name={g.icon} size={44} bg="var(--bg-3)" />
              <div style={{ flex: 1 }}>
                <div className="v3-title" style={{ fontSize: 17, marginBottom: 4 }}>{g.title}</div>
                <div className="v3-caption" style={{ fontSize: 13 }}>{g.sub}</div>
              </div>
              {sel && <CheckCircle />}
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* ── Step 3: Experience ─────────────────────────────────── */
const EXPERIENCE = [
  { id: 'new', label: 'New to fitness', sub: 'Just getting started or very little experience.' },
  { id: 'returning', label: 'Returning after a break', sub: 'Used to train, been away for a while.' },
  { id: 'experienced', label: 'Experienced', sub: 'Training consistently for 6+ months.' },
] as const;

export function StepExperience({
  data, onChange,
}: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <>
      <div className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16, textAlign: 'center' }}>
        &#9670; Step 3 &mdash; Experience
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 48 }}>
        How long have you<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>been training?</span>
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560, margin: '0 auto 40px' }}>
        {EXPERIENCE.map(e => {
          const sel = data.experience === e.id;
          return (
            <Card key={e.id} padding={20} onClick={() => onChange({ experience: e.id })} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: sel ? 'linear-gradient(135deg, rgba(232,93,44,0.08) 0%, var(--bg-card) 70%)' : undefined,
              borderColor: sel ? 'var(--accent)' : undefined,
            }}>
              <div style={{ flex: 1 }}>
                <div className="v3-title" style={{ fontSize: 16 }}>{e.label}</div>
                <div className="v3-caption" style={{ fontSize: 13 }}>{e.sub}</div>
              </div>
              {sel && <CheckCircle />}
            </Card>
          );
        })}
      </div>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Activity level</span>
        <input type="range" min={1} max={5} value={data.activityLevel}
          onChange={e => onChange({ activityLevel: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
          <span>Sedentary</span><span>Very active</span>
        </div>
      </div>
    </>
  );
}

/* ── Step 4: Schedule ───────────────────────────────────── */
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const TIMES = ['Morning', 'Afternoon', 'Evening'] as const;
const DURATIONS = [30, 45, 60, 90] as const;

export function StepSchedule({
  data, onChange,
}: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  function toggleDay(i: number) {
    const next = [...data.days];
    next[i] = !next[i];
    onChange({ days: next });
  }

  return (
    <>
      <div className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16, textAlign: 'center' }}>
        &#9670; Step 4 &mdash; Schedule
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 48 }}>
        When do you<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>like to train?</span>
      </h1>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Training days</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {DAY_LABELS.map((d, i) => (
              <Chip key={d} active={data.days[i]} onClick={() => toggleDay(i)}>{d}</Chip>
            ))}
          </div>
        </div>
        <div>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Preferred time</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {TIMES.map(t => (
              <Chip key={t} active={data.preferredTime === t} onClick={() => onChange({ preferredTime: t })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Session duration</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {DURATIONS.map(d => (
              <Chip key={d} active={data.duration === d} onClick={() => onChange({ duration: d })}>{d} min</Chip>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Step 5: Ready ──────────────────────────────────────── */
export function StepReady({ data }: { data: OnboardingData }) {
  const goal = GOALS.find(g => g.id === data.goal);
  const exp = EXPERIENCE.find(e => e.id === data.experience);
  const activeDays = data.days.filter(Boolean).length;

  return (
    <>
      <div className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16, textAlign: 'center' }}>
        &#9670; Step 5 &mdash; All set
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 48 }}>
        You&apos;re ready to<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>begin.</span>
      </h1>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SummaryRow label="Name" value={data.name || '—'} />
        <SummaryRow label="Age" value={data.age ? `${data.age} years` : '—'} />
        <SummaryRow label="Goal" value={goal?.title ?? '—'} />
        <SummaryRow label="Experience" value={exp?.label ?? '—'} />
        <SummaryRow label="Activity level" value={`${data.activityLevel} / 5`} />
        <SummaryRow label="Training days" value={activeDays > 0 ? `${activeDays}x / week` : '—'} />
        <SummaryRow label="Preferred time" value={data.preferredTime ?? '—'} />
        <SummaryRow label="Duration" value={data.duration ? `${data.duration} min` : '—'} />
      </div>
    </>
  );
}

/* ── Shared helpers ─────────────────────────────────────── */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--stroke-1)' }}>
      <span className="v3-caption" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{value}</span>
    </div>
  );
}

function CheckCircle() {
  return (
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <FitIcon name="check" size={14} color="#fff" />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 48, padding: '0 16px',
  background: 'var(--bg-2)', border: '1px solid var(--stroke-2)',
  borderRadius: 10, color: 'var(--text-1)', fontSize: 14,
  fontFamily: 'inherit', outline: 'none',
};
