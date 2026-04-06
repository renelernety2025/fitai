'use client';

import { useEffect, useState } from 'react';
import type { ProgressResult } from '@/lib/api';

interface XPGainedOverlayProps {
  progress: ProgressResult;
  onComplete: () => void;
}

export function XPGainedOverlay({ progress, onComplete }: XPGainedOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
      <div
        className="text-center transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.5)',
        }}
      >
        <p className="mb-2 text-6xl font-black text-[#F59E0B]">
          +{progress.xpGained} XP
        </p>

        {progress.levelUp && (
          <p className="mb-4 text-2xl font-bold text-white">
            Level UP! Jsi teď {progress.levelName}
          </p>
        )}

        {progress.currentStreak > 1 && (
          <p className="text-xl text-[#EA580C]">
            🔥 {progress.currentStreak} dní v sérii!
          </p>
        )}
      </div>
    </div>
  );
}
