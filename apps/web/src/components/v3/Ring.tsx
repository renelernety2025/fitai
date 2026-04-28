interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  sub?: string;
  className?: string;
}

export function Ring({
  value,
  size = 64,
  stroke = 4,
  color = 'var(--accent)',
  label,
  sub,
  className = '',
}: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="var(--stroke-1, var(--bg-3))"
          strokeWidth={stroke} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      {(label || sub) && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {label && (
            <div className="v3-numeric" style={{
              fontSize: size > 80 ? 24 : 16, fontWeight: 600, color: 'var(--text-1)',
            }}>
              {label}
            </div>
          )}
          {sub && (
            <div style={{
              fontSize: 9, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {sub}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
