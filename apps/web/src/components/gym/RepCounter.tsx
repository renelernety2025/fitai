'use client';

interface RepCounterProps {
  current: number;
  target: number;
}

export function RepCounter({ current, target }: RepCounterProps) {
  const isComplete = current >= target;
  return (
    <div className={`flex items-center justify-center rounded-2xl px-5 py-3 text-center font-mono ${
      isComplete ? 'bg-green-600' : 'bg-gray-800'
    }`}>
      <span className="text-4xl font-black text-white">{current}</span>
      <span className="mx-1 text-xl text-gray-400">/</span>
      <span className="text-2xl text-gray-300">{target}</span>
    </div>
  );
}
