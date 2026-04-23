'use client';

import { useEffect, useRef, useState } from 'react';

interface ParallaxHeaderProps {
  children: React.ReactNode;
  className?: string;
  factor?: number;
  maxOffset?: number;
}

export function ParallaxHeader({
  children,
  className = '',
  factor = 0.3,
  maxOffset = 50,
}: ParallaxHeaderProps) {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function handleScroll() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY * factor;
        setOffset(Math.min(y, maxOffset));
      });
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [factor, maxOffset]);

  return (
    <div
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
