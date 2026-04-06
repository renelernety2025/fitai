'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import {
  getFitnessProfile, updateFitnessProfile, generateAIPlan,
  getAsymmetryReport, getBreakRecovery, getHomeAlternative,
  type FitnessProfileData, type AsymmetryReport, type BreakRecovery,
} from '@/lib/api';

const GOALS = [
  { value: 'STRENGTH', label: 'Síla', desc: 'Nízké repy, vysoká váha' },
  { value: 'HYPERTROPHY', label: 'Hypertrofie', desc: 'Střední repy, růst svalů' },
  { value: 'ENDURANCE', label: 'Vytrvalost', desc: 'Vysoké repy, nízká váha' },
  { value: 'WEIGHT_LOSS', label: 'Hubnutí', desc: 'Kombomance kardio + síla' },
  { value: 'GENERAL_FITNESS', label: 'Obecná kondice', desc: 'Vyvážený trénink' },
  { value: 'MOBILITY', label: 'Mobilita', desc: 'Flexibilita a pohyblivost' },
];

const EQUIPMENT = [
  { value: 'barbell', label: 'Činka' },
  { value: 'dumbbells', label: 'Jednoručky' },
  { value: 'cables', label: 'Kladky' },
  { value: 'pullup_bar', label: 'Hrazda' },
  { value: 'bench', label: 'Lavička' },
  { value: 'rack', label: 'Rack' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'resistance_bands', label: 'Gumy' },
];

const INJURIES = [
  { value: 'lower_back', label: 'Dolní záda' },
  { value: 'upper_back', label: 'Horní záda' },
  { value: 'left_shoulder', label: 'Levé rameno' },
  { value: 'right_shoulder', label: 'Pravé rameno' },
  { value: 'left_knee', label: 'Levé koleno' },
  { value: 'right_knee', label: 'Pravé koleno' },
  { value: 'wrist', label: 'Zápěstí' },
  { value: 'neck', label: 'Krk' },
];

export default function AICoachPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<FitnessProfileData | null>(null);
  const [asymmetry, setAsymmetry] = useState<AsymmetryReport | null>(null);
  const [breakRecovery, setBreakRecovery] = useState<BreakRecovery | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFitnessProfile(),
      getAsymmetryReport(),
      getBreakRecovery(),
    ]).then(([p, a, b]) => {
      setProfile(p);
      setAsymmetry(a);
      setBreakRecovery(b);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(field: string, value: any) {
    if (!profile) return;
    const updated = await updateFitnessProfile({ [field]: value });
    setProfile(updated);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const plan = await generateAIPlan();
      router.push(`/plans/${plan.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a]"><Header /><div className="flex justify-center py-20"><p className="text-gray-500">Načítání...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-bold text-white">AI Trenér</h1>
        <p className="mb-8 text-gray-400">Personalizovaný tréninkový plán na základě tvých cílů a dat.</p>

        {/* Break recovery banner */}
        {breakRecovery && (
          <div className="mb-6 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-5">
            <p className="text-sm font-medium text-[#F59E0B]">{breakRecovery.message}</p>
            <p className="mt-1 text-xs text-gray-400">
              Intenzita bude automaticky snížena na {Math.round(breakRecovery.intensityMultiplier * 100)}%.
            </p>
          </div>
        )}

        {/* Fitness Profile */}
        <div className="mb-8 rounded-xl bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Tvůj profil</h2>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Cíl</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => handleSaveProfile('goal', g.value)}
                  className={`rounded-lg p-3 text-left transition ${
                    profile?.goal === g.value
                      ? 'bg-[#16a34a] text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <p className="text-sm font-medium">{g.label}</p>
                  <p className="text-xs opacity-70">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Zkušenosti (měsíce)</label>
              <input
                type="number" min={0}
                value={profile?.experienceMonths ?? 0}
                onChange={(e) => handleSaveProfile('experienceMonths', parseInt(e.target.value) || 0)}
                className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Tréninky/týden</label>
              <select
                value={profile?.daysPerWeek ?? 3}
                onChange={(e) => handleSaveProfile('daysPerWeek', parseInt(e.target.value))}
                className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
              >
                {[2, 3, 4, 5, 6].map((d) => <option key={d} value={d}>{d}x</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Délka tréninku</label>
              <select
                value={profile?.sessionMinutes ?? 45}
                onChange={(e) => handleSaveProfile('sessionMinutes', parseInt(e.target.value))}
                className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
              >
                {[30, 45, 60, 75, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={profile?.hasGymAccess ?? true}
                onChange={(e) => handleSaveProfile('hasGymAccess', e.target.checked)}
                className="rounded"
              />
              Mám přístup do fitka
            </label>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Vybavení</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((eq) => {
                const selected = profile?.equipment?.includes(eq.value);
                return (
                  <button
                    key={eq.value}
                    onClick={() => {
                      const current = profile?.equipment || [];
                      const updated = selected
                        ? current.filter((e) => e !== eq.value)
                        : [...current, eq.value];
                      handleSaveProfile('equipment', updated);
                    }}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      selected ? 'bg-[#16a34a] text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {eq.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm text-gray-400">Zranění / omezení</label>
            <div className="flex flex-wrap gap-2">
              {INJURIES.map((inj) => {
                const selected = profile?.injuries?.includes(inj.value);
                return (
                  <button
                    key={inj.value}
                    onClick={() => {
                      const current = profile?.injuries || [];
                      const updated = selected
                        ? current.filter((e) => e !== inj.value)
                        : [...current, inj.value];
                      handleSaveProfile('injuries', updated);
                    }}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      selected ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {inj.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mb-8 w-full rounded-xl bg-[#16a34a] py-4 text-lg font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {generating ? 'AI generuje plán...' : 'Vygenerovat personalizovaný plán'}
        </button>

        {/* Asymmetry Report */}
        {asymmetry && (
          <div className="mb-8 rounded-xl bg-gray-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Analýza těla</h2>

            {asymmetry.asymmetries.length > 0 ? (
              <div className="mb-4 space-y-2">
                {asymmetry.asymmetries.map((a, i) => (
                  <div key={i} className="rounded-lg bg-red-900/20 border border-red-800/30 p-3">
                    <p className="text-sm font-medium text-red-400">Asymetrie: {a.joint} ({a.count}x detekováno)</p>
                    <p className="text-xs text-gray-400">{a.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-sm text-gray-400">Žádné asymetrie nezjištěny.</p>
            )}

            <div className="rounded-lg bg-gray-800 p-4">
              <p className="text-sm text-gray-300">
                Únava: forma klesá o <span className={asymmetry.fatigue.dropPercentage > 15 ? 'text-red-400 font-medium' : 'text-green-400'}>{asymmetry.fatigue.dropPercentage}%</span> v posledních setech
              </p>
              <p className="mt-1 text-xs text-gray-500">{asymmetry.fatigue.recommendation}</p>
            </div>
          </div>
        )}

        {/* Home alternative */}
        {profile && !profile.hasGymAccess && (
          <div className="rounded-xl bg-gray-900 p-6">
            <h2 className="mb-2 text-lg font-semibold text-white">Domácí alternativa</h2>
            <p className="mb-4 text-sm text-gray-400">Cviky bez vybavení, které můžeš dělat kdekoli.</p>
            <button
              onClick={() => getHomeAlternative().then(console.log)}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              Zobrazit domácí plán
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
