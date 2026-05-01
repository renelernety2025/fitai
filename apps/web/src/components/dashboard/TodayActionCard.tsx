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
    <div style={{
      position: 'relative', borderRadius: 'var(--r-lg, 16px)',
      border: '1px solid rgba(255,255,255,0.1)',
      padding: 20, marginBottom: 32, background: gradient,
    }}>
      <button
        onClick={dismiss}
        aria-label="Close"
        style={{
          position: 'absolute', top: 12, right: 12,
          color: 'rgba(255,255,255,0.3)', background: 'none',
          border: 'none', fontSize: 18, lineHeight: 1,
          cursor: 'pointer', transition: 'color .2s',
        }}
      >
        &times;
      </button>

      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)', paddingRight: 32 }}>
        {action.headline}
      </h3>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
        {action.rationale}
      </p>

      <Link
        href={action.ctaLink}
        style={{
          display: 'inline-block', marginTop: 16,
          borderRadius: 'var(--r-pill)', padding: '8px 20px',
          fontSize: 14, fontWeight: 600, color: '#000',
          backgroundColor: accent, textDecoration: 'none',
          transition: 'opacity .2s',
        }}
      >
        {action.ctaLabel}
      </Link>
    </div>
  );
}
