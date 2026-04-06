'use client';

import Link from 'next/link';

interface WorkoutSummaryProps {
  durationSeconds: number;
  averageScore: number;
  correctPoses: number;
  totalPoses: number;
}

export function WorkoutSummary({
  durationSeconds,
  averageScore,
  correctPoses,
  totalPoses,
}: WorkoutSummaryProps) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-gray-900 p-8 text-center">
        <p className="mb-2 text-4xl">💪</p>
        <h2 className="mb-6 text-2xl font-bold text-white">Cvičení dokončeno!</h2>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-gray-400">Doba</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#16a34a]">
              {Math.round(averageScore)}%
            </p>
            <p className="text-xs text-gray-400">Přesnost</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {correctPoses}/{totalPoses}
            </p>
            <p className="text-xs text-gray-400">Správné pózy</p>
          </div>
        </div>

        <Link
          href="/videos"
          className="inline-block rounded-xl bg-[#16a34a] px-8 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Zpět na videa
        </Link>
      </div>
    </div>
  );
}
