'use client';

import { useEffect, useState, useMemo } from 'react';
import { getExercises, type ExerciseData } from '@/lib/api';

interface ExercisePickerProps {
  onSelect: (exerciseId: string, name: string, nameCs: string, muscleGroups: string[]) => void;
  onClose: () => void;
}

const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'core', 'forearms',
];

export default function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);

  useEffect(() => {
    getExercises().then(setExercises).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return exercises.filter((e) => {
      const matchesSearch = !q || e.nameCs.toLowerCase().includes(q) || e.name.toLowerCase().includes(q);
      const matchesMuscle = !muscleFilter || e.muscleGroups.includes(muscleFilter);
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, search, muscleFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-[#111] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Vybrat cvik</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">&times;</button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <input
            type="text"
            placeholder="Hledat cvik..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#A8FF00]/40"
            autoFocus
          />
        </div>

        {/* Muscle filter chips */}
        <div className="flex flex-wrap gap-2 px-6 py-3">
          {MUSCLE_GROUPS.map((mg) => (
            <button
              key={mg}
              onClick={() => setMuscleFilter(muscleFilter === mg ? null : mg)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
                muscleFilter === mg
                  ? 'bg-[#A8FF00] text-black'
                  : 'bg-white/5 text-white/40 hover:text-white/70'
              }`}
            >
              {mg}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-white/30">Nic nenalezeno</p>
          )}
          <div className="grid grid-cols-1 gap-1">
            {filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => onSelect(e.id, e.name, e.nameCs, e.muscleGroups)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-white/5"
              >
                <div>
                  <div className="text-sm font-medium text-white">{e.nameCs}</div>
                  <div className="text-xs text-white/40">{e.muscleGroups.join(', ')}</div>
                </div>
                <span className="text-white/20 text-lg">+</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
