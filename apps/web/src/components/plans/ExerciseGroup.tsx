'use client';

const GROUP_COLORS: Record<string, string> = {
  superset: '#0A84FF',
  circuit: '#A8FF00',
  giant: '#BF5AF2',
  drop: '#FF9500',
};

const GROUP_LABELS: Record<string, string> = {
  superset: 'Superset',
  circuit: 'Circuit',
  giant: 'Giant set',
  drop: 'Drop set',
};

interface ExerciseGroupProps {
  type: string;
  count: number;
  onUngroup: () => void;
  children: React.ReactNode;
}

export default function ExerciseGroup({ type, count, onUngroup, children }: ExerciseGroupProps) {
  const color = GROUP_COLORS[type] || '#FFF';
  const label = GROUP_LABELS[type] || type;

  return (
    <div className="relative pl-5 my-2">
      {/* Colored left bracket */}
      <div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
        style={{ backgroundColor: color }}
      />

      {/* Group header */}
      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ color }}
        >
          {label} ({count})
        </span>
        <button
          onClick={onUngroup}
          className="text-[10px] text-white/30 hover:text-white/60 transition"
        >
          Rozdelit
        </button>
      </div>

      {children}
    </div>
  );
}

export { GROUP_COLORS, GROUP_LABELS };
