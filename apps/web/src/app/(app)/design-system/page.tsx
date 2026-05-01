'use client';

import { useState } from 'react';
import { Button, Card, Tag, Chip, Avatar, AvatarStack, SectionHeader, Metric, Sparkline, BarChart, Ring, Logo } from '@/components/v3';

const SPARK = [12, 18, 14, 22, 19, 28, 24, 32, 29, 38, 34, 42];
const BARS = [24, 31, 18, 28, 0, 12, 8];
const BAR_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const AVATARS = [
  { name: 'Sara L.' }, { name: 'Maya S.' }, { name: 'Kai B.' },
  { name: 'Alex R.' }, { name: 'Lena V.' },
];

export default function DesignSystemPage() {
  const [activeChip, setActiveChip] = useState(1);

  return (
    <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100vh', padding: '48px 32px 96px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 64 }}>
        <Logo size={28} />
        <h1 className="v3-display-2" style={{ marginTop: 16 }}>
          Design System<br />
          <em className="v3-clay" style={{ fontWeight: 300 }}>v3 Primitives.</em>
        </h1>
        <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 12, maxWidth: 480 }}>
          All reusable components for the cinematic coach redesign.
        </p>
      </div>

      {/* Buttons */}
      <Section title="Button" eyebrow="Interactive">
        <Row>
          <Button variant="accent">Start free</Button>
          <Button variant="primary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="glass">Glass</Button>
          <Button variant="plain">Plain link</Button>
        </Row>
        <Row style={{ marginTop: 12 }}>
          <Button variant="accent" size="sm">Small</Button>
          <Button variant="accent" size="md">Medium</Button>
          <Button variant="accent" size="lg">Large</Button>
          <Button variant="accent" disabled>Disabled</Button>
        </Row>
      </Section>

      {/* Cards */}
      <Section title="Card" eyebrow="Containers">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Card padding={24}>
            <p className="v3-eyebrow">Default card</p>
            <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 8 }}>No hover effect.</p>
          </Card>
          <Card padding={24} hover>
            <p className="v3-eyebrow">Hover card</p>
            <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 8 }}>Lifts on hover.</p>
          </Card>
          <Card padding={24} hover onClick={() => {}}>
            <p className="v3-eyebrow">Clickable</p>
            <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 8 }}>Cursor pointer.</p>
          </Card>
        </div>
      </Section>

      {/* Tags & Chips */}
      <Section title="Tag & Chip" eyebrow="Labels">
        <Row>
          <Tag>Default</Tag>
          <Tag color="var(--accent)">Accent</Tag>
          <Tag color="var(--sage)">Sage</Tag>
          <Tag color="var(--clay)">Clay</Tag>
          <Tag color="var(--warning)">Warning</Tag>
        </Row>
        <Row style={{ marginTop: 12 }}>
          {['All', 'Strength', 'Running', 'Yoga', 'Mobility'].map((c, i) => (
            <Chip key={c} active={activeChip === i} onClick={() => setActiveChip(i)}>{c}</Chip>
          ))}
        </Row>
      </Section>

      {/* Avatars */}
      <Section title="Avatar" eyebrow="Identity">
        <Row>
          <Avatar name="Sara L." size={48} online />
          <Avatar name="Maya S." size={48} ring="var(--accent)" />
          <Avatar name="Kai B." size={48} />
          <Avatar name="A R" size={36} />
          <Avatar name="L V" size={28} />
        </Row>
        <Row style={{ marginTop: 12 }}>
          <AvatarStack avatars={AVATARS} size={40} max={4} />
        </Row>
      </Section>

      {/* Section Header */}
      <Section title="SectionHeader" eyebrow="Layout">
        <Card padding={24}>
          <SectionHeader eyebrow="This week" title="By the numbers" action={{ label: 'See all', onClick: () => {} }} />
        </Card>
      </Section>

      {/* Metrics */}
      <Section title="Metric" eyebrow="Data">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <Card padding={20}>
            <Metric label="Volume" value="38,420" unit="kg" delta="+12%" deltaPositive sub="This week" />
          </Card>
          <Card padding={20}>
            <Metric label="5K Time" value="24:18" delta="-2:14" deltaPositive sub="Personal best" />
          </Card>
          <Card padding={20}>
            <Metric label="Sessions" value="64" delta="+12" deltaPositive sub="All time" />
          </Card>
          <Card padding={20}>
            <Metric label="Avg HR" value="142" unit="bpm" delta="-2%" deltaPositive={false} sub="This week" />
          </Card>
        </div>
      </Section>

      {/* Charts */}
      <Section title="Charts" eyebrow="Visualization">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Card padding={24}>
            <p className="v3-eyebrow" style={{ marginBottom: 12 }}>Sparkline</p>
            <Sparkline data={SPARK} color="var(--sage)" width={200} height={40} fill />
          </Card>
          <Card padding={24}>
            <p className="v3-eyebrow" style={{ marginBottom: 12 }}>Bar Chart</p>
            <BarChart data={BARS} labels={BAR_LABELS} height={60} color="var(--accent)" highlight={1} />
          </Card>
          <Card padding={24}>
            <p className="v3-eyebrow" style={{ marginBottom: 12 }}>Ring</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Ring value={87} size={80} color="var(--accent)" label="87" sub="Recovery" />
            </div>
          </Card>
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" eyebrow="Type scale">
        <Card padding={32}>
          <p className="v3-display-1" style={{ marginBottom: 16 }}><em>Display 1</em></p>
          <p className="v3-display-2" style={{ marginBottom: 16 }}><em>Display 2 — italic serif</em></p>
          <p className="v3-display-3" style={{ marginBottom: 16 }}>Display 3 — sans bold</p>
          <p className="v3-title" style={{ marginBottom: 12 }}>Title — section heading</p>
          <p className="v3-body" style={{ marginBottom: 12 }}>Body — paragraph text at 15px with 1.55 line height for comfortable reading.</p>
          <p className="v3-eyebrow" style={{ marginBottom: 12 }}>Eyebrow — mono uppercase label</p>
          <p className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Eyebrow serif — italic Fraunces accent</p>
          <p className="v3-caption" style={{ marginBottom: 12 }}>Caption — small metadata text</p>
          <p className="v3-numeric" style={{ fontSize: 32 }}>1,420 <span style={{ fontSize: 14, color: 'var(--text-3)' }}>kg</span></p>
        </Card>
      </Section>

      {/* Colors */}
      <Section title="Color Palette" eyebrow="Tokens">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {[
            { name: 'bg-0', v: 'var(--bg-0)' }, { name: 'bg-1', v: 'var(--bg-1)' },
            { name: 'bg-2', v: 'var(--bg-2)' }, { name: 'bg-3', v: 'var(--bg-3)' },
            { name: 'bg-card', v: 'var(--bg-card)' }, { name: 'bg-4', v: 'var(--bg-4)' },
            { name: 'accent', v: 'var(--accent)' }, { name: 'accent-hot', v: 'var(--accent-hot)' },
            { name: 'clay', v: 'var(--clay)' }, { name: 'sage', v: 'var(--sage)' },
            { name: 'warning', v: 'var(--warning)' }, { name: 'danger', v: 'var(--danger)' },
          ].map(c => (
            <div key={c.name} style={{ textAlign: 'center' }}>
              <div style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--r-md)', background: c.v, border: '1px solid var(--stroke-1)' }} />
              <p className="v3-caption" style={{ marginTop: 6 }}>{c.name}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 16 }}>
          {['--d-1', '--d-2', '--d-3', '--d-4', '--d-5'].map(d => (
            <div key={d} style={{ flex: 1, height: 24, background: `var(${d})`, borderRadius: 4 }} />
          ))}
        </div>
        <p className="v3-caption" style={{ marginTop: 6 }}>Heatmap ramp (d-1 → d-5)</p>
      </Section>

      {/* Logo */}
      <Section title="Logo" eyebrow="Brand">
        <Row>
          <Logo size={32} />
          <Logo size={24} />
          <Logo size={18} color="var(--text-3)" />
        </Row>
      </Section>
    </div>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <p className="v3-eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</p>
      <h2 className="v3-title" style={{ marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  );
}

function Row({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', ...style }}>{children}</div>;
}
