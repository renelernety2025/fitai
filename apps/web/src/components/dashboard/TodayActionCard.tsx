'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TodayAction } from '@/lib/api';

const GRADIENTS: Record<string, string> = {
  streak: 'linear-gradient(135deg, rgba(255,55,95,0.15), rgba(255,149,0,0.1))',
  recovery: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(191,90,242,0.1))',
  comeback: 'linear-gradient(135deg, rgba(168,255,0,0.15), rgba(0,229,255,0.1))',
  nutrition: 'linear-gradient(135deg, rgba(255,149,0,0.15), rgba(255,214,0,0.1))',
  default: 'linear-gradient(135deg, rgba(168,255,0,0.1), rgba(0,229,255,0.05))',
};

const ACCENTS: Record<string, string> = {
  streak: '#FF375F',
  recovery: '#00E5FF',
  comeback: '#A8FF00',
  nutrition: '#FF9500',
  default: '#A8FF00',
};

interface TodayActionCardProps {
  action: TodayAction;
}

export default function TodayActionCard({ action }: TodayActionCardProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const today = new Date().toISOString().slice(0, 10);
    return localStorage.getItem(`fitai_today_action_dismissed_${today}`) === '1';
  });

  if (dismissed) return null;

  function dismiss() {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`fitai_today_action_dismissed_${today}`, '1');
    setDismissed(true);
  }

  const gradient = GRADIENTS[action.type] || GRADIENTS.default;
  const accent = ACCENTS[action.type] || ACCENTS.default;

  return (
    <div
      className="relative rounded-2xl border border-white/10 p-5 mb-8"
      style={{ background: gradient }}
    >
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition text-lg leading-none"
        aria-label="Zavrit"
      >
        &times;
      </button>

      <h3 className="text-lg font-bold text-white pr-8">{action.headline}</h3>
      <p className="text-sm text-white/50 mt-1">{action.rationale}</p>

      <Link
        href={action.ctaLink}
        className="inline-block mt-4 rounded-full px-5 py-2 text-sm font-semibold text-black transition hover:opacity-90"
        style={{ backgroundColor: accent }}
      >
        {action.ctaLabel}
      </Link>
    </div>
  );
}
