'use client';

import { Card } from '@/components/v3';
import { Chip } from '@/components/v3';
import { FitIcon, FitIconBox } from '@/components/icons/FitIcons';

/* ── Types ──────────────────────────────────────────────── */
export interface OnboardingData {
  name: string;
  age: string;
  weightKg: string;
  heightCm: string;
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
        &#9670; Krok 1 &mdash; Začínáme
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 48 }}>
        Vítej ve<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>FitAI.</span>
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420, margin: '0 auto' }}>
        <label style={{ display: 'block' }}>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Vaše jméno</span>
          <input value={data.name} onChange={e => onChange({ name: e.target.value })} placeholder="Sara"
            style={inputStyle} />
        </label>
        <label style={{ display: 'block' }}>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Věk</span>
          <input type="number" value={data.age} onChange={e => onChange({ age: e.target.value })} placeholder="25"
            style={inputStyle} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'block' }}>
            <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Váha</span>
            <div style={{ position: 'relative' }}>
              <input
                type="number" min={30} max={300}
                value={data.weightKg}
                onChange={e => onChange({ weightKg: e.target.value })}
                placeholder="Vaše váha"
                style={{ ...inputStyle, paddingRight: 40 }}
              />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-3)', pointerEvents: 'none' }}>kg</span>
            </div>
          </label>
          <label style={{ display: 'block' }}>
            <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 8 }}>Výška</span>
            <div style={{ position: 'relative' }}>
              <input
                type="number" min={100} max={250}
                value={data.heightCm}
                onChange={e => onChange({ heightCm: e.target.value })}
                placeholder="Vaše výška"
                style={{ ...inputStyle, paddingRight: 42 }}
              />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-3)', pointerEvents: 'none' }}>cm</span>
            </div>
          </label>
        </div>
      </div>
    </>
  );
}

/* ── Step 2: Goal ───────────────────────────────────────── */
const GOALS = [
  { id: 'move', icon: 'run', title: 'Hýbat se každý den', sub: 'Procházky, protažení, lehké kardio. Prostě se hýbat.' },
  { id: 'strength', icon: 'dumbbell', title: 'Budovat sílu', sub: 'Být silnější, zvedat více, cítit se schopně.' },
  { id: 'run', icon: 'target', title: 'Běhat dál', sub: '5K, 10K, půlmaraton, maraton.' },
  { id: 'mind', icon: 'leaf', title: 'Tělo & mysl', sub: 'Jóga, mobilita, dýchání, spánek.' },
  { id: 'weight', icon: 'heart', title: 'Zhubnout', sub: 'Udržitelně, bez extrémních diet.' },
  { id: 'event', icon: 'star', title: 'Konkrétní událost', sub: 'Závod, focení, dovolená, rekonvalescence.' },
] as const;

export function StepGoal({
  data, onChange,
}: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <>
      <div className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16, textAlign: 'center' }}>
        &#9670; Krok 2 &mdash; Tvůj cíl
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 16 }}>
        Co tě přivedlo<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>sem dnes?</span>
      </h1>
      <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--text-2)', marginBottom: 48, maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
        Přizpůsobíme ti plán, trenéra i domovskou obrazovku podle tvého cíle.
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
  { id: 'new', label: 'Začátečník/začátečnice', sub: 'Teprve začínám nebo mám jen minimální zkušenosti.' },
  { id: 'returning', label: 'Vracím se po pauze', sub: 'Dříve jsem trénoval/a, ale delší dobu jsem přestal/a.' },
  { id: 'experienced', label: 'Zkušený/á', sub: 'Trénuji pravidelně déle než 6 měsíců.' },
] as const;

export function StepExperience({
  data, onChange,
}: { data: OnboardingData; onChange: (d: Partial<OnboardingData>) => void }) {
  return (
    <>
      <div className="v3-eyebrow-serif" style={{ color: 'var(--accent-hot)', marginBottom: 16, textAlign: 'center' }}>
        &#9670; Krok 3 &mdash; Zkušenosti
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 48 }}>
        Jak dlouho<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>už trénuješ?</span>
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
        <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Úroveň aktivity</span>
        <input type="range" min={1} max={5} value={data.activityLevel}
          onChange={e => onChange({ activityLevel: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
          <span>Sedavý způsob života</span><span>Velmi aktivní</span>
        </div>
      </div>
    </>
  );
}

/* ── Step 4: Schedule ───────────────────────────────────── */
const DAY_LABELS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const TIMES = ['Ráno', 'Odpoledne', 'Večer'] as const;
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
        &#9670; Krok 4 &mdash; Plán
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 48 }}>
        Kdy nejraději<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>trénuješ?</span>
      </h1>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Tréninkové dny</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {DAY_LABELS.map((d, i) => (
              <Chip key={d} active={data.days[i]} onClick={() => toggleDay(i)}>{d}</Chip>
            ))}
          </div>
        </div>
        <div>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Preferovaný čas</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {TIMES.map(t => (
              <Chip key={t} active={data.preferredTime === t} onClick={() => onChange({ preferredTime: t })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div>
          <span className="v3-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Délka tréninku</span>
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
        &#9670; Krok 5 &mdash; Hotovo
      </div>
      <h1 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 48 }}>
        Jsi připraven/a<br />
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>začít.</span>
      </h1>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SummaryRow label="Jméno" value={data.name || '—'} />
        <SummaryRow label="Věk" value={data.age ? `${data.age} let` : '—'} />
        <SummaryRow label="Váha" value={data.weightKg ? `${data.weightKg} kg` : '—'} />
        <SummaryRow label="Výška" value={data.heightCm ? `${data.heightCm} cm` : '—'} />
        <SummaryRow label="Cíl" value={goal?.title ?? '—'} />
        <SummaryRow label="Zkušenosti" value={exp?.label ?? '—'} />
        <SummaryRow label="Aktivita" value={`${data.activityLevel} / 5`} />
        <SummaryRow label="Tréninkové dny" value={activeDays > 0 ? `${activeDays}× týdně` : '—'} />
        <SummaryRow label="Preferovaný čas" value={data.preferredTime ?? '—'} />
        <SummaryRow label="Délka tréninku" value={data.duration ? `${data.duration} min` : '—'} />
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
