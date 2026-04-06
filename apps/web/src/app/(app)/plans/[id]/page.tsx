'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { getWorkoutPlan, type WorkoutPlanData } from '@/lib/api';

export default function PlanDetailPage({ params }: { params: { id: string } }) {
  const [plan, setPlan] = useState<WorkoutPlanData | null>(null);

  useEffect(() => {
    getWorkoutPlan(params.id).then(setPlan).catch(console.error);
  }, [params.id]);

  if (!plan) {
    return <div className="min-h-screen bg-[#0a0a0a]"><Header /><p className="p-8 text-gray-500">Načítání...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/plans" className="mb-4 inline-block text-sm text-gray-400 hover:text-white">&larr; Zpět</Link>
        <h1 className="mb-2 text-3xl font-bold text-white">{plan.nameCs}</h1>
        <p className="mb-8 text-gray-400">{plan.description}</p>

        <div className="space-y-6">
          {plan.days.map((day) => (
            <div key={day.id} className="rounded-xl bg-gray-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{day.nameCs}</h2>
                <Link
                  href={`/gym/start?planId=${plan.id}&dayIndex=${day.dayIndex}`}
                  className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Začít trénink
                </Link>
              </div>

              <div className="space-y-2">
                {day.plannedExercises.map((pe) => (
                  <div key={pe.id} className="flex items-center justify-between rounded-lg bg-gray-800 px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{pe.exercise.nameCs}</p>
                      <p className="text-xs text-gray-400">
                        {pe.exercise.muscleGroups.join(', ')}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-white">{pe.targetSets}×{pe.targetReps}</p>
                      <p className="text-xs text-gray-400">
                        {pe.targetWeight ? `${pe.targetWeight}kg` : 'Bodyweight'} · {pe.restSeconds}s pauza
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
