interface TagProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Tag({ children, color, className = '' }: TagProps) {
  return (
    <span
      className={`v3-tag ${className}`}
      style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '4px 10px', borderRadius: 'var(--r-xs)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        background: color ? `color-mix(in srgb, ${color} 12%, transparent)` : 'var(--bg-3)',
        color: color ?? 'var(--text-3)',
      }}
    >
      {children}
    </span>
  );
}
