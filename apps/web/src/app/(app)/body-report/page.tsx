'use client';

import { useEffect, useState } from 'react';
import { Card, SectionHeader, Metric, BarChart, Tag } from '@/components/v3';

const WEEK_LABELS = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne'];
const WEEK_DATA = [24, 0, 31, 18, 28, 0, 12];

const MUSCLES = [
  { name: 'Hrudnik', volume: 18, status: 'recovered' },
  { name: 'Zada', volume: 24, status: 'fresh' },
  { name: 'Ramena', volume: 12, status: 'due' },
  { name: 'Nohy', volume: 28, status: 'fresh' },
  { name: 'Biceps', volume: 9, status: 'recovered' },
  { name: 'Triceps', volume: 11, status: 'recovered' },
  { name: 'Core', volume: 15, status: 'fresh' },
  { name: 'Lytka', volume: 6, status: 'due' },
];

const INSIGHTS = [
  { icon: '\u2197', text: 'Bench press progres: +2.5kg za posledni 2 tydny. Konzistentni rust.', type: 'positive' as const },
  { icon: '\u26A0', text: 'Ramena maji 14 sessions od posledniho deloadu. Doporucuji recovery den.', type: 'warning' as const },
  { icon: '\u25CE', text: 'Tvuj spanek se zlepsil o 12% — primo koreluje s lepsi formou.', type: 'neutral' as const },
];

const WOW = [
  { label: 'Volume', current: '113', delta: '+15.3%', up: true },
  { label: 'Form', current: '91%', delta: '+3.4%', up: true },
  { label: 'Sessions', current: '5', delta: '+1', up: true },
  { label: 'Rest days', current: '2', delta: '-1', up: false },
];

function statusColor(status: string): string {
  if (status === 'fresh') return 'var(--sage)';
  if (status === 'due') return 'var(--warning)';
  return 'var(--text-3)';
}

function insightBorder(type: string): string {
  if (type === 'positive') return 'var(--sage)';
  if (type === 'warning') return 'var(--warning)';
  return 'var(--stroke-1)';
}

function insightColor(type: string): string {
  if (type === 'positive') return 'var(--sage)';
  if (type === 'warning') return 'var(--warning)';
  return 'var(--text-3)';
}

function MuscleHeat({ groups }: { groups: typeof MUSCLES }) {
  const maxVol = Math.max(...groups.map((g) => g.volume), 1);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
      {groups.map((g) => {
        const pct = g.volume / maxVol;
        return (
          <div
            key={g.name}
            style={{
              padding: '14px 16px',
              background: `color-mix(in srgb, var(--sage) ${Math.round(pct * 10)}%, transparent)`,
              borderLeft: `2px solid color-mix(in srgb, var(--sage) ${Math.round(pct * 60)}%, transparent)`,
            }}
          >
            <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{g.name}</span>
            <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 2 }}>
              {g.volume} sets
              <span style={{ marginLeft: 6, color: statusColor(g.status) }}>{g.status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BodyReportPage() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { document.title = 'FitAI — Body Report'; }, []);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  const now = new Date();
  const weekNum = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7,
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px 80px', opacity: loaded ? 1 : 0, transition: 'opacity .6s ease' }}>
      {/* Hero */}
      <section style={{ padding: '48px 0 32px' }}>
        <p className="v3-eyebrow-serif">{'\u2666'} Weekly Intelligence W{weekNum}</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Body<br />
          <em className="v3-clay" style={{ fontWeight: 300 }}>Report.</em>
        </h1>
        <p className="v3-caption" style={{ marginTop: 8, color: 'var(--text-3)' }}>
          {now.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </section>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
        <Card padding={20}>
          <Metric label="Recovery Score" value="87" unit="/ 100" delta="5%" deltaPositive />
        </Card>
        <Card padding={20}>
          <Metric label="Week Volume" value="113" unit="sets" delta="15%" deltaPositive />
        </Card>
        <Card padding={20}>
          <Metric label="Avg Form Score" value="91" unit="%" delta="3.4%" deltaPositive />
        </Card>
        <Card padding={20}>
          <Metric label="Active Streak" value="47" unit="dni" />
        </Card>
      </div>

      {/* Weekly distribution */}
      <SectionHeader eyebrow="Volume" title="Weekly Distribution" />
      <Card padding={20} style={{ marginBottom: 32 }}>
        <BarChart
          data={WEEK_DATA}
          labels={WEEK_LABELS}
          height={80}
          barW={18}
          gap={10}
          color="var(--sage)"
          highlight={WEEK_DATA.indexOf(Math.max(...WEEK_DATA))}
        />
      </Card>

      {/* Muscle heatmap */}
      <SectionHeader eyebrow="Load" title="Muscle Group" />
      <Card padding={0} style={{ overflow: 'hidden', marginBottom: 32 }}>
        <MuscleHeat groups={MUSCLES} />
      </Card>

      {/* AI Insights */}
      <SectionHeader eyebrow="AI" title="Insights" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {INSIGHTS.map((ins, i) => (
          <Card key={i} padding={16} style={{ borderLeft: `2px solid ${insightBorder(ins.type)}` }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 16, color: insightColor(ins.type), flexShrink: 0 }}>{ins.icon}</span>
              <p className="v3-body" style={{ color: 'var(--text-2, var(--text-3))', margin: 0 }}>{ins.text}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Week-over-Week */}
      <SectionHeader eyebrow="Comparison" title="Week-over-Week" />
      <Card padding={20} style={{ marginBottom: 32 }}>
        {WOW.map((m) => (
          <div
            key={m.label}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--stroke-1)',
            }}
          >
            <span className="v3-body" style={{ color: 'var(--text-3)' }}>{m.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="v3-numeric" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{m.current}</span>
              <Tag color={m.up ? 'var(--sage)' : 'var(--danger)'}>{m.delta}</Tag>
            </div>
          </div>
        ))}
      </Card>

      {/* Footer */}
      <p className="v3-caption" style={{ textAlign: 'center', color: 'var(--text-3)', marginTop: 40 }}>
        Generated by FitAI {'\u00B7'} {now.toLocaleDateString('cs-CZ')} {'\u00B7'} W{weekNum}
      </p>
    </div>
  );
}
