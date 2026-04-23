'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const PHASES = [
  { label: 'Nadech', duration: 4 },
  { label: 'Zadrz', duration: 4 },
  { label: 'Vydech', duration: 4 },
  { label: 'Zadrz', duration: 4 },
] as const;

const CYCLE_DURATION = 16;

export default function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  const tick = useCallback(() => {
    const now = performance.now();
    const dt = (now - startRef.current) / 1000;
    setElapsed(dt % CYCLE_DURATION);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (active) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, tick]);

  const phaseInfo = getPhase(elapsed);
  const scale = active ? getScale(elapsed) : 1;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center w-52 h-52">
        <div
          className="absolute inset-0 rounded-full transition-transform duration-300"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.12) 60%, transparent 100%)',
            transform: `scale(${scale})`,
          }}
        />
        <div
          className="absolute w-28 h-28 rounded-full transition-transform duration-300"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(139,92,246,0.3) 100%)',
            transform: `scale(${scale})`,
            boxShadow: '0 0 40px rgba(99,102,241,0.3)',
          }}
        />
        <div className="relative z-10 text-center">
          {active ? (
            <>
              <p className="text-lg font-semibold text-white">
                {phaseInfo.label}
              </p>
              <p className="text-3xl font-bold text-white tabular-nums">
                {phaseInfo.remaining}
              </p>
            </>
          ) : (
            <p className="text-sm text-white/60">Pripraveno</p>
          )}
        </div>
      </div>
      <button
        onClick={() => setActive((v) => !v)}
        className="px-6 py-2 rounded-full text-sm font-medium transition-colors"
        style={{
          background: active
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(99,102,241,0.3)',
          color: 'white',
        }}
      >
        {active ? 'Stop' : 'Zacit dychat'}
      </button>
    </div>
  );
}

function getPhase(elapsed: number) {
  let acc = 0;
  for (const phase of PHASES) {
    acc += phase.duration;
    if (elapsed < acc) {
      const remaining = Math.ceil(acc - elapsed);
      return { label: phase.label, remaining };
    }
  }
  return { label: PHASES[0].label, remaining: PHASES[0].duration };
}

function getScale(elapsed: number): number {
  const t = elapsed % CYCLE_DURATION;
  if (t < 4) return 1 + (t / 4) * 0.5;
  if (t < 8) return 1.5;
  if (t < 12) return 1.5 - ((t - 8) / 4) * 0.5;
  return 1;
}
