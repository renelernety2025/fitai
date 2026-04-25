'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FitIcon } from '@/components/icons/FitIcons';

/* ── Design tokens (from handoff) ─────────────────────────── */
const T = {
  bg0: '#0B0907',
  bg3: '#221E18',
  bgCard: '#14110D',
  text1: '#F5EDE0',
  text2: '#BFB4A2',
  text3: '#847B6B',
  accent: '#E85D2C',
  accentHot: '#F47A4D',
  sage: '#A8B89A',
  clay: '#D4A88C',
  stroke1: 'rgba(245,237,224,0.06)',
  stroke2: 'rgba(245,237,224,0.10)',
  rSm: 10,
  rMd: 14,
  fontDisplay: '"Inter Tight", -apple-system, sans-serif',
  fontText: '"Inter", -apple-system, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

/* ── Goal card data ───────────────────────────────────────── */
const GOALS = [
  { icon: 'run', title: 'Move every day', sub: 'Walks, stretches, light cardio. Show up.' },
  { icon: 'dumbbell', title: 'Build strength', sub: 'Get stronger, lift more, feel capable.' },
  { icon: 'target', title: 'Run further', sub: '5K, 10K, half-marathon, marathon.' },
  { icon: 'leaf', title: 'Mind & body', sub: 'Yoga, mobility, breathwork, sleep.' },
  { icon: 'heart', title: 'Lose weight', sub: 'Sustainable, no crash diets.' },
  { icon: 'star', title: 'Specific event', sub: 'Race, photoshoot, vacation, recovery.' },
] as const;

const STEPS = [
  { n: 1, label: 'Welcome' },
  { n: 2, label: 'Your goal' },
  { n: 3, label: 'Experience' },
  { n: 4, label: 'Schedule' },
  { n: 5, label: 'Profile' },
] as const;

/* ── Step indicator circle ────────────────────────────────── */
function StepCircle({ n, state }: {
  n: number; state: 'done' | 'current' | 'pending';
}) {
  const bg = state === 'current' ? T.accent
    : state === 'done' ? T.sage : T.bg3;
  const color = state === 'pending' ? T.text3 : '#fff';

  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: bg, color, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, fontFamily: T.fontMono,
    }}>
      {state === 'done' ? '\u2713' : n}
    </div>
  );
}

/* ── Goal card ────────────────────────────────────────────── */
function GoalCard({ icon, title, sub, selected, onSelect }: {
  icon: string; title: string; sub: string;
  selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 16,
        padding: 24, textAlign: 'left', width: '100%',
        background: selected
          ? `linear-gradient(135deg, rgba(232,93,44,0.08) 0%, ${T.bgCard} 70%)`
          : T.bgCard,
        border: selected
          ? `1px solid ${T.accent}`
          : `1px solid ${T.stroke1}`,
        borderRadius: T.rMd, cursor: 'pointer',
        transition: 'all .2s',
      }}
    >
      <div style={{
        width: 32, height: 32, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FitIcon
          name={icon} size={28}
          color={selected ? T.accent : T.text2}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 18, fontWeight: 600, color: T.text1,
          marginBottom: 4, fontFamily: T.fontText,
        }}>{title}</div>
        <div style={{ fontSize: 13, color: T.text2 }}>
          {sub}
        </div>
      </div>
      {selected && (
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: T.accent, color: '#fff',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12,
          fontWeight: 700, flexShrink: 0,
        }}>{'\u2713'}</div>
      )}
    </button>
  );
}

/* ── Onboarding page ──────────────────────────────────────── */
export default function OnboardingV3Page() {
  const [currentStep] = useState(2);
  const [selectedGoal, setSelectedGoal] = useState(0);
  const router = useRouter();

  function stepState(n: number) {
    if (n < currentStep) return 'done' as const;
    if (n === currentStep) return 'current' as const;
    return 'pending' as const;
  }

  return (
    <div style={{
      background: T.bg0, minHeight: '100vh',
      color: T.text1, fontFamily: T.fontText,
    }}>
      {/* Top bar */}
      <div style={{
        padding: '24px 56px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${T.stroke1}`,
      }}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: T.text1,
          fontFamily: T.fontDisplay, letterSpacing: '-0.02em',
        }}>FitAI</div>

        {/* Step indicators */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <StepCircle n={s.n} state={stepState(s.n)} />
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 32, height: 1, background: T.stroke2,
                }} />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          style={{
            fontSize: 12, color: T.text3,
            background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: T.fontText,
          }}
        >
          Step {currentStep} of {STEPS.length} &middot; Skip
        </button>
      </div>

      {/* Step content */}
      <div style={{
        maxWidth: 920, margin: '0 auto', padding: '80px 40px',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.08em',
          textTransform: 'uppercase', fontWeight: 600,
          color: T.accentHot, marginBottom: 16,
          textAlign: 'center',
        }}>
          &#9670; Step 2 &mdash; Your goal
        </div>

        <h1 style={{
          fontFamily: T.fontDisplay, fontSize: 48,
          fontWeight: 700, textAlign: 'center',
          marginBottom: 16, lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          What brings you<br />
          <span style={{
            color: T.clay, fontStyle: 'italic', fontWeight: 300,
          }}>here today?</span>
        </h1>

        <p style={{
          textAlign: 'center', fontSize: 16, color: T.text2,
          marginBottom: 56, maxWidth: 560,
          marginLeft: 'auto', marginRight: 'auto',
        }}>
          We&apos;ll tailor your plan, your coach, and your home
          screen around this. You can always change it.
        </p>

        {/* Goal grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}>
          {GOALS.map((g, i) => (
            <GoalCard
              key={g.title}
              icon={g.icon}
              title={g.title}
              sub={g.sub}
              selected={selectedGoal === i}
              onSelect={() => setSelectedGoal(i)}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 40,
          justifyContent: 'center',
        }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '14px 28px', fontSize: 13,
              fontWeight: 500, fontFamily: T.fontText,
              background: 'transparent', color: T.text1,
              border: `1px solid ${T.stroke2}`,
              borderRadius: T.rSm, cursor: 'pointer',
            }}
          >
            &larr; Back
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '14px 32px', fontSize: 13,
              fontWeight: 600, fontFamily: T.fontText,
              background: T.accent, color: '#fff',
              border: 'none', borderRadius: T.rSm,
              cursor: 'pointer',
            }}
          >
            Continue &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
