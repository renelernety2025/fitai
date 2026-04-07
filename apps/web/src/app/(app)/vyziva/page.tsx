'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import {
  getNutritionToday,
  getQuickFoods,
  addFoodLog,
  deleteFoodLog,
  autoCalculateNutritionGoals,
  type NutritionToday,
  type QuickFood,
} from '@/lib/api';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Snídaně' },
  { value: 'lunch', label: 'Oběd' },
  { value: 'dinner', label: 'Večeře' },
  { value: 'snack', label: 'Svačina' },
];

function MacroRing({
  label,
  value,
  total,
  color,
  unit = 'g',
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  unit?: string;
}) {
  const pct = Math.min(100, total > 0 ? (value / total) * 100 : 0);
  return (
    <div className="rounded-xl bg-gray-900 p-4 text-center">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>
        {value}
        <span className="text-sm text-gray-500">/{total}</span>
      </div>
      <div className="mt-1 text-xs text-gray-500">{unit}</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-800">
        <div
          className={`h-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const [data, setData] = useState<NutritionToday | null>(null);
  const [foods, setFoods] = useState<QuickFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');

  const reload = () => {
    setLoading(true);
    Promise.all([getNutritionToday(), getQuickFoods()])
      .then(([today, quick]) => {
        setData(today);
        setFoods(quick);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const handleAdd = async (food: QuickFood) => {
    await addFoodLog({ ...food, mealType: selectedMeal });
    setShowAdd(false);
    reload();
  };

  const handleDelete = async (id: string) => {
    await deleteFoodLog(id);
    reload();
  };

  const handleAutoCalc = async () => {
    await autoCalculateNutritionGoals();
    reload();
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-8">
          <p className="text-gray-500">Načítání...</p>
        </main>
      </div>
    );
  }

  const grouped = MEAL_TYPES.map((m) => ({
    ...m,
    items: data.log.filter((i) => i.mealType === m.value),
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Výživa</h1>
            <p className="text-gray-400">
              Cíl:{' '}
              <span className="text-white">{data.goals.dailyKcal} kcal</span>{' '}
              <span className="text-xs text-gray-500">({data.goals.source})</span>
            </p>
          </div>
          {data.goals.source !== 'profile' && (
            <button
              onClick={handleAutoCalc}
              className="rounded-lg bg-[#16a34a] px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Spočítat z profilu
            </button>
          )}
        </div>

        {/* Macro rings */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MacroRing label="Kalorie" value={data.totals.kcal} total={data.goals.dailyKcal} color="text-orange-400" unit="kcal" />
          <MacroRing label="Protein" value={data.totals.proteinG} total={data.goals.dailyProteinG} color="text-red-400" />
          <MacroRing label="Sacharidy" value={data.totals.carbsG} total={data.goals.dailyCarbsG} color="text-yellow-400" />
          <MacroRing label="Tuky" value={data.totals.fatG} total={data.goals.dailyFatG} color="text-blue-400" />
        </div>

        {/* Meals */}
        <div className="space-y-4">
          {grouped.map((meal) => (
            <div key={meal.value} className="rounded-xl bg-gray-900 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white">{meal.label}</h3>
                <button
                  onClick={() => {
                    setSelectedMeal(meal.value);
                    setShowAdd(true);
                  }}
                  className="text-sm text-[#16a34a] hover:underline"
                >
                  + Přidat
                </button>
              </div>
              {meal.items.length === 0 ? (
                <p className="text-sm text-gray-500">Žádné jídlo</p>
              ) : (
                <ul className="space-y-2">
                  {meal.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg bg-gray-800 p-3">
                      <div>
                        <div className="text-sm font-medium text-white">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.kcal} kcal · P {item.proteinG}g · S {item.carbsG}g · T {item.fatG}g
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-gray-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Quick add modal */}
        {showAdd && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
            onClick={() => setShowAdd(false)}
          >
            <div
              className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-gray-900 p-6 sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-semibold text-white">
                Přidat jídlo — {MEAL_TYPES.find((m) => m.value === selectedMeal)?.label}
              </h3>
              <div className="space-y-2">
                {foods.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => handleAdd(f)}
                    className="flex w-full items-center justify-between rounded-lg bg-gray-800 p-3 text-left hover:bg-gray-700"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{f.name}</div>
                      <div className="text-xs text-gray-500">
                        P {f.proteinG}g · S {f.carbsG}g · T {f.fatG}g
                      </div>
                    </div>
                    <div className="text-sm font-bold text-orange-400">{f.kcal} kcal</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
