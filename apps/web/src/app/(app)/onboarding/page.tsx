'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo, Button } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { completeOnboarding, saveOnboardingMeasurements } from '@/lib/api';
import {
  StepWelcome, StepGoal, StepExperience, StepSchedule, StepReady,
  type OnboardingData,
} from './steps';

const STEP_LABELS = ['Welcome', 'Your goal', 'Experience', 'Schedule', 'All set'];
const TOTAL = STEP_LABELS.length;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: '', age: '', goal: null, experience: null,
    activityLevel: 3, days: Array(7).fill(false),
    preferredTime: null, duration: null,
  });

  function update(partial: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...partial }));
  }

  function canContinue(): boolean {
    if (step === 1) return data.name.trim().length > 0 && data.age.trim().length > 0;
    if (step === 2) return data.goal !== null;
    if (step === 3) return data.experience !== null;
    if (step === 4) return data.days.some(Boolean) && data.preferredTime !== null && data.duration !== null;
    return true;
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const age = parseInt(data.age) || 25;
      await saveOnboardingMeasurements({ age, weightKg: 75, heightCm: 175 });
      await completeOnboarding();
      router.push('/dashboard');
    } catch {
      setSaving(false);
    }
  }

  function handleNext() {
    if (step < TOTAL) setStep(step + 1);
    else handleFinish();
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top bar ── */}
      <header style={{
        padding: '20px 40px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--stroke-1)',
      }}>
        <Logo size={20} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {STEP_LABELS.map((_, i) => {
            const n = i + 1;
            const done = n < step;
            const current = n === step;
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: done ? 'var(--sage)' : current ? 'var(--accent)' : 'var(--bg-3)',
                  color: done || current ? '#fff' : 'var(--text-4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
                }}>
                  {done ? <FitIcon name="check" size={14} color="#fff" /> : n}
                </div>
                {i < TOTAL - 1 && <div style={{ width: 28, height: 1, background: 'var(--stroke-2)' }} />}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Step {step} of {TOTAL}</span>
          <button onClick={() => router.push('/dashboard')}
            style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Skip
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main style={{ flex: 1, maxWidth: 920, width: '100%', margin: '0 auto', padding: '64px 24px 40px' }}>
        {step === 1 && <StepWelcome data={data} onChange={update} />}
        {step === 2 && <StepGoal data={data} onChange={update} />}
        {step === 3 && <StepExperience data={data} onChange={update} />}
        {step === 4 && <StepSchedule data={data} onChange={update} />}
        {step === 5 && <StepReady data={data} />}
      </main>

      {/* ── Footer nav ── */}
      <footer style={{
        padding: '20px 40px', display: 'flex', justifyContent: 'center', gap: 12,
        borderTop: '1px solid var(--stroke-1)',
      }}>
        {step > 1 && (
          <Button variant="ghost" size="lg" onClick={() => setStep(step - 1)}>
            &larr; Back
          </Button>
        )}
        <Button variant="accent" size="lg" disabled={!canContinue() || saving} onClick={handleNext}>
          {step === TOTAL ? (saving ? 'Saving...' : 'Start training \u2192') : 'Continue \u2192'}
        </Button>
      </footer>
    </div>
  );
}
