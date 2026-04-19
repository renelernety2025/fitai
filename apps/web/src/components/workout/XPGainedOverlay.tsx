'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProgressResult } from '@/lib/api';

interface XPGainedOverlayProps {
  progress: ProgressResult;
  onComplete: () => void;
}

export function XPGainedOverlay({ progress, onComplete }: XPGainedOverlayProps) {
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cleanup = runConfetti(canvas);
    return cleanup;
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div
        className="relative z-10 text-center transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.5)',
        }}
      >
        <p className="mb-2 text-6xl font-black text-[#F59E0B]">
          +{progress.xpGained} XP
        </p>

        {progress.levelUp && (
          <p className="mb-4 text-2xl font-bold text-white">
            Level UP! Jsi ted {progress.levelName}
          </p>
        )}

        {progress.currentStreak > 1 && (
          <p className="text-xl text-[#EA580C]">
            {progress.currentStreak} dni v serii!
          </p>
        )}
      </div>
    </div>
  );
}

/** Canvas-based confetti animation. Returns cleanup function. */
function runConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#A8FF00', '#FF375F', '#FF9F0A', '#30D5C8', '#F59E0B', '#ffffff'];
  const particles = createParticles(120, canvas.width, canvas.height);
  let rafId: number;

  function draw() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const p of particles) {
      p.y += p.vy;
      p.x += p.vx;
      p.vy += 0.12;
      p.rotation += p.spin;
      p.opacity -= 0.004;

      if (p.opacity <= 0) continue;
      alive = true;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.globalAlpha = Math.max(0, p.opacity);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    }

    if (alive) rafId = requestAnimationFrame(draw);
  }

  function createParticles(count: number, w: number, h: number) {
    return Array.from({ length: count }, () => ({
      x: w * 0.5 + (Math.random() - 0.5) * w * 0.6,
      y: h * 0.3 + (Math.random() - 0.5) * h * 0.2,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 12 - 4,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    }));
  }

  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}
