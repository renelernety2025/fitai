'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { getWorkoutPlans, cloneWorkoutPlan, type WorkoutPlanData } from '@/lib/api';

const typeLabels: Record<string, string> = {
  PUSH_PULL_LEGS: 'Push/Pull/Legs',
  UPPER_LOWER: 'Horní/Dolní',
  FULL_BODY: 'Celé tělo',
  CUSTOM: 'Vlastní',
};

export default function PlansPage() {
  const [plans, setPlans] = useState<WorkoutPlanData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = () => {
    setLoading(true);
    getWorkoutPlans().then(setPlans).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(loadPlans, []);

  async function handleClone(id: string) {
    await cloneWorkoutPlan(id);
    loadPlans();
  }

  const templates = plans.filter((p) => p.isTemplate);
  const custom = plans.filter((p) => !p.isTemplate);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Tréninkové plány</h1>
        </div>

        {/* Templates */}
        <h2 className="mb-4 text-lg font-semibold text-gray-300">Šablony</h2>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((plan) => (
            <div key={plan.id} className="rounded-xl bg-gray-900 p-6">
              <h3 className="mb-1 text-lg font-semibold text-white">{plan.nameCs}</h3>
              <p className="mb-3 text-sm text-gray-400">
                {typeLabels[plan.type]} · {plan.daysPerWeek}x/týden · {plan.days.length} dnů
              </p>
              {plan.days.map((day) => (
                <div key={day.id} className="mb-2">
                  <p className="text-xs font-medium text-gray-300">{day.nameCs}</p>
                  <p className="text-xs text-gray-500">
                    {day.plannedExercises.map((pe) => pe.exercise.nameCs).join(', ')}
                  </p>
                </div>
              ))}
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/plans/${plan.id}`}
                  className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                >
                  Detail
                </Link>
                <button
                  onClick={() => handleClone(plan.id)}
                  className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                >
                  Kopírovat do mých
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom */}
        {custom.length > 0 && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-gray-300">Moje plány</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {custom.map((plan) => (
                <Link key={plan.id} href={`/plans/${plan.id}`} className="rounded-xl bg-gray-900 p-6 transition hover:bg-gray-800">
                  <h3 className="mb-1 text-lg font-semibold text-white">{plan.nameCs}</h3>
                  <p className="text-sm text-gray-400">{plan.days.length} dnů · {plan.daysPerWeek}x/týden</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
