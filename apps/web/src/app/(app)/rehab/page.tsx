'use client';

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getRehabPlans, createRehabPlan, logRehabSession, getRehabSessions } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  active: '#A8FF00',
  completed: '#00E5FF',
  paused: '#FF9500',
};

const BODY_PARTS = [
  'Koleno', 'Rameno', 'Zada', 'Kotnik', 'Zapesti', 'Krk', 'Kycel', 'Loket',
];

const SEVERITIES = [
  { value: 'mild', label: 'Mirna' },
  { value: 'moderate', label: 'Stredni' },
  { value: 'severe', label: 'Vazna' },
];

export default function RehabPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ injuryType: '', bodyPart: 'Koleno', severity: 'mild' });
  const [logForm, setLogForm] = useState({ painLevel: 5, notes: '', exercises: [] as string[] });

  useEffect(() => { document.title = 'FitAI — Rehabilitace'; }, []);

  useEffect(() => {
    getRehabPlans()
      .then(setPlans)
      .catch(() => setError('Nepodarilo se nacist plany'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!form.injuryType) return;
    const plan = await createRehabPlan(form);
    setPlans((p) => [...p, plan]);
    setShowCreate(false);
    setForm({ injuryType: '', bodyPart: 'Koleno', severity: 'mild' });
  }

  async function selectPlan(plan: any) {
    setSelected(plan);
    setShowLog(false);
    try {
      const s = await getRehabSessions(plan.id);
      setSessions(s);
    } catch {
      setSessions([]);
    }
  }

  async function handleLog() {
    if (!selected) return;
    const session = await logRehabSession(selected.id, logForm);
    setSessions((p) => [...p, session]);
    setShowLog(false);
    setLogForm({ painLevel: 5, notes: '', exercises: [] });
  }

  if (loading) {
    return (
      <V2Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#A8FF00]" />
        </div>
      </V2Layout>
    );
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Regenerace</V2SectionLabel>
        <V2Display size="xl">Rehab.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Plany rehabilitace s AI. Sleduj bolest, loguj sessions, zotav se rychleji.
        </p>
      </section>

      {error && (
        <div className="mb-6 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
          {error}
        </div>
      )}

      <button onClick={() => setShowCreate((p) => !p)}
        className="mb-8 rounded-full border border-[#A8FF00]/30 px-6 py-2.5 text-sm font-semibold text-[#A8FF00] transition hover:bg-[#A8FF00]/10"
      >
        + Novy plan
      </button>

      {showCreate && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/3 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input type="text" placeholder="Typ zraneni (napr. natazeny vaz)" value={form.injuryType}
              onChange={(e) => setForm({ ...form, injuryType: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            />
            <select value={form.bodyPart} onChange={(e) => setForm({ ...form, bodyPart: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              {BODY_PARTS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <button onClick={handleCreate}
            className="mt-4 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Vytvorit (AI vygeneruje plan)
          </button>
        </div>
      )}

      {/* Empty state */}
      {plans.length === 0 && !error && (
        <div className="py-16 text-center text-white/30">
          <p className="text-lg">Zatim zadne rehab plany</p>
          <p className="mt-2 text-sm">Vytvor prvni plan a AI ti sestavi cviceni.</p>
        </div>
      )}

      {/* Plans grid */}
      <section className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <button key={plan.id} onClick={() => selectPlan(plan)}
            className={`rounded-2xl border p-5 text-left transition hover:border-white/25 hover:bg-white/[0.02] ${
              selected?.id === plan.id ? 'border-[#A8FF00]/40 bg-[#A8FF00]/5' : 'border-white/8'
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[plan.status] || '#FFF' }} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: STATUS_COLORS[plan.status] || '#FFF' }}
              >
                {plan.status}
              </span>
            </div>
            <div className="text-lg font-bold text-white">{plan.injuryType}</div>
            <div className="mt-1 text-xs text-white/40">{plan.bodyPart} · {plan.severity}</div>
          </button>
        ))}
      </section>

      {/* Plan detail */}
      {selected && (
        <section className="mb-16">
          <V2SectionLabel>Plan: {selected.injuryType}</V2SectionLabel>

          {/* Phases timeline */}
          {selected.phases && (
            <div className="mb-8 flex gap-2">
              {selected.phases.map((phase: any, i: number) => (
                <div key={i} className={`flex-1 rounded-xl border p-4 ${
                  phase.current ? 'border-[#A8FF00]/30 bg-[#A8FF00]/5' : 'border-white/8'
                }`}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    Faze {i + 1}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">{phase.name}</div>
                  {phase.exercises && (
                    <ul className="mt-2 space-y-1">
                      {phase.exercises.map((ex: string, j: number) => (
                        <li key={j} className="text-xs text-white/50">{ex}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setShowLog((p) => !p)}
            className="mb-6 rounded-full border border-[#00E5FF]/30 px-6 py-2.5 text-sm font-semibold text-[#00E5FF] transition hover:bg-[#00E5FF]/10"
          >
            Zalogovat session
          </button>

          {showLog && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/3 p-6">
              <div className="mb-4">
                <label className="mb-2 block text-xs font-semibold text-white/50">
                  Bolest (0-10): {logForm.painLevel}
                </label>
                <input type="range" min={0} max={10} value={logForm.painLevel}
                  onChange={(e) => setLogForm({ ...logForm, painLevel: parseInt(e.target.value) })}
                  className="w-full accent-[#FF375F]"
                />
                <div className="flex justify-between text-[9px] text-white/30">
                  <span>Zadna</span><span>Nesnesitelna</span>
                </div>
              </div>
              <textarea placeholder="Poznamky..." value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                className="mb-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
                rows={3}
              />
              <button onClick={handleLog}
                className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Zalogovat
              </button>
            </div>
          )}

          {/* Session history */}
          {sessions.length > 0 && (
            <div className="space-y-2">
              <V2SectionLabel>Historie sessions</V2SectionLabel>
              {sessions.map((s, i) => (
                <div key={s.id || i} className="flex items-center justify-between rounded-xl border border-white/8 px-5 py-3">
                  <span className="text-sm text-white">{s.date || s.createdAt?.slice(0, 10)}</span>
                  <span className={`text-sm font-bold tabular-nums ${s.painLevel <= 3 ? 'text-[#A8FF00]' : s.painLevel <= 6 ? 'text-[#FF9500]' : 'text-[#FF375F]'}`}>
                    Bolest: {s.painLevel}/10
                  </span>
                  {s.notes && <span className="text-xs text-white/40">{s.notes}</span>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </V2Layout>
  );
}
