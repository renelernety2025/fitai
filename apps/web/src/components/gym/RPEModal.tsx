'use client';

import { useState } from 'react';

interface RPEModalProps {
  onSubmit: (rpe: number) => void;
  onSkip: () => void;
}

const RPE_DESCRIPTIONS: Record<number, string> = {
  1: 'Velmi lehké',
  2: 'Lehké',
  3: 'Pohodlné',
  4: 'Mírné',
  5: 'Středně těžké',
  6: 'Těžké',
  7: 'Velmi těžké (3 repy v rezervě)',
  8: 'Náročné (2 repy v rezervě)',
  9: 'Maximální úsilí (1 rep v rezervě)',
  10: 'Selhání svalů',
};

export function RPEModal({ onSubmit, onSkip }: RPEModalProps) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-gray-900 p-6">
        <h2 className="mb-2 text-xl font-bold text-white">Jak těžké to bylo?</h2>
        <p className="mb-5 text-sm text-gray-400">Ohodnoť úsilí (RPE 1-10)</p>

        <div className="mb-4 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
            const color =
              n <= 3 ? 'bg-green-700 hover:bg-green-600' :
              n <= 6 ? 'bg-blue-700 hover:bg-blue-600' :
              n <= 8 ? 'bg-orange-700 hover:bg-orange-600' :
              'bg-red-700 hover:bg-red-600';
            return (
              <button
                key={n}
                onClick={() => setSelected(n)}
                className={`rounded-lg py-3 text-lg font-bold text-white transition ${
                  selected === n ? `${color} ring-2 ring-white scale-110` : color
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {selected && (
          <p className="mb-4 rounded-lg bg-gray-800 p-3 text-center text-sm text-gray-300">
            {RPE_DESCRIPTIONS[selected]}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:border-gray-500"
          >
            Přeskočit
          </button>
          <button
            onClick={() => selected && onSubmit(selected)}
            disabled={!selected}
            className="flex-1 rounded-lg bg-[#16a34a] py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40"
          >
            Uložit
          </button>
        </div>
      </div>
    </div>
  );
}
