'use client';

interface BadgeProps {
  type: 'NONE' | 'CREATOR' | 'VERIFIED';
  size?: number;
}

export function Badge({ type, size = 16 }: BadgeProps) {
  if (type === 'NONE') return null;

  if (type === 'CREATOR') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: '#E85D2C' }}
        title="Creator"
        aria-label="Creator badge"
        role="img"
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 1L7.5 4.5L11 5L8.5 7.5L9 11L6 9.5L3 11L3.5 7.5L1 5L4.5 4.5L6 1Z" fill="white" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: size, height: size, backgroundColor: '#3B82F6' }}
      title="Verified"
      aria-label="Verified badge"
      role="img"
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
