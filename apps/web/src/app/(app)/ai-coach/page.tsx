'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import {
  getFitnessProfile,
  updateFitnessProfile,
  generateAIPlan,
  getAsymmetryReport,
  getBreakRecovery,
  type FitnessProfileData,
  type AsymmetryReport,
  type BreakRecovery,
} from '@/lib/api';

const GOALS = [
  { v: 'STRENGTH', l: 'Síla' },
  { v: 'HYPERTROPHY', l: 'Hypertrofie' },
  { v: 'ENDURANCE', l: 'Vytrvalost' },
  { v: 'WEIGHT_LOSS', l: 'Hubnutí' },
  { v: 'GENERAL_FITNESS', l: 'Obecná kondice' },
  { v: 'MOBILITY', l: 'Mobilita' },
];

const EQUIPMENT = [
  { v: 'barbell', l: 'Činka' },
  { v: 'dumbbells', l: 'Jednoručky' },
  { v: 'cables', l: 'Kladky' },
  { v: 'pullup_bar', l: 'Hrazda' },
  { v: 'bench', l: 'Lavička' },
  { v: 'rack', l: 'Rack' },
  { v: 'kettlebell', l: 'Kettlebell' },
  { v: 'resistance_bands', l: 'Gumy' },
];

const INJURIES = [
  { v: 'lower_back', l: 'Dolní záda' },
  { v: 'upper_back', l: 'Horní záda' },
  { v: 'left_shoulder', l: 'Levé rameno' },
  { v: 'right_shoulder', l: 'Pravé rameno' },
  { v: 'left_knee', l: 'Levé koleno' },
  { v: 'right_knee', l: 'Pravé koleno' },
  { v: 'wrist', l: 'Zápěstí' },
  { v: 'neck', l: 'Krk' },
];

