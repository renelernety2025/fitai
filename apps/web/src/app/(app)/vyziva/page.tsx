'use client';

import { useEffect, useState } from 'react';
import {
  V2Layout,
  V2SectionLabel,
  V2Display,
  V2Ring,
} from '@/components/v2/V2Layout';
import {
  getNutritionToday,
  getQuickFoods,
  addFoodLog,
  deleteFoodLog,
  type NutritionToday,
  type QuickFood,
} from '@/lib/api';

const MEALS = [
  { value: 'breakfast', label: 'Snídaně' },
  { value: 'lunch', label: 'Oběd' },
  { value: 'dinner', label: 'Večeře' },
  { value: 'snack', label: 'Svačina' },
];

export default function NutritionV2Page() {
  const [data, setData] = useState<NutritionToday | null>(null);
  const [foods, setFoods] = useState<QuickFood[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [meal, setMeal] = useState('breakfast');

  const reload = () => {
    getNutritionToday().then(setData).catch(console.error);
    getQuickFoods().then(setFoods).catch(console.error);
  };
  useEffect(reload, []);

  if (!data) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  const grouped = MEALS.map((m) => ({ ...m, items: data.log.filter((i) => i.mealType === m.value) }));

  const handleAdd = async (food: QuickFood) => {
    await addFoodLog({ ...food, mealType: meal });
    setShowAdd(false);
    reload();
  };

  return (
    <V2Layout>
      {/* Hero */}
      <section className="pt-12 pb-24 text-center">
        <V2SectionLabel>Dnes</V2SectionLabel>
        <h1
          className="font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', letterSpacing: '-0.05em', lineHeight: 1 }}
        >
          {data.totals.kcal.toLocaleString('cs-CZ')}
          <span className="text-white/30">
            {' '}/ {data.goals.dailyKcal.toLocaleString('cs-CZ')}
          </span>
        </h1>
        <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          Kalorie
        </div>
      </section>

      {/* Macro rings */}
      <section className="mb-32 grid grid-cols-1 gap-12 sm:grid-cols-3">
        <V2Ring value={data.totals.proteinG} total={data.goals.dailyProteinG} color="#FF375F" label="Protein" unit="g" />
        <V2Ring value={data.totals.carbsG} total={data.goals.dailyCarbsG} color="#A8FF00" label="Sacharidy" unit="g" />
        <V2Ring value={data.totals.fatG} total={data.goals.dailyFatG} color="#00E5FF" label="Tuky" unit="g" />
      </section>

      {/* Meals */}
      <section className="space-y-16">
        {grouped.map((m) => (
          <div key={m.value}>
            <div className="mb-4 flex items-center justify-between">
              <V2Display size="md">{m.label}</V2Display>
              <button
                onClick={() => {
                  setMeal(m.value);
                  setShowAdd(true);
                }}
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
              >
                + Přidat
              </button>
            </div>
            {m.items.length === 0 ? (
              <div className="text-sm text-white/30">Žádné jídlo</div>
            ) : (
              <ul className="space-y-3">
                {m.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between border-b border-white/8 pb-3"
                  >
                    <div>
                      <div className="text-base text-white">{item.name}</div>
                      <div className="text-xs text-white/40">
                        {item.kcal} kcal · P {item.proteinG}g · S {item.carbsG}g · T {item.fatG}g
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await deleteFoodLog(item.id);
                        reload();
                      }}
                      className="text-xs text-white/30 transition hover:text-white"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Quick add modal */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-xl sm:items-center"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-black p-8 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <V2SectionLabel>{MEALS.find((x) => x.value === meal)?.label}</V2SectionLabel>
            <V2Display size="md">Přidat jídlo</V2Display>
            <ul className="mt-6 space-y-1">
              {foods.map((f) => (
                <li key={f.name}>
                  <button
                    onClick={() => handleAdd(f)}
                    className="flex w-full items-center justify-between border-b border-white/8 py-4 text-left transition hover:bg-white/5"
                  >
                    <div>
                      <div className="text-base text-white">{f.name}</div>
                      <div className="text-xs text-white/40">
                        P {f.proteinG}g · S {f.carbsG}g · T {f.fatG}g
                      </div>
                    </div>
                    <div className="font-bold text-white tabular-nums">{f.kcal}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </V2Layout>
  );
}
