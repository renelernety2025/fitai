'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const COLORS = ['#A8FF00', '#FF375F', '#00E5FF', '#FFD600', '#BF5AF2'];

function generateParticles() {
  return Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: (Math.sin(i * 2.1) * 0.5 + (i % 2 ? 0.2 : -0.2)) * 300,
    y: -(100 + (i * 7) % 200),
    rotation: (i * 24) % 720,
    color: COLORS[i % 5],
    size: 4 + (i % 6),
  }));
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);

  useEffect(() => {
    if (!trigger) return;
    setParticles(generateParticles());
    const t = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: '50%',
              top: '40%',
              width: p.size,
              height: p.size,
              background: p.color,
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: p.x, y: p.y, rotate: p.rotation, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
