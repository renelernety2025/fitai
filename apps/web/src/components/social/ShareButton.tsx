'use client';

import { useState } from 'react';
import { shareToFeed } from '@/lib/api';

interface ShareButtonProps {
  type: string;
  referenceId: string;
}

export default function ShareButton({
  type,
  referenceId,
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    if (shared || loading) return;
    setLoading(true);
    try {
      await shareToFeed(type, referenceId);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {
      // silent
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] transition"
      style={{
        backgroundColor: shared
          ? 'rgba(168,255,0,0.15)'
          : 'rgba(255,255,255,0.05)',
        color: shared ? '#A8FF00' : 'var(--text-muted)',
        border: '1px solid',
        borderColor: shared
          ? 'rgba(168,255,0,0.3)'
          : 'rgba(255,255,255,0.1)',
      }}
    >
      {shared ? 'Sdileno!' : 'Sdilet'}
    </button>
  );
}
