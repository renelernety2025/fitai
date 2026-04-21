'use client';

import { useState } from 'react';
import { deleteFoodLog, type FoodLogItem as FoodLogItemType } from '@/lib/api';

const SOURCE_COLORS: Record<string, string> = {
  home: '#A8FF00',
  restaurant: '#FF9500',
  store: '#00E5FF',
  delivery: '#BF5AF2',
};

const SOURCE_LABELS: Record<string, string> = {
  home: 'Doma',
  restaurant: 'Restaurace',
  store: 'Obchod',
  delivery: 'Rozvoz',
};

interface Props {
  item: FoodLogItemType & {
    photoS3Key?: string | null;
    source?: string | null;
    sourceDetail?: string | null;
    rating?: number | null;
    ingredients?: string | null;
    notes?: string | null;
  };
  onDeleted: () => void;
}

export default function FoodLogItem({ item, onDeleted }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initial = item.name.charAt(0).toUpperCase();
  const hasPhoto = !!item.photoS3Key;
  const sourceColor = item.source ? SOURCE_COLORS[item.source] : null;
  const sourceLabel = item.source ? SOURCE_LABELS[item.source] : null;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteFoodLog(item.id);
      onDeleted();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <li className="border-b border-white/8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 py-4 text-left transition hover:bg-white/[0.02]"
      >
        {/* Photo thumbnail or letter avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
          style={{
            backgroundColor: hasPhoto ? '#A8FF0020' : 'rgba(255,255,255,0.06)',
            color: hasPhoto ? '#A8FF00' : 'rgba(255,255,255,0.4)',
          }}
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-base text-white">{item.name}</span>
            {sourceLabel && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase"
                style={{
                  color: sourceColor ?? '#FFF',
                  backgroundColor: `${sourceColor ?? '#FFF'}15`,
                }}
              >
                {sourceLabel}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-white/40">
            {item.kcal} kcal
            <span className="text-white/20"> | </span>
            P {item.proteinG}g
            <span className="text-white/20"> | </span>
            S {item.carbsG}g
            <span className="text-white/20"> | </span>
            T {item.fatG}g
          </div>
        </div>

        {/* Rating stars */}
        {item.rating != null && item.rating > 0 && (
          <div className="shrink-0 text-xs" style={{ color: '#FF9500' }}>
            {'*'.repeat(item.rating)}
          </div>
        )}

        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 text-white/20 transition ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-3 pb-4 pl-[52px] pr-2">
          {item.sourceDetail && (
            <p className="text-xs text-white/50">{item.sourceDetail}</p>
          )}
          {item.ingredients && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Slozeni
              </span>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                {item.ingredients}
              </p>
            </div>
          )}
          {item.notes && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Poznamky
              </span>
              <p className="mt-1 text-xs leading-relaxed text-white/50">
                {item.notes}
              </p>
            </div>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-white/30 transition hover:text-red-400"
          >
            {deleting ? 'Mazu...' : 'Smazat'}
          </button>
        </div>
      )}
    </li>
  );
}
