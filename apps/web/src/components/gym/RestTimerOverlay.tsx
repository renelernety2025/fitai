'use client';

import { getRandomFact } from '@/lib/fitness-facts';

interface RestTimerOverlayProps {
  remaining: number;
  total: number;
  nextExerciseName: string;
  nextSetNumber: number;
  onSkip: () => void;
}

export function RestTimerOverlay({
  remaining,
  total,
  nextExerciseName,
  nextSetNumber,
  onSkip,
}: RestTimerOverlayProps) {
  const progress = 1 - remaining / total;
  const circumference = 2 * Math.PI * 70;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]/95 backdrop-blur">
      <p className="mb-8 text-lg text-gray-400">Odpočinek</p>

      <div className="relative mb-8">
        <svg width="160" height="160" className="-rotate-90">
          <circle cx="80" cy="80" r="70" fill="none" stroke="#1f2937" strokeWidth="6" />
          <circle
            cx="80" cy="80" r="70" fill="none"
            stroke="#16a34a"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black text-white">{remaining}</span>
          <span className="text-sm text-gray-400">sec</span>
        </div>
      </div>

      <p className="mb-2 text-sm text-gray-400">
        Další: {nextExerciseName} · Set {nextSetNumber}
      </p>

      <button
        onClick={onSkip}
        className="mt-4 rounded-lg border border-gray-700 px-6 py-2 text-sm text-gray-400 transition hover:border-gray-500 hover:text-white"
      >
        Přeskočit
      </button>

      <p className="mt-6 max-w-xs text-center text-xs text-white/30 italic">
        &#128161; {getRandomFact()}
      </p>
    </div>
  );
}
