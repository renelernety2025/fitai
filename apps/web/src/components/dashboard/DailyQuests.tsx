'use client';

import { useEffect, useState } from 'react';
import { getDailyQuests, completeDailyQuest } from '@/lib/api';

interface Quest {
  id: string;
  titleCs: string;
  xpReward: number;
  completed: boolean;
}

export default function DailyQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyQuests()
      .then(setQuests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleComplete(id: string) {
    try {
      await completeDailyQuest(id);
      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, completed: true } : q)),
      );
    } catch {
      /* noop */
    }
  }

  if (loading) return null;
  if (quests.length === 0) return null;

  const done = quests.filter((q) => q.completed).length;
  const allDone = done === quests.length;

  return (
    <section className="mb-16">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
        Denni questy
      </div>

      {/* Progress bar */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[#A8FF00] transition-all duration-500"
            style={{ width: `${(done / quests.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums text-white/50">
          {done}/{quests.length}
        </span>
      </div>

      {allDone && (
        <div className="mb-4 rounded-xl border border-[#A8FF00]/20 bg-[#A8FF00]/5 px-4 py-3 text-center text-sm font-semibold text-[#A8FF00]">
          Vsechny splneny!
        </div>
      )}

      <div className="space-y-2">
        {quests.map((q) => (
          <button
            key={q.id}
            onClick={() => !q.completed && handleComplete(q.id)}
            disabled={q.completed}
            className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
              q.completed
                ? 'border-[#A8FF00]/10 bg-[#A8FF00]/[0.03]'
                : 'border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]'
            }`}
          >
            {/* Checkbox */}
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                q.completed
                  ? 'border-[#A8FF00] bg-[#A8FF00]'
                  : 'border-white/20'
              }`}
            >
              {q.completed && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>

            {/* Title */}
            <span
              className={`flex-1 text-sm font-medium ${
                q.completed
                  ? 'text-white/30 line-through'
                  : 'text-white'
              }`}
            >
              {q.titleCs}
            </span>

            {/* XP badge */}
            <span
              className={`shrink-0 text-xs font-semibold tabular-nums ${
                q.completed ? 'text-[#A8FF00]/50' : 'text-[#A8FF00]'
              }`}
            >
              +{q.xpReward} XP
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
