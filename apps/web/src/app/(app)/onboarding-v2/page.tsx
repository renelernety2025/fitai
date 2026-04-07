'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { V2Input, V2Button } from '@/components/v2/V2AuthLayout';
import {
  getOnboardingStatus,
  getOnboardingTestExercises,
  saveOnboardingMeasurements,
  submitFitnessTest,
  completeOnboarding,
  getSuggestedWeights,
  type SuggestedWeight,
} from '@/lib/api';

type Step = 'measurements' | 'test' | 'review';

export default function OnboardingV2Page() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('measurements');
  const [loading, setLoading] = useState(true);

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const [testExercises, setTestExercises] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<Record<string, { weight: string; reps: string }>>({});

  const [suggested, setSuggested] = useState<SuggestedWeight[]>([]);

  useEffect(() => {
    Promise.all([getOnboardingStatus(), getOnboardingTestExercises()])
      .then(([status, exs]) => {
        setTestExercises(exs);
        if (status.completed) router.push('/dashboard-v2');
        else if (status.step === 'measurements' || status.step === 'profile') setStep('measurements');
        else if (status.step === 'fitness_test') setStep('test');
        else if (status.step === 'finalize') {
          setStep('review');
          getSuggestedWeights().then(setSuggested);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleMeasurementsNext() {
    const a = parseInt(age);
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!a || !w || !h) return;
    await saveOnboardingMeasurements({ age: a, weightKg: w, heightCm: h });
    setStep('test');
  }

  async function handleTestNext() {
    const results = Object.entries(testResults)
      .filter(([, v]) => parseFloat(v.weight) > 0 && parseInt(v.reps) > 0)
      .map(([exerciseId, v]) => ({
        exerciseId,
        weight: parseFloat(v.weight),
        reps: parseInt(v.reps),
      }));
    if (results.length === 0) return;
    await submitFitnessTest(results);
    const sw = await getSuggestedWeights();
    setSuggested(sw);
    setStep('review');
  }

  async function handleFinish() {
    await completeOnboarding();
    router.push('/dashboard-v2');
  }

  if (loading) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  const stepIdx = ['measurements', 'test', 'review'].indexOf(step);

  return (
    <V2Layout>
      <section className="pt-12 pb-12">
        <V2SectionLabel>Krok {stepIdx + 1} ze 3</V2SectionLabel>
        <V2Display size="xl">
          {step === 'measurements' && 'O tobě.'}
          {step === 'test' && 'Tvůj výkon.'}
          {step === 'review' && 'Tvůj plán.'}
        </V2Display>
      </section>

      {/* Progress bar */}
      <div className="mb-16 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-[2px] flex-1 rounded-full transition ${
              i <= stepIdx ? 'bg-white' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {step === 'measurements' && (
        <div className="space-y-12">
          <p className="max-w-xl text-base text-white/55">
            Tyto údaje pomohou personalizovat tvůj plán a spočítat denní příjem kalorií.
          </p>
          <div className="space-y-10">
            <V2Input label="Věk" type="number" value={age} onChange={setAge} placeholder="25" />
            <V2Input label="Váha (kg)" type="number" value={weight} onChange={setWeight} placeholder="75" />
            <V2Input label="Výška (cm)" type="number" value={height} onChange={setHeight} placeholder="180" />
          </div>
          <V2Button onClick={handleMeasurementsNext} disabled={!age || !weight || !height}>
            Pokračovat →
          </V2Button>
        </div>
      )}

      {step === 'test' && (
        <div className="space-y-12">
          <p className="max-w-xl text-base text-white/55">
            U každého cviku zadej váhu a počet opakování s perfektní formou. Z toho spočítáme tvoje 1RM. Cviky které neznáš můžeš přeskočit.
          </p>
          <div className="space-y-10">
            {testExercises.map((ex) => (
              <div key={ex.id} className="border-b border-white/10 pb-8">
                <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                  Cvik
                </div>
                <V2Display size="sm">{ex.nameCs}</V2Display>
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <V2Input
                    label="Váha (kg)"
                    type="number"
                    value={testResults[ex.id]?.weight || ''}
                    onChange={(v) =>
                      setTestResults({
                        ...testResults,
                        [ex.id]: { ...(testResults[ex.id] || { reps: '' }), weight: v },
                      })
                    }
                  />
                  <V2Input
                    label="Opakování"
                    type="number"
                    value={testResults[ex.id]?.reps || ''}
                    onChange={(v) =>
                      setTestResults({
                        ...testResults,
                        [ex.id]: { ...(testResults[ex.id] || { weight: '' }), reps: v },
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <V2Button onClick={handleTestNext}>Spočítat 1RM →</V2Button>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-12">
          <p className="max-w-xl text-base text-white/55">
            Spočítáno na základě tvého 1RM. První týden začneme jemně na 60 % — tělo si zvykne.
          </p>
          <div className="space-y-1">
            {suggested.map((s) => (
              <div key={s.exerciseId} className="border-b border-white/10 py-8">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                  1RM {s.oneRMKg}kg
                </div>
                <V2Display size="md">{s.exerciseName}</V2Display>
                <div className="mt-4 flex gap-8 text-sm">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF9F0A]">
                      První týden
                    </div>
                    <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                      {s.firstWeekWeight}
                      <span className="text-base text-white/40">kg × {s.recommendedReps}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A8FF00]">
                      Cílová váha
                    </div>
                    <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                      {s.recommendedWorkingWeight}
                      <span className="text-base text-white/40">kg × {s.recommendedReps}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <V2Button onClick={handleFinish}>Začít cvičit →</V2Button>
        </div>
      )}
    </V2Layout>
  );
}
