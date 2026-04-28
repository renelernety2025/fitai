import { Sparkline } from './Sparkline';

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
