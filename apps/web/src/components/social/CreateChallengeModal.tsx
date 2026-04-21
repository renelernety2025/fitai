'use client';

import { useState } from 'react';
import { createChallenge } from '@/lib/api';

const TYPES = [
  { value: 'workouts', label: 'Treninky' },
  { value: 'volume', label: 'Objem (kg)' },
  { value: 'streak', label: 'Streak (dny)' },
  { value: 'steps', label: 'Kroky' },
];

const DURATIONS = [7, 14, 30];

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateChallengeModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('workouts');
  const [targetValue, setTargetValue] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim() || !targetValue) {
      setError('Vyplň název a cílovou hodnotu.');
      return;
    }
    const target = parseInt(targetValue, 10);
    if (isNaN(target) || target < 1) {
      setError('Cílová hodnota musí být alespoň 1.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createChallenge({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        targetValue: target,
        durationDays,
      });
      setName('');
      setDescription('');
      setType('workouts');
      setTargetValue('');
      setDurationDays(7);
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se vytvořit výzvu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a0a] p-8">
        <h2 className="mb-8 text-2xl font-bold tracking-tight text-white">
          Nova vyzva
        </h2>

        {error && (
          <p className="mb-4 text-sm text-red-400">{error}</p>
        )}

        {/* Name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          placeholder="Název výzvy"
          className="mb-4 w-full border-b border-white/15 bg-transparent py-3 text-lg text-white placeholder-white/30 focus:border-white focus:outline-none"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Popis (volitelný)"
          className="mb-6 w-full resize-none border-b border-white/15 bg-transparent py-3 text-base text-white placeholder-white/30 focus:border-white focus:outline-none"
        />

        {/* Type */}
        <div className="mb-6">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Typ
          </p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
                  type === t.value
                    ? 'border-[#A8FF00] bg-[#A8FF00]/10 text-[#A8FF00]'
                    : 'border-white/15 text-white/50 hover:border-white/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div className="mb-6">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Cil
          </p>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            min={1}
            max={100000}
            placeholder="např. 10"
            className="w-full border-b border-white/15 bg-transparent py-3 text-lg text-white placeholder-white/30 focus:border-white focus:outline-none"
          />
        </div>

        {/* Duration */}
        <div className="mb-8">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Doba trvani
          </p>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDurationDays(d)}
                className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
                  durationDays === d
                    ? 'border-[#A8FF00] bg-[#A8FF00]/10 text-[#A8FF00]'
                    : 'border-white/15 text-white/50 hover:border-white/40'
                }`}
              >
                {d} dni
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/15 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white/40 hover:text-white"
          >
            Zrusit
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-full bg-white py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? 'Vytvářím...' : 'Vytvořit'}
          </button>
        </div>
      </div>
    </div>
  );
}
