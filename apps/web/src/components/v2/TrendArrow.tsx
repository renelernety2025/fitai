'use client';

interface TrendArrowProps {
  current: number;
  previous: number;
  suffix?: string;
}

export function TrendArrow({ current, previous, suffix = '' }: TrendArrowProps) {
  const diff = current - previous;

  if (diff === 0) {
    return (
      <span style={{ color: 'var(--text-muted)' }}>
        &rarr; 0{suffix}
      </span>
    );
  }

  const isUp = diff > 0;

  return (
    <span style={{ color: isUp ? '#A8FF00' : '#FF375F', fontSize: '0.85em' }}>
      {isUp ? '\u2191' : '\u2193'} {isUp ? '+' : ''}{diff}{suffix}
    </span>
  );
}
