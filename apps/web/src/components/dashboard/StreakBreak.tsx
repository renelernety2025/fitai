'use client';

import Link from 'next/link';

interface StreakBreakProps {
  streak: number;
}

export function StreakBreak({ streak }: StreakBreakProps) {
  if (streak !== 0) return null;

  return (
    <div className="mb-12 flex flex-col items-center gap-4 rounded-2xl border border-[#FF375F]/15 bg-[#FF375F]/5 p-8 text-center animate-fadeIn">
      <span className="text-4xl" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
        &#128546;
      </span>
      <p className="text-base text-white/70">
        Tvuj streak se prerusil. Nevadi, zacni znovu!
      </p>
      <Link
        href="/gym"
        className="rounded-full bg-[#FF375F] px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
      >
        Trenovat ted
      </Link>
    </div>
  );
}
