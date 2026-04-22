'use client';

import { motion } from 'framer-motion';

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: (Math.sin(i * 1.2) * 0.5) * 40,
  delay: (i * 0.0625),
  duration: 1 + (i % 3) * 0.4,
  size: 3 + (i % 4),
  hue: 20 + (i % 3) * 7,
  lightness: 50 + (i % 4) * 5,
}));

export function StreakFire({ streak }: { streak: number }) {
  if (streak < 7) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `calc(50% + ${p.x}px)`,
            bottom: '30%',
            width: p.size,
            height: p.size,
            background: `hsl(${p.hue}, 100%, ${p.lightness}%)`,
          }}
          animate={{ y: [-10, -60], opacity: [0.8, 0], scale: [1, 0.5] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
