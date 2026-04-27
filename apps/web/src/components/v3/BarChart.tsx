interface BarChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  barW?: number;
  gap?: number;
  color?: string;
  highlight?: number;
  className?: string;
}

export function BarChart({
  data,
  labels,
  height = 80,
  barW = 14,
  gap = 6,
  color = 'var(--accent)',
  highlight,
  className = '',
}: BarChartProps) {
  const max = Math.max(...data, 1);

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap, height }}>
        {data.map((v, i) => (
          <div
            key={i}
            style={{
              width: barW,
              height: `${(v / max) * 100}%`,
              minHeight: 2,
              background: i === highlight ? color : 'var(--bg-4, var(--bg-3))',
              opacity: highlight !== undefined && i !== highlight ? 0.3 : 1,
              borderRadius: 3,
              transition: 'height .3s ease, opacity .2s ease',
            }}
          />
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', gap }}>
          {labels.map((l, i) => (
            <div
              key={i}
              className="v3-caption"
              style={{
                width: barW, textAlign: 'center', fontSize: 10,
                color: i === highlight ? 'var(--text-1)' : 'var(--text-3)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
