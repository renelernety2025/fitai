'use client';

interface SetTrackerProps {
  totalSets: number;
  completedSets: number;
  currentSet: number;
}

export function SetTracker({ totalSets, completedSets, currentSet }: SetTrackerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Set</span>
      {Array.from({ length: totalSets }, (_, i) => (
        <div
          key={i}
          className={`h-3 w-3 rounded-full ${
            i < completedSets
              ? 'bg-green-500'
              : i === currentSet
              ? 'bg-[#F59E0B] animate-pulse'
              : 'bg-gray-700'
          }`}
        />
      ))}
      <span className="text-xs text-gray-400">
        {completedSets}/{totalSets}
      </span>
    </div>
  );
}
