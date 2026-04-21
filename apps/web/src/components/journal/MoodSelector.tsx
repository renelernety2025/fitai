'use client';

const MOODS = [
  { key: 'great', emoji: '\uD83D\uDCAA', label: 'GREAT' },
  { key: 'good', emoji: '\uD83D\uDE0A', label: 'GOOD' },
  { key: 'neutral', emoji: '\uD83D\uDE10', label: 'NEUTRAL' },
  { key: 'tired', emoji: '\uD83D\uDE34', label: 'TIRED' },
  { key: 'bad', emoji: '\uD83D\uDE1E', label: 'BAD' },
] as const;

interface MoodSelectorProps {
  value: string | null;
  onChange: (mood: string) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-2">
      {MOODS.map((m) => (
        <button
          key={m.key}
          type="button"
          onClick={() => onChange(m.key)}
          className={`flex flex-col items-center rounded-lg px-2 py-1.5 text-xs transition ${
            value === m.key
              ? 'bg-white/10 ring-1 ring-white/60'
              : 'hover:bg-white/5'
          }`}
          aria-label={m.label}
        >
          <span className="text-lg">{m.emoji}</span>
          <span className="mt-0.5 text-[9px] uppercase tracking-wider text-white/50">
            {m.label}
          </span>
        </button>
      ))}
    </div>
  );
}
