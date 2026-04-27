'use client';

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function Chip({ children, active, onClick, icon, className = '' }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`v3-chip ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 'var(--r-pill)',
        fontSize: 13, fontWeight: 500, letterSpacing: '-0.005em',
        whiteSpace: 'nowrap', cursor: 'pointer',
        transition: 'all .15s ease',
        background: active ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
        border: active ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--stroke-2)',
        color: active ? 'var(--accent)' : 'var(--text-2)',
      }}
    >
      {icon}
      {children}
    </button>
  );
}
