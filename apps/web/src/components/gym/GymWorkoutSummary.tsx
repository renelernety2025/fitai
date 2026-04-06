'use client';

import Link from 'next/link';
import type { ProgressResult } from '@/lib/api';

interface ExerciseSummary {
  name: string;
  sets: number;
  totalReps: number;
  avgFormScore: number;
}

interface GymWorkoutSummaryProps {
  durationSeconds: number;
  totalReps: number;
  avgFormScore: number;
  exercises: ExerciseSummary[];
  progress: ProgressResult;
}

export function GymWorkoutSummary({
  durationSeconds, totalReps, avgFormScore, exercises, progress,
}: GymWorkoutSummaryProps) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur overflow-y-auto py-8">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-gray-900 p-8">
        <p className="mb-2 text-center text-4xl">💪</p>
        <h2 className="mb-2 text-center text-2xl font-bold text-white">Trénink dokončen!</h2>
        <p className="mb-6 text-center text-lg text-[#F59E0B]">+{progress.xpGained} XP</p>

        <div className="mb-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{minutes}:{seconds.toString().padStart(2, '0')}</p>
            <p className="text-xs text-gray-400">Doba</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalReps}</p>
            <p className="text-xs text-gray-400">Opakování</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${avgFormScore >= 70 ? 'text-[#16a34a]' : 'text-red-400'}`}>
              {Math.round(avgFormScore)}%
            </p>
            <p className="text-xs text-gray-400">Forma</p>
          </div>
        </div>

        {/* Per-exercise breakdown */}
        <div className="mb-6 rounded-lg bg-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="px-3 py-2 text-left font-medium">Cvik</th>
                <th className="px-3 py-2 font-medium">Sety</th>
                <th className="px-3 py-2 font-medium">Repy</th>
                <th className="px-3 py-2 font-medium">Forma</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, i) => (
                <tr key={i} className="border-b border-gray-700/50">
                  <td className="px-3 py-2 text-white">{ex.name}</td>
                  <td className="px-3 py-2 text-center text-gray-300">{ex.sets}</td>
                  <td className="px-3 py-2 text-center text-gray-300">{ex.totalReps}</td>
                  <td className={`px-3 py-2 text-center font-medium ${ex.avgFormScore >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.round(ex.avgFormScore)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link
          href="/plans"
          className="block w-full rounded-xl bg-[#16a34a] py-3 text-center font-semibold text-white transition hover:bg-green-700"
        >
          Zpět na plány
        </Link>
      </div>
    </div>
  );
}
