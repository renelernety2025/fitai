'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, SectionHeader, Metric } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getCurrentMealPlan,
  generateMealPlan,
  type MealPlan,
  type MealPlanMeal,
} from '@/lib/api';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MEAL_LABEL: Record<string, string> = { breakfast: 'Breakfast', snack: 'Snack', lunch: 'Lunch', dinner: 'Dinner' };

export default function MealPlanPage() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [showShopping, setShowShopping] = useState(false);
  const [prefs, setPrefs] = useState({ preferences: '', allergies: '', cuisine: '' });
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => { document.title = 'FitAI — Meal Plan'; }, []);

  useEffect(() => {
    getCurrentMealPlan().then(setPlan).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function regenerate() {
    setGenerating(true);
    try {
      const opts: Record<string, unknown> = {};
      if (prefs.preferences) opts.preferences = prefs.preferences;
      if (prefs.allergies) opts.allergies = prefs.allergies.split(',').map((a) => a.trim()).filter(Boolean);
      if (prefs.cuisine) opts.cuisine = prefs.cuisine;
      const fresh = await generateMealPlan(opts);
      setPlan(fresh);
      setShowPrefs(false);
      setActiveDay(0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Generation failed: ${msg}`);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-0)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="v3-eyebrow" style={{ opacity: 0.4 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '40px 56px' }}>
      <MealPlanHeader generating={generating} onRegenerate={regenerate} onGrocery={() => setShowShopping((s) => !s)} onPrefs={() => setShowPrefs((s) => !s)} showPrefs={showPrefs} />

      {!plan && <EmptyState generating={generating} onGenerate={regenerate} />}

      {plan && (
        <>
          <TargetsStrip plan={plan} />
          {showPrefs && <PrefsPanel prefs={prefs} setPrefs={setPrefs} />}
          {showShopping && plan.payload.shoppingList && <ShoppingList list={plan.payload.shoppingList} />}
          <WeeklyGrid plan={plan} activeDay={activeDay} onDayClick={setActiveDay} />
          {plan.payload.days[activeDay] && <DayDetail day={plan.payload.days[activeDay]} />}
        </>
      )}
    </div>
  );
}

function MealPlanHeader({ generating, onRegenerate, onGrocery, onPrefs, showPrefs }: { generating: boolean; onRegenerate: () => void; onGrocery: () => void; onPrefs: () => void; showPrefs: boolean }) {
  return (
    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Meal plan</div>
        <h1 className="v3-display-2" style={{ margin: 0 }}>
          Your week,<br /><span className="v3-clay" style={{ fontWeight: 300 }}>planned.</span>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" onClick={onPrefs}>
          <FitIcon name="settings" size={14} /><span>{showPrefs ? 'Hide prefs' : 'Preferences'}</span>
        </Button>
        <Button variant="ghost" onClick={onRegenerate} disabled={generating}>
          <FitIcon name="bolt" size={14} /><span>{generating ? 'Generating...' : 'Regenerate'}</span>
        </Button>
        <Button variant="accent" onClick={onGrocery}>
          <FitIcon name="apple" size={14} color="#fff" /><span>Grocery list</span>
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ generating, onGenerate }: { generating: boolean; onGenerate: () => void }) {
  return (
    <Card padding={48} style={{ textAlign: 'center', marginBottom: 32, border: '1px dashed var(--stroke-2)' }}>
      <div className="v3-display-3" style={{ marginBottom: 12 }}>No plan for this week</div>
      <div className="v3-caption" style={{ marginBottom: 24 }}>Generate a personalized 7-day meal plan with AI.</div>
      <Button variant="accent" onClick={onGenerate} disabled={generating}>{generating ? 'Generating (~10-20s)...' : 'Generate plan'}</Button>
    </Card>
  );
}

function TargetsStrip({ plan }: { plan: MealPlan }) {
  const targets = [
    { label: 'Daily kcal', value: String(plan.payload.avgKcalPerDay) },
    { label: 'Protein', value: `${plan.payload.avgProteinG}g` },
    { label: 'Carbs', value: `${plan.payload.days[0]?.totals?.carbsG ?? 0}g` },
    { label: 'Fat', value: `${plan.payload.days[0]?.totals?.fatG ?? 0}g` },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
      {targets.map((t) => (
        <Card key={t.label} padding={20}>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>{t.label}</div>
          <div className="v3-numeric" style={{ fontSize: 32, color: 'var(--text-1)' }}>{t.value}</div>
        </Card>
      ))}
    </div>
  );
}

function PrefsPanel({ prefs, setPrefs }: { prefs: { preferences: string; allergies: string; cuisine: string }; setPrefs: (p: typeof prefs) => void }) {
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 8, color: 'var(--text-1)', fontSize: 13 };
  return (
    <Card padding={24} style={{ marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>Preferences</div>
          <input value={prefs.preferences} onChange={(e) => setPrefs({ ...prefs, preferences: e.target.value })} placeholder="e.g. minimal prep" style={inputStyle} />
        </div>
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>Allergies</div>
          <input value={prefs.allergies} onChange={(e) => setPrefs({ ...prefs, allergies: e.target.value })} placeholder="gluten, lactose" style={inputStyle} />
        </div>
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>Cuisine</div>
          <input value={prefs.cuisine} onChange={(e) => setPrefs({ ...prefs, cuisine: e.target.value })} placeholder="Czech + Asian" style={inputStyle} />
        </div>
      </div>
    </Card>
  );
}

function ShoppingList({ list }: { list: { category: string; items: { name: string; qty: number; unit: string }[] }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
      {list.map((cat) => (
        <Card key={cat.category} padding={20}>
          <div className="v3-eyebrow" style={{ marginBottom: 12 }}>{cat.category}</div>
          {cat.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
              <span style={{ color: 'var(--text-2)' }}>{item.name}</span>
              <span className="v3-numeric" style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.qty} {item.unit}</span>
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
}

function WeeklyGrid({ plan, activeDay, onDayClick }: { plan: MealPlan; activeDay: number; onDayClick: (i: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
      {plan.payload.days.map((day, i) => (
        <button key={i} onClick={() => onDayClick(i)} style={{
          flex: '0 0 auto', minWidth: 80, padding: '12px 16px', textAlign: 'center',
          background: i === activeDay ? 'var(--accent)' : 'var(--bg-card)',
          border: `1px solid ${i === activeDay ? 'var(--accent)' : 'var(--stroke-1)'}`,
          borderRadius: 'var(--r-lg)', cursor: 'pointer', color: i === activeDay ? '#fff' : 'var(--text-1)',
        }}>
          <div className="v3-eyebrow" style={{ color: 'inherit', marginBottom: 4 }}>{day.dayName.slice(0, 3)}</div>
          <div className="v3-numeric" style={{ fontSize: 12, opacity: 0.7 }}>{day.totals.kcal} kcal</div>
        </button>
      ))}
    </div>
  );
}

function DayDetail({ day }: { day: MealPlan['payload']['days'][number] }) {
  return (
    <Card padding={28}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="v3-display-3">{day.dayName}</div>
        <div className="v3-caption">P {day.totals.proteinG}g · C {day.totals.carbsG}g · F {day.totals.fatG}g</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {day.meals.map((meal, i) => (
          <MealCard key={i} meal={meal} />
        ))}
      </div>
    </Card>
  );
}

function MealCard({ meal }: { meal: MealPlanMeal }) {
  return (
    <div style={{ padding: 18, background: 'var(--bg-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Tag color="var(--accent)">{MEAL_LABEL[meal.type] || meal.type}</Tag>
        <span className="v3-caption">{meal.prepMinutes} min</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>{meal.name}</div>
      <div className="v3-caption" style={{ marginBottom: 8 }}>{meal.kcal} kcal · P {meal.proteinG}g · C {meal.carbsG}g · F {meal.fatG}g</div>
      {meal.ingredients.length > 0 && (
        <div className="v3-caption" style={{ lineHeight: 1.6 }}>
          {meal.ingredients.slice(0, 4).map((ing, i) => <span key={i}>· {ing}<br /></span>)}
          {meal.ingredients.length > 4 && <span style={{ color: 'var(--text-3)' }}>+{meal.ingredients.length - 4} more</span>}
        </div>
      )}
    </div>
  );
}
