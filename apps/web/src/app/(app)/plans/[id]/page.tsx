'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWorkoutPlan, type WorkoutPlanData } from '@/lib/api';

export default function PlanV2DetailPage({ params }: { params: { id: string } }) {
  const [plan, setPlan] = useState<WorkoutPlanData | null>(null);

  useEffect(() => {
    getWorkoutPlan(params.id).then(setPlan).catch(console.error);
  }, [params.id]);

  if (!plan) {
    return (
      <>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="cinematic-enter">
      <Link
        href="/gym"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        ← Plány
      </Link>

      <section className="pt-8 pb-16">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          {plan.type.replace(/_/g, ' ')} · {plan.daysPerWeek}× týdně
        </div>
        <h1 className="v3-display-2">{plan.nameCs}</h1>
        <p className="mt-4 max-w-2xl text-base text-white/55">{plan.description}</p>
        <Link
          href={`/plans/${params.id}/edit`}
          className="mt-6 inline-block rounded-full border border-white/15 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/40 hover:text-white"
        >
          Upravit
        </Link>
      </section>

      <section className="space-y-20">
        {plan.days.map((day) => (
          <div key={day.id}>
            <div className="mb-6 flex items-baseline justify-between">
              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                  Den {day.dayIndex + 1}
                </div>
                <h2 className="v3-title">{day.nameCs}</h2>
              </div>
              <Link
                href={`/gym/start?planId=${plan.id}&dayIndex=${day.dayIndex}`}
                className="rounded-full bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/90"
              >
                Začít →
              </Link>
            </div>
            <div className="space-y-1">
              {day.plannedExercises.map((pe) => (
                <div
                  key={pe.id}
                  className="flex items-baseline justify-between border-b border-white/8 py-5"
                >
                  <div className="flex-1">
                    <div className="text-base text-white">{pe.exercise.nameCs}</div>
                    <div className="text-xs text-white/40">
                      {pe.exercise.muscleGroups.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tabular-nums text-white">
                      {pe.targetSets} × {pe.targetReps}
                    </div>
                    <div className="text-xs text-white/40">
                      {pe.targetWeight ? `${pe.targetWeight}kg` : 'BW'} · {pe.restSeconds}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      </div>
    </>
  );
}
