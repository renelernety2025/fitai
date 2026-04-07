'use client';

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getAchievements, checkAchievements, type Achievement } from '@/lib/api';

const categoryColors: Record<string, string> = {
  training: '#FF375F',
  streak: '#FF9500',
  milestone: '#A8FF00',
  habits: '#00E5FF',
  exploration: '#BF5AF2',
  nutrition: '#FF9F0A',
  social: '#0A84FF',
};

const categoryLabels: Record<string, string> = {
  training: 'Trénink',
  streak: 'Série',
  milestone: 'Milníky',
  habits: 'Habity',
  exploration: 'Objevy',
  nutrition: 'Výživa',
  social: 'Komunita',
};

export default function UspechyPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Trigger check first, then load
    checkAchievements()
      .then(() => getAchievements())
      .then(setAchievements)
      .catch(console.error);
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked);
  const filtered =
    filter === 'all' ? achievements : achievements.filter((a) => a.category === filter);
  const categories = Array.from(new Set(achievements.map((a) => a.category)));

  return (
    <V2Layout>
      <section className="pt-12 pb-12">
        <V2SectionLabel>Sbírka</V2SectionLabel>
        <V2Display size="xl">Úspěchy.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          {unlocked.length} z {achievements.length} odemknutých
        </p>
      </section>

      {/* Category filter */}
      <div className="mb-12 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
            filter === 'all'
              ? 'border-white bg-white text-black'
              : 'border-white/15 text-white/60 hover:border-white/40'
          }`}
        >
          Vše
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              filter === c
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:border-white/40'
            }`}
          >
            {categoryLabels[c] || c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((a) => (
          <div
            key={a.id}
            className={`relative overflow-hidden rounded-3xl border p-6 transition ${
              a.unlocked
                ? 'border-white/15 bg-white/[0.04]'
                : 'border-white/8 bg-transparent opacity-40'
            }`}
          >
            <div
              className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-3xl"
              style={{ background: categoryColors[a.category] || '#FFF' }}
            />
            <div className="relative">
              <div className="mb-3 text-5xl">{a.icon}</div>
              <div
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: categoryColors[a.category] || '#FFF' }}
              >
                {categoryLabels[a.category] || a.category}
              </div>
              <div className="text-base font-bold text-white tracking-tight">{a.titleCs}</div>
              <div className="mt-1 text-xs text-white/50">{a.descriptionCs}</div>
              <div className="mt-3 text-[10px] font-semibold tabular-nums text-white/40">
                +{a.xpReward} XP
              </div>
              {a.unlocked && a.unlockedAt && (
                <div className="mt-1 text-[10px] text-[#A8FF00]">
                  ✓ {new Date(a.unlockedAt).toLocaleDateString('cs-CZ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </V2Layout>
  );
}
