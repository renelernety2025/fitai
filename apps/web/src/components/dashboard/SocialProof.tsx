'use client';

import { useEffect, useState } from 'react';

function estimateActiveUsers(): number {
  const hour = new Date().getHours();
  // Peak hours 6-9, 17-20 = higher count
  if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 20)) {
    return 80 + Math.floor(Math.random() * 40);
  }
  if (hour >= 10 && hour <= 16) {
    return 40 + Math.floor(Math.random() * 30);
  }
  return 15 + Math.floor(Math.random() * 20);
}

export default function SocialProof() {
  const [count, setCount] = useState(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setCount(estimateActiveUsers());
  }, []);

  // Animate number ticker
  useEffect(() => {
    if (count === 0) return;
    const duration = 1200;
    const steps = 30;
    const increment = count / steps;
    let current = 0;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), count);
      setDisplay(current);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="mb-12 flex items-center justify-center gap-2 text-sm text-white/40">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A8FF00] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#A8FF00]" />
      </span>
      <span className="tabular-nums font-semibold text-white/60">
        {display}
      </span>
      <span>lidi dnes trenuje</span>
    </div>
  );
}
