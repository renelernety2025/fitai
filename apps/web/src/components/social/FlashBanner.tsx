'use client';

import { useState, useEffect } from 'react';
import { getActiveFlash, joinFlash } from '@/lib/api';

interface FlashChallenge {
  id: string;
  name: string;
  endsAt: string;
  targetValue: number;
  participants: {
    user: { name: string };
    currentValue: number;
  }[];
  joined: boolean;
}

export default function FlashBanner() {
  const [flash, setFlash] = useState<FlashChallenge | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    getActiveFlash()
      .then((data) => {
        if (data?.id) setFlash(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!flash) return;
    function tick() {
      const diff = new Date(flash!.endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Skoncilo');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`,
      );
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [flash]);

  if (!flash) return null;

  async function handleJoin() {
    if (!flash) return;
    try {
      await joinFlash(flash.id);
      setFlash({ ...flash, joined: true });
    } catch {
      // silent
    }
  }

  const top3 = flash.participants
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 3);

  return (
    <div
      className="mb-8 overflow-hidden rounded-2xl p-5"
      style={{
        background:
          'linear-gradient(135deg, rgba(255,55,95,0.2) 0%, rgba(255,150,0,0.15) 100%)',
        border: '1px solid rgba(255,55,95,0.3)',
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: '#FF375F' }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: '#FF375F' }}
          >
            Flash vyzva
          </span>
        </div>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color: '#FF375F' }}
        >
          {timeLeft}
        </span>
      </div>

      <div
        className="mb-3 text-lg font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        {flash.name}
      </div>

      {top3.length > 0 && (
        <div className="mb-3 flex gap-4">
          {top3.map((p, i) => (
            <div key={i} className="text-xs">
              <span style={{ color: 'var(--text-muted)' }}>
                {i + 1}.
              </span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>
                {p.user.name}
              </span>{' '}
              <span
                className="font-bold"
                style={{ color: '#FFD600' }}
              >
                {p.currentValue}
              </span>
            </div>
          ))}
        </div>
      )}

      {!flash.joined && (
        <button
          onClick={handleJoin}
          className="rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition"
          style={{
            backgroundColor: '#FF375F',
            color: '#fff',
          }}
        >
          Pripojit se
        </button>
      )}
      {flash.joined && (
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: '#A8FF00' }}
        >
          Ucastnis se
        </span>
      )}
    </div>
  );
}