export default function AICoachV2Page() {
  const router = useRouter();
  const [profile, setProfile] = useState<FitnessProfileData | null>(null);
  const [asymmetry, setAsymmetry] = useState<AsymmetryReport | null>(null);
  const [breakRecovery, setBreakRecovery] = useState<BreakRecovery | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([getFitnessProfile(), getAsymmetryReport(), getBreakRecovery()])
      .then(([p, a, b]) => {
        setProfile(p);
        setAsymmetry(a);
        setBreakRecovery(b);
      })
      .catch(console.error);
  }, []);

  async function save(field: string, value: any) {
    if (!profile) return;
    const updated = await updateFitnessProfile({ [field]: value });
    setProfile(updated);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const plan = await generateAIPlan();
      router.push(`/plans/${plan.id}`);
    } finally {
      setGenerating(false);
    }
  }

  if (!profile) {
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
      <section className="pt-12 pb-16">
        <V2SectionLabel>Personalizace</V2SectionLabel>
        <V2Display size="xl">AI Trenér.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Plán generovaný Claude AI podle tvých cílů, slabých míst a regenerace.
        </p>
      </section>

      {breakRecovery && (
        <div className="mb-16 rounded-3xl border border-[#FF9F0A]/30 bg-[#FF9F0A]/5 p-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FF9F0A]">
            Návrat z pauzy
          </div>
          <p className="mt-2 text-base text-white">{breakRecovery.message}</p>
          <p className="mt-1 text-sm text-white/55">
            Intenzita snížena na {Math.round(breakRecovery.intensityMultiplier * 100)} %.
          </p>
        </div>
      )}

      {/* Goal */}
      <section className="mb-16">
        <V2SectionLabel>Cíl</V2SectionLabel>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GOALS.map((g) => (
            <button
              key={g.v}
              onClick={() => save('goal', g.v)}
              className={`rounded-full border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
                profile.goal === g.v
                  ? 'border-white bg-white text-black'
                  : 'border-white/15 text-white/60 hover:border-white/40'
              }`}
            >
              {g.l}
            </button>
          ))}
        </div>
      </section>

      {/* Schedule */}
      <section className="mb-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
        <div>
          <V2SectionLabel>Zkušenosti</V2SectionLabel>
          <input
            type="number"
            min={0}
            value={profile.experienceMonths ?? 0}
            onChange={(e) => save('experienceMonths', parseInt(e.target.value) || 0)}
            className="w-full border-b border-white/15 bg-transparent py-3 text-3xl font-bold text-white tabular-nums focus:border-white focus:outline-none"
          />
          <div className="mt-1 text-xs text-white/40">měsíců</div>
        </div>
        <div>
          <V2SectionLabel>Tréninky</V2SectionLabel>
          <select
            value={profile.daysPerWeek ?? 3}
            onChange={(e) => save('daysPerWeek', parseInt(e.target.value))}
            className="w-full border-b border-white/15 bg-transparent py-3 text-3xl font-bold text-white tabular-nums focus:border-white focus:outline-none"
          >
            {[2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d} className="bg-black">
                {d}× týdně
              </option>
            ))}
          </select>
        </div>
        <div>
          <V2SectionLabel>Délka</V2SectionLabel>
          <select
            value={profile.sessionMinutes ?? 45}
            onChange={(e) => save('sessionMinutes', parseInt(e.target.value))}
            className="w-full border-b border-white/15 bg-transparent py-3 text-3xl font-bold text-white tabular-nums focus:border-white focus:outline-none"
          >
            {[30, 45, 60, 75, 90].map((m) => (
              <option key={m} value={m} className="bg-black">
                {m} min
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Equipment */}
      <section className="mb-16">
        <V2SectionLabel>Vybavení</V2SectionLabel>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((eq) => {
            const sel = profile.equipment?.includes(eq.v);
            return (
              <button
                key={eq.v}
                onClick={() => {
                  const cur = profile.equipment || [];
                  save('equipment', sel ? cur.filter((e) => e !== eq.v) : [...cur, eq.v]);
                }}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
                  sel
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-white/60 hover:border-white/40'
                }`}
              >
                {eq.l}
              </button>
            );
          })}
        </div>
      </section>

      {/* Injuries */}
      <section className="mb-16">
        <V2SectionLabel>Zranění / omezení</V2SectionLabel>
        <div className="flex flex-wrap gap-2">
          {INJURIES.map((inj) => {
            const sel = profile.injuries?.includes(inj.v);
            return (
              <button
                key={inj.v}
                onClick={() => {
                  const cur = profile.injuries || [];
                  save('injuries', sel ? cur.filter((e) => e !== inj.v) : [...cur, inj.v]);
                }}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
                  sel
                    ? 'border-[#FF375F] bg-[#FF375F] text-white'
                    : 'border-white/15 text-white/60 hover:border-white/40'
                }`}
              >
                {inj.l}
              </button>
            );
          })}
        </div>
      </section>

      {/* Generate */}
      <section className="mb-16">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105 disabled:opacity-30"
        >
          {generating ? 'AI generuje plán…' : 'Vygenerovat plán'}
          {!generating && <span className="transition group-hover:translate-x-1">→</span>}
        </button>
      </section>

      {/* Asymmetry */}
      {asymmetry && (
        <section className="mb-16">
          <V2SectionLabel>Analýza těla</V2SectionLabel>
          {asymmetry.asymmetries.length > 0 ? (
            <div className="space-y-1">
              {asymmetry.asymmetries.map((a, i) => (
                <div key={i} className="border-b border-white/8 py-6">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FF375F]">
                    Asymetrie · {a.count}× detekováno
                  </div>
                  <V2Display size="sm">{a.joint}</V2Display>
                  <p className="mt-2 text-sm text-white/55">{a.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/40">Žádné asymetrie nezjištěny.</p>
          )}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Únava
            </div>
            <p className="mt-2 text-base text-white/75">
              Forma klesá o{' '}
              <span
                className={
                  asymmetry.fatigue.dropPercentage > 15 ? 'text-[#FF375F]' : 'text-[#A8FF00]'
                }
              >
                {asymmetry.fatigue.dropPercentage}%
              </span>{' '}
              v posledních setech.
            </p>
            <p className="mt-1 text-sm text-white/40">{asymmetry.fatigue.recommendation}</p>
          </div>
        </section>
      )}
    </V2Layout>
  );
}
