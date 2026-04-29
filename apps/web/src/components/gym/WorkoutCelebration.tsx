'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { soundManager } from '@/lib/sounds';

const ParticleCelebration = dynamic(
  () => import('@/components/v2/ParticleCelebration'),
  { ssr: false },
);

interface WorkoutCelebrationProps {
  durationSeconds: number;
  totalReps: number;
  avgFormScore: number;
  xpGained: number;
  sessionId?: string;
  onDismiss: () => void;
}

export function WorkoutCelebration({
  durationSeconds,
  totalReps,
  avgFormScore,
  xpGained,
  sessionId,
  onDismiss,
}: WorkoutCelebrationProps) {
  const [visible, setVisible] = useState(true);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    soundManager.play('complete');
    const timer = setTimeout(() => setCanDismiss(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const minutes = Math.floor(durationSeconds / 60);

  const handleShare = () => {
    if (!sessionId) return;
    const url = `${window.location.origin}/share/${sessionId}`;
    if (navigator.share) {
      navigator.share({ title: 'FitAI Workout', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm">
      <ParticleCelebration active />

      <div className="relative z-10 flex flex-col items-center animate-fadeIn">
        <h1
          className="mb-8 font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', letterSpacing: '-0.05em' }}
        >
          HOTOVO!
        </h1>

        <div className="mb-10 grid grid-cols-2 gap-x-12 gap-y-6 text-center sm:grid-cols-4">
          <CelebStat value={`${minutes} min`} label="Doba" />
          <CelebStat value={String(totalReps)} label="Repu" />
          <CelebStat
            value={`${Math.round(avgFormScore)}%`}
            label="Forma"
            accent={avgFormScore >= 80 ? '#A8FF00' : '#FF9F0A'}
          />
          <CelebStat value={`+${xpGained}`} label="XP" accent="#A8FF00" />
        </div>

        <div className="flex items-center gap-4">
          {sessionId && (
            <button
              onClick={handleShare}
              className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:scale-105 hover:border-white/40"
            >
              Share
            </button>
          )}
          <button
            onClick={() => { setVisible(false); onDismiss(); }}
            className={`rounded-full bg-white px-10 py-4 text-sm font-semibold text-black transition hover:scale-105 ${
              canDismiss ? 'opacity-100' : 'opacity-30 pointer-events-none'
            }`}
          >
            Pokracovat
          </button>
        </div>
      </div>
    </div>
  );
}

function CelebStat({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <div>
      <div
        className="text-2xl font-bold tabular-nums sm:text-3xl"
        style={{ color: accent || 'white' }}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
        {label}
      </div>
    </div>
  );
}
