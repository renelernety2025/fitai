'use client';

import { useState, useRef, useCallback } from 'react';

interface BuddyCardData {
  id: string;
  user: {
    id: string;
    name: string;
    level: string;
  };
  gym: string;
  schedule: string;
  goals: string;
  bio: string;
  stats?: {
    sessions: number;
    streak: number;
  };
}

interface BuddyCardProps {
  card: BuddyCardData;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function BuddyCard({ card, onSwipe }: BuddyCardProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      startX.current = e.clientX;
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setOffset(e.clientX - startX.current);
    },
    [dragging],
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
    if (Math.abs(offset) > 100) {
      onSwipe(offset > 0 ? 'right' : 'left');
    }
    setOffset(0);
  }, [offset, onSwipe]);

  const tint =
    offset > 40
      ? 'rgba(168,255,0,0.12)'
      : offset < -40
      ? 'rgba(255,55,95,0.12)'
      : 'transparent';

  return (
    <div
      className="touch-none select-none rounded-2xl p-8"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        transform: `translateX(${offset}px) rotate(${offset * 0.04}deg)`,
        transition: dragging ? 'none' : 'transform 0.3s ease',
        background: tint,
        cursor: 'grab',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Avatar + name */}
      <div className="mb-6 flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
          style={{
            border: '2px solid rgba(255,255,255,0.15)',
            color: 'var(--text-primary)',
          }}
        >
          {card.user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {card.user.name}
          </div>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: 'var(--text-muted)' }}
          >
            {card.user.level}
          </div>
        </div>
      </div>

      {/* Bio */}
      {card.bio && (
        <p
          className="mb-6 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          {card.bio}
        </p>
      )}

      {/* Info pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {card.gym && (
          <span
            className="rounded-full px-3 py-1 text-[10px] font-semibold"
            style={{
              backgroundColor: 'rgba(0,229,255,0.1)',
              color: '#00E5FF',
            }}
          >
            {card.gym}
          </span>
        )}
        {card.schedule && (
          <span
            className="rounded-full px-3 py-1 text-[10px] font-semibold"
            style={{
              backgroundColor: 'rgba(191,90,242,0.1)',
              color: '#BF5AF2',
            }}
          >
            {card.schedule}
          </span>
        )}
        {card.goals && (
          <span
            className="rounded-full px-3 py-1 text-[10px] font-semibold"
            style={{
              backgroundColor: 'rgba(168,255,0,0.1)',
              color: '#A8FF00',
            }}
          >
            {card.goals}
          </span>
        )}
      </div>

      {/* Stats */}
      {card.stats && (
        <div className="flex gap-6">
          <div>
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {card.stats.sessions}
            </span>
            <span
              className="ml-1 text-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              treninku
            </span>
          </div>
          <div>
            <span
              className="text-lg font-bold"
              style={{ color: '#FFD600' }}
            >
              {card.stats.streak}
            </span>
            <span
              className="ml-1 text-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              streak
            </span>
          </div>
        </div>
      )}

      {/* Swipe hint */}
      <div
        className="mt-6 text-center text-[10px]"
        style={{ color: 'var(--text-muted)' }}
      >
        Potahni doleva = preskocit / doprava = zajima me
      </div>
    </div>
  );
}
