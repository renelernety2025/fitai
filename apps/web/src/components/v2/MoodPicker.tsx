'use client';

import { useState } from 'react';

const MOODS = [
  { value: 1, emoji: '\uD83D\uDE2B', color: '#FF375F', label: 'Hrozne' },
  { value: 2, emoji: '\uD83D\uDE15', color: '#FF9F0A', label: 'Spatne' },
  { value: 3, emoji: '\uD83D\uDE10', color: '#666666', label: 'Normalni' },
  { value: 4, emoji: '\uD83D\uDE42', color: '#00E5FF', label: 'Dobre' },
  { value: 5, emoji: '\uD83D\uDE04', color: '#A8FF00', label: 'Skvele' },
] as const;

interface Props {
  value?: number;
  onChange?: (value: number) => void;
}

export default function MoodPicker({ value, onChange }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex gap-3 justify-center">
      {MOODS.map((mood) => {
        const selected = value === mood.value;
        const isHovered = hovered === mood.value;
        const scale = selected ? 1.15 : isHovered ? 1.2 : 1;

        return (
          <button
            key={mood.value}
            onClick={() => onChange?.(mood.value)}
            onMouseEnter={() => setHovered(mood.value)}
            onMouseLeave={() => setHovered(null)}
            className="flex flex-col items-center gap-1 transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
            aria-label={mood.label}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-shadow duration-200"
              style={{
                background: selected
                  ? `radial-gradient(circle, ${mood.color}33, ${mood.color}11)`
                  : 'rgba(255,255,255,0.05)',
                boxShadow: selected
                  ? `0 0 20px ${mood.color}44`
                  : 'none',
              }}
            >
              {mood.emoji}
            </div>
            <span
              className="text-[10px] transition-colors duration-200"
              style={{
                color: selected ? mood.color : 'rgba(255,255,255,0.4)',
              }}
            >
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
