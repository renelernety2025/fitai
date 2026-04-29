'use client';

import { useEffect, useState } from 'react';
import { getBodyPortfolio } from '@/lib/api';

const CATEGORIES = [
  { key: 'strength', label: 'Sila', color: 'var(--accent)' },
  { key: 'endurance', label: 'Vytrvalost', color: 'var(--sage)' },
  { key: 'form', label: 'Forma', color: 'var(--clay)' },
  { key: 'nutrition', label: 'Vyziva', color: 'var(--warning)' },
  { key: 'mobility', label: 'Mobilita', color: 'var(--clay-deep)' },
] as const;

function buildPentagonPoints(scores: number[], cx: number, cy: number, r: number): string {
  return scores
    .map((s, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const ratio = Math.max(0, Math.min(1, s / 100));
      return `${cx + r * ratio * Math.cos(angle)},${cy + r * ratio * Math.sin(angle)}`;
    })
    .join(' ');
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 60,
    y: 20 - (v / max) * 18,
  }));
  return (
    <svg width={60} height={22} className="mt-2">
      {pts.map((p, i) =>
        i > 0 ? (
          <line
            key={i}
            x1={pts[i - 1].x}
            y1={pts[i - 1].y}
            x2={p.x}
            y2={p.y}
            stroke={color}
            strokeWidth={1.5}
            strokeOpacity={0.5}
          />
        ) : null,
      )}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
      ))}
    </svg>
  );
}

function ScoreRing({ score, size, color }: { score: number; size: number; color: string }) {
  const stroke = size * 0.08;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, score / 100));
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeOpacity={0.12} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={`url(#ring-grad)`} strokeWidth={stroke} strokeLinecap="round" fill="none"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
        style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1.5s ease' }}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--sage)" />
          <stop offset="50%" stopColor="var(--clay)" />
          <stop offset="100%" stopColor="var(--clay-deep)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function BodyPortfolioPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => { document.title = 'FitAI — Portfolio'; }, []);

  useEffect(() => {
    getBodyPortfolio()
      .then(setData)
      .catch(() => setErr(true))
      .finally(() => setLoading(false));
  }, []);

  const scores = data?.categories || {};
  const overall = data?.overallScore ?? 0;
  const catScores = CATEGORIES.map((c) => scores[c.key]?.score ?? 0);

  if (loading) {
    return (
      <>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20" style={{ borderTopColor: 'var(--sage)' }} />
        </div>
      </>
    );
  }

  return (
    <>
      <section style={{ padding: '48px 0 32px' }}>
        <p className="v3-eyebrow-serif">Fintech pro tvoje telo</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Body<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>Portfolio.</em>
        </h1>
      </section>

      {err && (
        <div className="mb-8 rounded-xl border px-6 py-4 text-sm" style={{ borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)', backgroundColor: 'color-mix(in srgb, var(--accent) 5%, transparent)', color: 'var(--accent)' }}>
          Nepodarilo se nacist data. Zkus to pozdeji.
        </div>
      )}

      {!err && !data && (
        <div className="py-16 text-center text-white/30">
          <p className="text-lg">Zatim zadna data</p>
          <p className="mt-2 text-sm">Zacni trenovat a sledovat navyky pro zobrazeni portfolia.</p>
        </div>
      )}

      {/* Overall score hero */}
      <section className="mb-20 flex flex-col items-center">
        <div className="relative">
          <ScoreRing score={overall} size={220} color="var(--sage)" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold tracking-tight tabular-nums text-white" style={{ letterSpacing: '-0.05em' }}>
              {overall}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Celkove skore
            </span>
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((cat) => {
          const s = scores[cat.key] || {};
          const change = s.monthlyChange ?? 0;
          return (
            <div
              key={cat.key}
              className="rounded-2xl border border-white/8 p-5 transition hover:border-white/15"
              style={{ background: `linear-gradient(135deg, ${cat.color}08, transparent)` }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: cat.color }}>
                {cat.label}
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums text-white">{s.score ?? 0}</div>
              <div className="mt-1 text-xs font-semibold" style={{ color: change >= 0 ? 'var(--sage)' : 'var(--accent)' }}>
                {change >= 0 ? '+' : ''}{change}%
              </div>
              <Sparkline data={s.history || [0, 0]} color={cat.color} />
            </div>
          );
        })}
      </section>

      {/* Radar chart */}
      <section className="mb-20 flex flex-col items-center">
        <p className="v3-eyebrow">Radar profil</p>
        <svg width={300} height={300} viewBox="0 0 300 300">
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <polygon
              key={r}
              points={buildPentagonPoints([r * 100, r * 100, r * 100, r * 100, r * 100], 150, 150, 120)}
              fill="none" stroke="white" strokeOpacity={0.08} strokeWidth={1}
            />
          ))}
          {/* Axis labels */}
          {CATEGORIES.map((cat, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const lx = 150 + 138 * Math.cos(angle);
            const ly = 150 + 138 * Math.sin(angle);
            return (
              <text key={cat.key} x={lx} y={ly} fill={cat.color} fontSize={9} fontWeight={600}
                textAnchor="middle" dominantBaseline="middle"
              >
                {cat.label}
              </text>
            );
          })}
          {/* Data polygon */}
          <polygon
            points={buildPentagonPoints(catScores, 150, 150, 120)}
            fill="color-mix(in srgb, var(--sage) 8%, transparent)" stroke="var(--sage)" strokeWidth={2}
          />
          {/* Data dots */}
          {catScores.map((s, i) => {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const ratio = Math.max(0, Math.min(1, s / 100));
            return (
              <circle
                key={i}
                cx={150 + 120 * ratio * Math.cos(angle)}
                cy={150 + 120 * ratio * Math.sin(angle)}
                r={4} fill={CATEGORIES[i].color}
              />
            );
          })}
        </svg>
      </section>
    </>
  );
}
