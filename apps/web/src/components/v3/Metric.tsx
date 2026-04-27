interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaPositive?: boolean;
  sub?: string;
  sparkData?: number[];
  className?: string;
}

export function Metric({ label, value, unit, delta, deltaPositive, sub, sparkData, className = '' }: MetricProps) {
  return (
    <div className={className}>
      <div className="v3-eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="v3-numeric" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
          {value}
        </span>
        {unit && (
          <span className="v3-numeric" style={{ fontSize: 13, color: 'var(--text-3)' }}>{unit}</span>
        )}
      </div>
      {(delta || sub) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {delta && (
            <span className="v3-numeric" style={{
              fontSize: 11, fontWeight: 500,
              color: deltaPositive ? 'var(--sage, #34d399)' : 'var(--danger, #ef4444)',
            }}>
              {deltaPositive ? '\u2191' : '\u2193'} {delta}
            </span>
          )}
          {sub && <span className="v3-caption" style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
        </div>
      )}
      {sparkData && sparkData.length > 1 && (
        <div style={{ marginTop: 8 }}>
          <Sparkline data={sparkData} width={100} height={28} color="var(--accent)" />
        </div>
      )}
    </div>
  );
}

// Inline mini sparkline for Metric integration
function Sparkline({ data, width, height, color }: { data: number[]; width: number; height: number; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const d = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
