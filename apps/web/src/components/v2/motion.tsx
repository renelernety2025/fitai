'use client';

import { motion, useSpring, useTransform, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

// Spring configs
export const SPRING_SNAPPY = { stiffness: 300, damping: 30 };
export const SPRING_GENTLE = { stiffness: 170, damping: 26 };
export const SPRING_BOUNCY = { stiffness: 400, damping: 25 };

// FadeIn — opacity + y offset
export function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_GENTLE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ScaleIn — scale from 0.95
export function ScaleIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING_SNAPPY, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// SlideUp — for cards entering viewport
export function SlideUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ ...SPRING_GENTLE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// StaggerContainer + StaggerItem — for list animations
const staggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: SPRING_GENTLE },
};

export function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// NumberTicker — animated count-up
export function NumberTicker({ value, format, className = '' }: { value: number; format?: (n: number) => string; className?: string }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (v) => format ? format(Math.round(v)) : Math.round(v).toLocaleString('cs-CZ'));
  const [text, setText] = useState(format ? format(0) : '0');

  useEffect(() => { spring.set(value); }, [spring, value]);
  useEffect(() => display.on('change', (v) => setText(String(v))), [display]);

  return <motion.span className={className}>{text}</motion.span>;
}

// PressableButton — scale feedback on press
export function PressableButton({ children, onClick, className = '', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAPPY}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}
