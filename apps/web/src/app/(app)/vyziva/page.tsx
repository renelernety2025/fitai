'use client';

import { useEffect, useState } from 'react';
import { Card, Ring, SectionHeader, Button, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
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

const MEALS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

function guessCurrentMeal(): string {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 14) return 'lunch';
  if (h < 17) return 'snack';
  return 'dinner';
}

export default function NutritionPage() {
  const [data, setData] = useState<NutritionToday | null>(null);
  const [foods, setFoods] = useState<QuickFood[]>([]);
  const [tips, setTips] = useState<NutritionTip[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMeal, setCameraMeal] = useState('breakfast');
  const [meal, setMeal] = useState('breakfast');
  const [hydration, setHydration] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem(`fitai_hydration_${today}`);
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => { document.title = 'FitAI — Nutrition'; }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`fitai_hydration_${today}`, String(hydration));
  }, [hydration]);

  const reload = () => {
    getNutritionToday().then(setData).catch(console.error);
    getQuickFoods().then(setFoods).catch(console.error);
    getNutritionTips().then((r) => setTips(r.tips)).catch(console.error);
  };
  useEffect(reload, []);

  if (!data) {
    return (
      <div style={{ background: 'var(--bg-0)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="v3-eyebrow" style={{ opacity: 0.4 }}>Loading...</div>
      </div>
    );
  }

  const grouped = MEALS.map((m) => ({
    ...m,
    items: data.log.filter((i) => i.mealType === m.value),
  }));
  const kcalPct = data.goals.dailyKcal > 0
    ? Math.round((data.totals.kcal / data.goals.dailyKcal) * 100)
    : 0;
  const remaining = Math.max(0, data.goals.dailyKcal - data.totals.kcal);

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '40px 56px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="v3-eyebrow" style={{ color: 'var(--accent)', marginBottom: 12 }}>Nutrition · today</div>
          <h1 className="v3-display-2" style={{ margin: 0 }}>
            Eat for <span className="v3-clay" style={{ fontWeight: 300 }}>energy.</span>
          </h1>
        </div>
        <Button variant="accent" onClick={() => { setCameraMeal(guessCurrentMeal()); setShowCamera(true); }}>
          <FitIcon name="plus" size={14} color="#fff" />
          <span>Log a meal</span>
        </Button>
      </div>

      <NutritionHero data={data} kcalPct={kcalPct} remaining={remaining} />

      <HydrationCard count={hydration} onAdd={() => setHydration((h) => h + 1)} />

      <MealsList grouped={grouped} onAdd={(v) => { setMeal(v); setShowAdd(true); }} onReload={reload} />

      {/* Quick add modal */}
      <QuickAddModal show={showAdd} meal={meal} foods={foods} onClose={() => setShowAdd(false)} onAdd={async (f) => { await addFoodLog({ ...f, mealType: meal }); setShowAdd(false); reload(); }} />

      {showCamera && <FoodCamera mealType={cameraMeal} onClose={() => setShowCamera(false)} onLogged={reload} />}
    </div>
  );
}

function NutritionHero({ data, kcalPct, remaining }: { data: NutritionToday; kcalPct: number; remaining: number }) {
  const macros = [
    { name: 'Protein', value: data.totals.proteinG, target: data.goals.dailyProteinG, color: 'var(--accent)' },
    { name: 'Carbs', value: data.totals.carbsG, target: data.goals.dailyCarbsG, color: 'var(--sage)' },
    { name: 'Fat', value: data.totals.fatG, target: data.goals.dailyFatG, color: '#D4A88C' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 24 }}>
      <Card padding={28}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center' }}>
          <Ring value={kcalPct} size={140} stroke={10} label={String(data.totals.kcal)} sub={`of ${data.goals.dailyKcal} kcal`} />
          <div>
            <div className="v3-title" style={{ marginBottom: 16 }}>{remaining} kcal to go.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {macros.map((m) => (
                <div key={m.name}>
                  <div className="v3-eyebrow" style={{ marginBottom: 4 }}>{m.name}</div>
                  <div className="v3-numeric" style={{ fontSize: 18, color: 'var(--text-1)' }}>
                    {m.value}<span style={{ fontSize: 11, color: 'var(--text-3)' }}>/{m.target}g</span>
                  </div>
                  <div style={{ marginTop: 6, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (m.value / m.target) * 100)}%`, background: m.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <div />
    </div>
  );
}

function HydrationCard({ count, onAdd }: { count: number; onAdd: () => void }) {
  return (
    <Card padding={20} style={{ marginBottom: 24, maxWidth: 360 }}>
      <div className="v3-eyebrow" style={{ marginBottom: 8 }}>Hydration</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
        <span className="v3-numeric" style={{ fontSize: 28, color: 'var(--text-1)' }}>{(count * 0.25).toFixed(1)}</span>
        <span className="v3-caption">of 2.5 L</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, marginBottom: 14 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: i < count ? 'var(--sage)' : 'var(--bg-3)', opacity: i < count ? 1 : 0.4 }} />
        ))}
      </div>
      <Button variant="ghost" full onClick={onAdd}>+ 250ml glass</Button>
    </Card>
  );
}

function MealsList({ grouped, onAdd, onReload }: { grouped: { value: string; label: string; items: any[] }[]; onAdd: (v: string) => void; onReload: () => void }) {
  const current = guessCurrentMeal();
  return (
    <Card padding={28}>
      <SectionHeader eyebrow="Today" title="Meals" action={{ label: '+ Add', onClick: () => onAdd(current) }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {grouped.flatMap((g) => g.items).length === 0 && (
          <div className="v3-caption" style={{ padding: 20, textAlign: 'center' }}>No meals logged yet today.</div>
        )}
        {grouped.flatMap((g) => g.items).map((item) => (
          <FoodLogItem key={item.id} item={item} onDeleted={onReload} />
        ))}
      </div>
    </Card>
  );
}

function QuickAddModal({ show, meal, foods, onClose, onAdd }: { show: boolean; meal: string; foods: QuickFood[]; onClose: () => void; onAdd: (f: QuickFood) => void }) {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()}>
      <Card padding={32} style={{ maxWidth: 480, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <div className="v3-eyebrow" style={{ marginBottom: 8 }}>{MEALS.find((x) => x.value === meal)?.label}</div>
        <div className="v3-display-3" style={{ marginBottom: 20 }}>Add a meal</div>
        {foods.map((f) => (
          <div key={f.name} onClick={() => onAdd(f)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--stroke-1)', cursor: 'pointer' }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text-1)' }}>{f.name}</div>
              <div className="v3-caption">P {f.proteinG}g · C {f.carbsG}g · F {f.fatG}g</div>
            </div>
            <span className="v3-numeric" style={{ fontSize: 16, color: 'var(--text-1)' }}>{f.kcal}</span>
          </div>
        ))}
      </Card>
      </div>
    </div>
  );
}
