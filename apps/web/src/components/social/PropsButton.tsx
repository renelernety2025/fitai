'use client';

import { useState } from 'react';
import { giveProps } from '@/lib/api';

interface PropsButtonProps {
  toUserId: string;
  initialCount?: number;
}

export default function PropsButton({
  toUserId,
  initialCount = 0,
}: PropsButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [sent, setSent] = useState(false);
  const [animating, setAnimating] = useState(false);

  async function handleProps() {
    if (sent) return;
    try {
      await giveProps(toUserId);
      setCount((c) => c + 1);
      setSent(true);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    } catch {
      // silent
    }
  }

  return (
    <button
      onClick={handleProps}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition"
      style={{
        backgroundColor: sent
          ? 'rgba(255,214,0,0.15)'
          : 'rgba(255,255,255,0.05)',
        color: sent ? '#FFD600' : 'var(--text-muted)',
        border: '1px solid',
        borderColor: sent
          ? 'rgba(255,214,0,0.3)'
          : 'rgba(255,255,255,0.1)',
        transform: animating ? 'scale(1.15)' : 'scale(1)',
      }}
    >
      <span>Props</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
