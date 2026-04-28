'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

// FadeIn — CSS animation
export function FadeIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`animate-fadeIn ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// ScaleIn
export function ScaleIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div className={`animate-scaleIn ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// SlideUp — uses IntersectionObserver for scroll-triggered
export function SlideUp({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null!);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`${visible ? 'animate-slideUp' : 'opacity-0 translate-y-10'} ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

// StaggerContainer + StaggerItem
export function StaggerContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`stagger-container ${className}`}>{children}</div>;
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`stagger-item animate-fadeIn ${className}`}>{children}</div>;
}

// NumberTicker — animated count-up (pure JS)
export function NumberTicker({ value, format, className = '', prefix, suffix, delay = 0 }: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
}) {
  const [display, setDisplay] = useState('0');
  const [started, setStarted] = useState(delay === 0);
  const ref = useRef<number>(0);
  useEffect(() => {
    if (delay <= 0) { setStarted(true); return; }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!started) return;
    const start = ref.current;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 800;
    const startTime = Date.now();
    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(format ? format(current) : current.toLocaleString('cs-CZ'));
      if (progress < 1) requestAnimationFrame(tick);
      else ref.current = value;
    }
    requestAnimationFrame(tick);
  }, [value, format, started]);
  return (
    <span className={className}>
      {prefix ? <span>{prefix}</span> : null}
      {display}
      {suffix ? <span>{suffix}</span> : null}
    </span>
  );
}

// PressableButton — CSS hover/active
export function PressableButton({ children, onClick, className = '', disabled = false }: {
  children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`transition-transform active:scale-[0.97] hover:scale-[1.02] ${className}`}
    >
      {children}
    </button>
  );
}

// Spring constants (kept for API compatibility, not used in CSS version)
export const SPRING_SNAPPY = {};
export const SPRING_GENTLE = {};
export const SPRING_BOUNCY = {};
