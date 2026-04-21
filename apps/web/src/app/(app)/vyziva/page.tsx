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
  getNutritionTips,
  type NutritionToday,
  type QuickFood,
  type NutritionTip,
} from '@/lib/api';
import FoodCamera from '@/components/nutrition/FoodCamera';
import FoodLogItem from '@/components/nutrition/FoodLogItem';

const nutritionTipColors: Record<string, string> = {
  protein: '#FF375F',
  hydration: '#0A84FF',
  timing: '#FF9500',
  macros: '#A8FF00',
  quality: '#BF5AF2',
};

const MEALS = [
  { value: 'breakfast', label: 'Snídaně' },
  { value: 'lunch', label: 'Oběd' },
  { value: 'dinner', label: 'Večeře' },
  { value: 'snack', label: 'Svačina' },
];

/** Guess current meal type based on time of day. */
function guessCurrentMeal(): string {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 17) return 'snack';
  return 'dinner';
}

export default function NutritionV2Page() {
  const [data, setData] = useState<NutritionToday | null>(null);
  const [foods, setFoods] = useState<QuickFood[]>([]);
  const [tips, setTips] = useState<NutritionTip[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMeal, setCameraMeal] = useState('breakfast');
  const [meal, setMeal] = useState('breakfast');

  const reload = () => {
    getNutritionToday().then(setData).catch(console.error);
    getQuickFoods().then(setFoods).catch(console.error);
    getNutritionTips().then((r) => setTips(r.tips)).catch(console.error);
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

      {/* Photo recognition button */}
      <section className="mb-24 flex justify-center">
        <button
          onClick={() => { setCameraMeal(guessCurrentMeal()); setShowCamera(true); }}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-5 transition hover:border-white/20 hover:bg-white/[0.06]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8FF00" strokeWidth="1.5" strokeLinecap="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <div className="text-left">
            <div className="text-sm font-bold text-white">Vyfotit jidlo</div>
            <div className="text-[11px] text-white/40">AI rozpozna makra z fotky</div>
          </div>
        </button>
      </section>

      {/* Quick add chips */}
      {foods.length > 0 && (
        <section className="mb-24">
          <V2SectionLabel>Rychle pridat</V2SectionLabel>
          <div className="flex flex-wrap gap-2">
            {foods.slice(0, 8).map((f) => (
              <button
                key={f.name}
                onClick={() => addFoodLog({ ...f, mealType: guessCurrentMeal() }).then(reload)}
                className="rounded-full border border-white/10 px-4 py-2 text-[11px] text-white/60 transition hover:border-white/25 hover:bg-white/5 hover:text-white"
              >
                {f.name} <span className="tabular-nums text-white/30">{f.kcal}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* AI nutrition tips */}
      {tips.length > 0 && (
        <section className="mb-24">
          <V2SectionLabel>AI doporučení</V2SectionLabel>
          <div className="space-y-1">
            {tips.map((t, i) => (
              <div key={i} className="border-b border-white/8 py-6">
                <div
                  className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em]"
                  style={{ color: nutritionTipColors[t.category] || '#FFF' }}
                >
                  {t.category} · {t.priority}
                </div>
                <V2Display size="md">{t.title}</V2Display>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">{t.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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
              <div className="text-sm text-white/30">Zadne jidlo</div>
            ) : (
              <ul>
                {m.items.map((item) => (
                  <FoodLogItem key={item.id} item={item} onDeleted={reload} />
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Food camera modal */}
      {showCamera && (
        <FoodCamera
          mealType={cameraMeal}
          onClose={() => setShowCamera(false)}
          onLogged={reload}
        />
      )}

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
