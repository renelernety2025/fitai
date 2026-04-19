'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { getWorkoutPlans, startGymSession, type WorkoutPlanData } from '@/lib/api';
import CoachPersonalityPicker from '@/components/gym/CoachPersonalityPicker';

type CoachPersonality = 'DRILL' | 'CHILL' | 'MOTIVATIONAL';

function GymStartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<WorkoutPlanData[]>([]);
  const [starting, setStarting] = useState(false);
  const [personality, setPersonality] = useState<CoachPersonality>('MOTIVATIONAL');

  const planId = searchParams.get('planId');
  const dayIndex = searchParams.get('dayIndex');

  useEffect(() => {
    getWorkoutPlans().then(setPlans).catch(console.error);
  }, []);

  async function handleStart(pId: string, dIdx: number) {
    setStarting(true);
    try {
      const session = await startGymSession({
        workoutPlanId: pId,
        workoutDayIndex: dIdx,
        coachPersonality: personality,
      });
      router.push(`/gym/${session.id}`);
    } catch (err) {
      console.error(err);
      setStarting(false);
    }
  }

  useEffect(() => {
    if (planId && dayIndex !== null && !starting) {
      handleStart(planId, parseInt(dayIndex));
    }
  }, [planId, dayIndex]);

  if (starting) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Připravuji trénink...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Začít trénink</h1>

      <section className="mb-10">
        <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Tvůj trenér</h2>
        <CoachPersonalityPicker value={personality} onChange={setPersonality} />
      </section>

      <p className="mb-8 text-gray-400">Vyber plán a den:</p>
      <div className="space-y-4">
        {plans.map((plan) =>
          plan.days.map((day) => (
            <button
              key={`${plan.id}-${day.dayIndex}`}
              onClick={() => handleStart(plan.id, day.dayIndex)}
              className="block w-full rounded-xl bg-gray-900 p-6 text-left transition hover:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{plan.nameCs} — {day.nameCs}</h3>
                  <p className="text-sm text-gray-400">
                    {day.plannedExercises.map((pe: any) => pe.exercise.nameCs).join(' · ')}
                  </p>
                </div>
                <span className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white">Start</span>
              </div>
            </button>
          ))
        )}
      </div>
    </main>
  );
}

export default function GymStartPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <Suspense fallback={<div className="flex justify-center py-20"><p className="text-gray-500">Načítání...</p></div>}>
        <GymStartContent />
      </Suspense>
    </div>
  );
}
