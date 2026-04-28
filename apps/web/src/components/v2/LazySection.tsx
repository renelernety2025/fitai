'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

export function LazySection({
  children,
  className = '',
  fallback,
}: {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible ? (
        children
      ) : (
        fallback || <div style={{ minHeight: 200 }} />
      )}
    </div>
  );
}
