'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getExercises, type ExerciseData } from '@/lib/api';
import { isFavorite, toggleFavorite, getFavoriteIds } from '@/lib/favorites';

const MUSCLES = [
  { v: 'ALL', l: 'Vše' },
  { v: 'CHEST', l: 'Prsa' },
  { v: 'BACK', l: 'Záda' },
  { v: 'SHOULDERS', l: 'Ramena' },
  { v: 'BICEPS', l: 'Biceps' },
  { v: 'TRICEPS', l: 'Triceps' },
  { v: 'QUADRICEPS', l: 'Stehna' },
  { v: 'HAMSTRINGS', l: 'Zadní stehna' },
  { v: 'GLUTES', l: 'Hýždě' },
  { v: 'CORE', l: 'Core' },
];

const diffLabel: Record<string, string> = {
  BEGINNER: 'Začátečník',
  INTERMEDIATE: 'Pokročilý',
  ADVANCED: 'Expert',
};

const diffAccent: Record<string, string> = {
  BEGINNER: '#A8FF00',
  INTERMEDIATE: '#00E5FF',
  ADVANCED: '#FF375F',
};

const DIFFICULTIES = [
  { v: 'ALL', l: 'Vše', color: '#FFF' },
  { v: 'BEGINNER', l: 'Začátečník', color: '#A8FF00' },
  { v: 'INTERMEDIATE', l: 'Pokročilý', color: '#00E5FF' },
  { v: 'ADVANCED', l: 'Expert', color: '#FF375F' },
];

export default function ExercisesV2Page() {
  const [allExercises, setAllExercises] = useState<ExerciseData[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [diffFilter, setDiffFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showFavs, setShowFavs] = useState(false);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getExercises().then(setAllExercises).catch(console.error);
    setFavIds(new Set(getFavoriteIds()));
  }, []);

  function handleToggleFav(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    setFavIds(new Set(getFavoriteIds()));
  }

  const exercises = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allExercises.filter((ex) => {
      if (showFavs && !favIds.has(ex.id)) return false;
      if (filter !== 'ALL' && !ex.muscleGroups.includes(filter)) return false;
      if (diffFilter !== 'ALL' && ex.difficulty !== diffFilter) return false;
      if (q && !ex.nameCs.toLowerCase().includes(q) && !ex.name.toLowerCase().includes(q)
        && !ex.muscleGroups.some((g) => g.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [allExercises, filter, diffFilter, search, showFavs, favIds]);

  return (
    <V2Layout>
      <section className="pt-12 pb-12">
        <V2SectionLabel>Knihovna</V2SectionLabel>
        <V2Display size="xl">Cviky.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Detailní instrukce, fáze pohybu, dýchání, tempo. Forma má přednost před váhou.
        </p>
      </section>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledej cvik..."
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-white/25"
        />
        <button
          onClick={() => setShowFavs((p) => !p)}
          className={`rounded-xl border px-4 py-3 text-sm transition ${
            showFavs
              ? 'border-[#FF375F] bg-[#FF375F]/10 text-[#FF375F]'
              : 'border-white/10 text-white/40 hover:text-white'
          }`}
        >
          {showFavs ? 'Oblibene' : 'Vse'}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {MUSCLES.map((m) => (
          <button
            key={m.v}
            onClick={() => setFilter(m.v)}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              filter === m.v
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            {m.l}
          </button>
        ))}
      </div>
      <div className="mb-16 flex flex-wrap gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.v}
            onClick={() => setDiffFilter(d.v)}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              diffFilter === d.v
                ? 'text-black'
                : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
            }`}
            style={diffFilter === d.v ? { borderColor: d.color, backgroundColor: d.color } : undefined}
          >
            {d.l}
          </button>
        ))}
      </div>

      <div className="mb-6 text-[11px] font-semibold tabular-nums text-white/30">
        {exercises.length} {exercises.length === 1 ? 'cvik' : exercises.length < 5 ? 'cviky' : 'cviku'}
      </div>

      {exercises.length === 0 && allExercises.length > 0 && (
        <div className="py-16 text-center">
          <p className="text-lg text-white/30">Zadny cvik neodpovida filtrum</p>
          <button
            onClick={() => { setFilter('ALL'); setDiffFilter('ALL'); setSearch(''); }}
            className="mt-4 text-sm text-[#A8FF00]/60 transition hover:text-[#A8FF00]"
          >
            Zrusit filtry
          </button>
        </div>
      )}

      <section className="space-y-1">
        {exercises.map((ex) => (
          <Link
            key={ex.id}
            href={`/exercises/${ex.id}`}
            className="group flex items-baseline justify-between border-b border-white/8 py-8 transition hover:border-white/30"
          >
            <div className="flex-1 pr-6">
              <div
                className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: diffAccent[ex.difficulty] || '#FFF' }}
              >
                {diffLabel[ex.difficulty]} · {ex.muscleGroups.slice(0, 3).join(', ')}
              </div>
              <V2Display size="md">{ex.nameCs}</V2Display>
              <p className="mt-2 max-w-xl text-sm text-white/50 line-clamp-1">
                {ex.descriptionCs}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleToggleFav(ex.id, e)}
                className={`text-lg transition ${favIds.has(ex.id) ? 'text-[#FF375F]' : 'text-white/15 hover:text-white/40'}`}
              >
                {favIds.has(ex.id) ? '\u2665' : '\u2661'}
              </button>
              <div className="text-2xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white">
                →
              </div>
            </div>
          </Link>
        ))}
      </section>
    </V2Layout>
  );
}
