interface LogoProps {
  size?: number;
  color?: string;
}

export function Logo({ size = 22, color = '#fff' }: LogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 28 28" fill="none">
        <path d="M5 5h18v3.5H9V13h12v3.5H9V23H5z" fill={color} />
        <circle cx="23" cy="20" r="3" fill="var(--accent)" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: size * 0.72, letterSpacing: '-0.02em', lineHeight: 1,
      }}>
        FIT<span style={{ color: 'var(--accent)' }}>_</span>AI
      </span>
    </div>
  );
}
