'use client';

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import {
  getQuickWorkout,
  getHomeWorkout,
  getTravelWorkout,
  type HomeWorkoutData,
} from '@/lib/api';

type Mode = 'quick' | 'home' | 'travel';

const MODES: { value: Mode; label: string; minutes: string; desc: string; color: string }[] = [
  { value: 'quick', label: 'Rychlý', minutes: '15 min', desc: 'Plné tělo, bez vybavení', color: '#FF375F' },
  { value: 'home', label: 'Doma', minutes: '35 min', desc: 'Plnohodnotný workout', color: '#A8FF00' },
  { value: 'travel', label: 'Na cestách', minutes: '20 min', desc: 'Hotel, byt, dovolená', color: '#00E5FF' },
];

export default function DomaV2Page() {
  const [mode, setMode] = useState<Mode>('quick');
  const [workout, setWorkout] = useState<HomeWorkoutData | null>(null);

  useEffect(() => {
    const fn = mode === 'quick' ? getQuickWorkout : mode === 'home' ? getHomeWorkout : getTravelWorkout;
    fn().then(setWorkout).catch(console.error);
  }, [mode]);

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Bez vybavení</V2SectionLabel>
        <V2Display size="xl">Doma.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Tři režimy pro tři situace. Nikdy žádná výmluva.
        </p>
      </section>

      {/* Mode tabs */}
      <div className="mb-16 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`group relative overflow-hidden rounded-3xl border p-8 text-left transition ${
              mode === m.value
                ? 'border-white bg-white/5'
                : 'border-white/10 hover:border-white/30'
            }`}
          >
            <div
              className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-3xl"
              style={{ background: m.color }}
            />
            <div className="relative">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                {m.minutes}
              </div>
              <V2Display size="sm">{m.label}</V2Display>
              <p className="mt-2 text-sm text-white/50">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {workout && (
        <section>
          <div className="mb-8 flex items-baseline justify-between">
            <V2Display size="md">{workout.title}</V2Display>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              {workout.rounds} kola · {workout.rest}
            </span>
          </div>

          <div className="space-y-1">
            {workout.exercises.map((ex, i) => (
              <div
                key={ex.id}
                className="flex items-baseline justify-between border-b border-white/8 py-6"
              >
                <div className="flex items-baseline gap-6">
                  <div className="font-bold tabular-nums text-white/30">{(i + 1).toString().padStart(2, '0')}</div>
                  <div>
                    <div className="text-lg text-white">{ex.nameCs}</div>
                    <div className="text-xs text-white/40">{ex.muscleGroups.slice(0, 3).join(', ')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white tabular-nums">{ex.reps}</div>
                  {ex.duration && <div className="text-xs text-white/40">{ex.duration}s</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </V2Layout>
  );
}
