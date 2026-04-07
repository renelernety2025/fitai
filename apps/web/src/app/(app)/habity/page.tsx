'use client';

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display, V2Ring } from '@/components/v2/V2Layout';
import {
  getHabitsToday,
  updateHabitsToday,
  getHabitsStats,
  getHabitsHistory,
  type DailyCheckIn,
  type HabitsStats,
} from '@/lib/api';

function Scale1to5({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="mb-10">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`h-14 flex-1 rounded-2xl border text-2xl font-bold transition ${
              value === n
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:border-white/40'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {hint && <div className="mt-2 text-xs text-white/40">{hint}</div>}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  unit,
  step = 0.5,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  unit?: string;
  step?: number;
  placeholder?: string;
}) {
  return (
    <div className="mb-10">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {label}
        {unit && <span className="ml-1 text-white/30">({unit})</span>}
      </div>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
        placeholder={placeholder}
        className="w-full border-b border-white/15 bg-transparent py-3 text-3xl font-bold text-white tabular-nums focus:border-white focus:outline-none"
      />
    </div>
  );
}

export default function HabityPage() {
  const [today, setToday] = useState<DailyCheckIn | null>(null);
  const [stats, setStats] = useState<HabitsStats | null>(null);
  const [history, setHistory] = useState<DailyCheckIn[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const reload = () => {
    getHabitsToday().then(setToday).catch(console.error);
    getHabitsStats().then(setStats).catch(console.error);
    getHabitsHistory(14).then(setHistory).catch(console.error);
  };
  useEffect(reload, []);

  const update = async (patch: Partial<DailyCheckIn>) => {
    if (!today) return;
    setToday({ ...today, ...patch });
    setSaving(true);
    try {
      const updated = await updateHabitsToday(patch);
      setToday(updated);
      setSavedAt(new Date());
      const newStats = await getHabitsStats();
      setStats(newStats);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!today) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-12">
        <V2SectionLabel>Dnes</V2SectionLabel>
        <V2Display size="xl">Jak ti je?</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Krátký denní check-in. Pomáhá AI nastavit intenzitu a odhalit přetrénování dřív než tě dohoní.
        </p>
      </section>

      {/* Recovery score ring */}
      {stats && stats.recoveryScore != null && (
        <section className="mb-24 flex flex-col items-center">
          <V2Ring
            value={stats.recoveryScore}
            total={100}
            size={220}
            color="#A8FF00"
            label="Recovery score"
            unit="bodů"
          />
          <div className="mt-6 grid grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Spánek 7d
              </div>
              <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                {stats.avgSleep ?? '—'}
                <span className="text-sm text-white/30"> h</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Energie 7d
              </div>
              <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                {stats.avgEnergy ?? '—'}
                <span className="text-sm text-white/30">/5</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Streak
              </div>
              <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                {stats.streakDays}
                <span className="text-sm text-white/30"> dní</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Today's check-in form */}
      <section className="mb-24">
        <div className="mb-8 flex items-baseline justify-between">
          <V2Display size="md">Dnešní check-in</V2Display>
          {savedAt && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A8FF00]">
              ✓ Uloženo
            </span>
          )}
        </div>

        <NumberInput
          label="Spánek"
          unit="hodin"
          value={today.sleepHours}
          onChange={(v) => update({ sleepHours: v })}
          step={0.5}
          placeholder="8"
        />
        <Scale1to5
          label="Kvalita spánku"
          value={today.sleepQuality}
          onChange={(v) => update({ sleepQuality: v })}
          hint="1 = hrozný · 5 = vynikající"
        />
        <Scale1to5
          label="Energie"
          value={today.energy}
          onChange={(v) => update({ energy: v })}
          hint="Jak se cítíš fyzicky"
        />
        <Scale1to5
          label="Bolest svalů"
          value={today.soreness}
          onChange={(v) => update({ soreness: v })}
          hint="1 = žádná · 5 = silná"
        />
        <Scale1to5
          label="Stres"
          value={today.stress}
          onChange={(v) => update({ stress: v })}
          hint="1 = klid · 5 = vysoký"
        />
        <Scale1to5
          label="Nálada"
          value={today.mood}
          onChange={(v) => update({ mood: v })}
        />
        <NumberInput
          label="Voda"
          unit="litrů"
          value={today.hydrationL}
          onChange={(v) => update({ hydrationL: v })}
          step={0.25}
          placeholder="2.5"
        />
        <NumberInput
          label="Kroky"
          value={today.steps}
          onChange={(v) => update({ steps: v })}
          step={500}
          placeholder="8000"
        />
      </section>

      {/* History */}
      {history.length > 0 && (
        <section className="mb-24">
          <V2SectionLabel>Posledních 14 dní</V2SectionLabel>
          <div className="space-y-1">
            {history.map((h) => {
              const d = new Date(h.date as any);
              return (
                <div
                  key={h.id || (h.date as any)}
                  className="flex items-center justify-between border-b border-white/8 py-4"
                >
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      {d.toLocaleDateString('cs-CZ', { weekday: 'short' })}
                    </div>
                    <div className="text-base text-white tabular-nums">
                      {d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm text-white/60 tabular-nums">
                    {h.sleepHours != null && (
                      <span>
                        💤 {h.sleepHours}<span className="text-white/30">h</span>
                      </span>
                    )}
                    {h.energy != null && (
                      <span>
                        ⚡ {h.energy}<span className="text-white/30">/5</span>
                      </span>
                    )}
                    {h.soreness != null && (
                      <span>
                        🩹 {h.soreness}<span className="text-white/30">/5</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </V2Layout>
  );
}
