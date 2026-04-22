'use client';

import { motion } from 'framer-motion';
import { SPRING_SNAPPY } from './motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', hover = true, glow, onClick }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, borderColor: 'rgba(255,255,255,0.15)' } : undefined}
      transition={SPRING_SNAPPY}
      onClick={onClick}
      className={`rounded-2xl border border-white/8 backdrop-blur-sm ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        boxShadow: glow ? `0 0 30px ${glow}` : undefined,
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}
