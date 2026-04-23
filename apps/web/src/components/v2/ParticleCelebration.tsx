'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#FF375F', '#A8FF00', '#00E5FF', '#FF9F0A', '#BF5AF2'];
const PARTICLE_COUNT = 80;
const DURATION_MS = 2000;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
}

interface Props {
  active: boolean;
}

export default function ParticleCelebration({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles.current = createParticles(
      canvas.width / 2,
      canvas.height / 2,
    );

    const start = performance.now();

    function animate(now: number) {
      const progress = (now - start) / DURATION_MS;
      if (progress > 1 || !ctx || !canvas) {
        ctx?.clearRect(0, 0, canvas!.width, canvas!.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life = Math.max(0, 1 - progress);

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf.current = requestAnimationFrame(animate);
    }

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
}

function createParticles(cx: number, cy: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      r: 2 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    };
  });
}
