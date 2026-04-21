'use client';

import type { WeeklyVolumeEntry } from '@/lib/api';

interface VolumeChartProps {
  data: WeeklyVolumeEntry[];
}

const STATUS_COLORS: Record<string, string> = {
  undertrained: '#FF9F0A',
  optimal: '#A8FF00',
  overtrained: '#FF375F',
};

const MUSCLE_LABELS: Record<string, string> = {
  CHEST: 'Prsa', BACK: 'Zada', SHOULDERS: 'Ramena',
  BICEPS: 'Biceps', TRICEPS: 'Triceps', QUADRICEPS: 'Stehna',
  HAMSTRINGS: 'Zadni stehna', GLUTES: 'Hyzde', CORE: 'Core',
  CALVES: 'Lytka',
};

/** Horizontal bar chart of weekly muscle group volume. */
export default function VolumeChart({ data }: VolumeChartProps) {
  if (data.length === 0) return null;

  const maxVol = Math.max(...data.map((d) => d.volumeKg), 1);

  return (
    <div className="space-y-3">
      {data.map((entry) => {
        const pct = Math.min(100, (entry.volumeKg / maxVol) * 100);
        const color = STATUS_COLORS[entry.status] ?? '#A8FF00';
        const label = MUSCLE_LABELS[entry.muscleGroup] ?? entry.muscleGroup;

        return (
          <div key={entry.muscleGroup}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold text-white/60">{label}</span>
              <span className="text-[10px] tabular-nums text-white/30">
                {entry.sets} setu · {Math.round(entry.volumeKg)} kg
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/8">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <div className="mt-0.5 text-[9px]" style={{ color }}>
              {entry.status === 'optimal' && 'Optimalni'}
              {entry.status === 'undertrained' && 'Malo objemu'}
              {entry.status === 'overtrained' && 'Moc objemu'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
