'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import {
  getOnboardingStatus, getOnboardingTestExercises, saveOnboardingMeasurements,
  submitFitnessTest, completeOnboarding, getSuggestedWeights,
  type OnboardingStatus, type SuggestedWeight,
} from '@/lib/api';

type Step = 'measurements' | 'test' | 'review' | 'done';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('measurements');
  const [loading, setLoading] = useState(true);

  // Step 1: measurements
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  // Step 2: fitness test
  const [testExercises, setTestExercises] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<Record<string, { weight: string; reps: string }>>({});

  // Step 3: review
  const [suggested, setSuggested] = useState<SuggestedWeight[]>([]);

  useEffect(() => {
    Promise.all([getOnboardingStatus(), getOnboardingTestExercises()])
      .then(([status, exs]) => {
        setTestExercises(exs);
        if (status.completed) {
          router.push('/dashboard');
        } else if (status.step === 'measurements' || status.step === 'profile') {
          setStep('measurements');
        } else if (status.step === 'fitness_test') {
          setStep('test');
        } else if (status.step === 'finalize') {
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
    router.push('/dashboard');
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a]"><Header /><p className="p-8 text-gray-500">Načítání...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Pojďme začít</h1>
        <p className="mb-6 text-gray-400">Pomůžeme ti vytvořit personalizovaný tréninkový plán.</p>

        {/* Progress indicator */}
        <div className="mb-8 flex gap-2">
          {(['measurements', 'test', 'review'] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                step === s || (i < ['measurements', 'test', 'review'].indexOf(step))
                  ? 'bg-[#16a34a]'
                  : 'bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: Measurements */}
        {step === 'measurements' && (
          <div className="rounded-2xl bg-gray-900 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">1/3 — Základní údaje</h2>
            <p className="mb-6 text-sm text-gray-400">Tyto údaje pomohou personalizovat tvůj plán.</p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Věk</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Váha (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                  placeholder="75"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Výška (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
                  placeholder="180"
                />
              </div>
            </div>

            <button
              onClick={handleMeasurementsNext}
              disabled={!age || !weight || !height}
              className="mt-6 w-full rounded-lg bg-[#16a34a] py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-40"
            >
              Pokračovat
            </button>
          </div>
        )}

        {/* STEP 2: Fitness Test */}
        {step === 'test' && (
          <div className="rounded-2xl bg-gray-900 p-6">
            <h2 className="mb-2 text-xl font-semibold text-white">2/3 — Fitness test</h2>
            <p className="mb-2 text-sm text-gray-400">
              Pro každý cvik zadej váhu a počet opakování, které událáš s perfektní formou (2-10 repů).
            </p>
            <p className="mb-6 text-xs text-gray-500">
              Z toho spočítáme tvoje 1RM (maximální váha) a navrhneme pracovní zátěž. Můžeš přeskočit cviky které neznáš.
            </p>

            <div className="space-y-4">
              {testExercises.map((ex) => (
                <div key={ex.id} className="rounded-lg bg-gray-800 p-4">
                  <p className="mb-3 font-semibold text-white">{ex.nameCs}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Váha (kg)"
                      value={testResults[ex.id]?.weight || ''}
                      onChange={(e) =>
                        setTestResults({ ...testResults, [ex.id]: { ...(testResults[ex.id] || { reps: '' }), weight: e.target.value } })
                      }
                      className="rounded bg-gray-700 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="number"
                      placeholder="Opakování"
                      value={testResults[ex.id]?.reps || ''}
                      onChange={(e) =>
                        setTestResults({ ...testResults, [ex.id]: { ...(testResults[ex.id] || { weight: '' }), reps: e.target.value } })
                      }
                      className="rounded bg-gray-700 px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleTestNext}
              className="mt-6 w-full rounded-lg bg-[#16a34a] py-3 font-semibold text-white hover:bg-green-700"
            >
              Spočítat 1RM
            </button>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 'review' && (
          <div className="rounded-2xl bg-gray-900 p-6">
            <h2 className="mb-2 text-xl font-semibold text-white">3/3 — Tvoje pracovní váhy</h2>
            <p className="mb-6 text-sm text-gray-400">
              Spočítáno na základě tvého 1RM. První týden začneme jemně na 60% — tělo si zvykne.
            </p>

            <div className="mb-6 space-y-3">
              {suggested.map((s) => (
                <div key={s.exerciseId} className="rounded-lg bg-gray-800 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-white">{s.exerciseName}</p>
                    <span className="text-xs text-gray-500">1RM: {s.oneRMKg}kg</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded bg-yellow-900/20 border border-yellow-800/30 p-2">
                      <p className="text-xs text-yellow-400">První týden</p>
                      <p className="font-bold text-white">{s.firstWeekWeight}kg × {s.recommendedReps}</p>
                    </div>
                    <div className="rounded bg-green-900/20 border border-green-800/30 p-2">
                      <p className="text-xs text-green-400">Cílová váha</p>
                      <p className="font-bold text-white">{s.recommendedWorkingWeight}kg × {s.recommendedReps}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full rounded-lg bg-[#16a34a] py-3 font-semibold text-white hover:bg-green-700"
            >
              Začít cvičit 💪
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
