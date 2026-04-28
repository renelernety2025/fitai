'use client';

import { Card, Ring, Button, Tag } from '@/components/v3';
import type { FormCheckAnalysis } from '@/lib/api';

const FIX_ITEMS = [
  'Keep knees tracking over toes during descent',
  'Control hip rise — both hips should rise at the same rate',
  'Maintain bar path directly over mid-foot',
];
const POSITIVE_ITEMS = [
  'Depth is excellent — hitting parallel consistently',
  'Lockout is strong and controlled',
];

export function AnalysisPanel({ result }: { result: FormCheckAnalysis | null }) {
  const score = result?.overallScore ?? 78;
  const fixes = result?.improvements?.length ? result.improvements : FIX_ITEMS;
  const positives = result?.positives?.length ? result.positives : POSITIVE_ITEMS;

  return (
    <div>
      <Card padding={28} style={{ marginBottom: 16 }}>
        <div className="v3-eyebrow" style={{ marginBottom: 12 }}>Overall score</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Ring value={score} size={120} stroke={6} color="var(--accent)" label={`${score}`} sub="FORM" />
          <div>
            <Tag color="var(--accent)" className="mb-2">Good</Tag>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
              {fixes.length} things to work on. Keep filming.
            </div>
          </div>
        </div>
      </Card>

      <Card padding={24} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>
          What to work on
        </div>
        {fixes.map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < fixes.length - 1 ? 14 : 0 }}>
            <div style={{
              width: 4, borderRadius: 2, flexShrink: 0,
              background: i === 0 ? 'var(--danger)' : 'var(--warning)',
            }} />
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{text}</div>
          </div>
        ))}
      </Card>

      <Card padding={24} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>
          What&apos;s working
        </div>
        {positives.map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < positives.length - 1 ? 14 : 0 }}>
            <div style={{
              width: 4, borderRadius: 2, flexShrink: 0,
              background: 'var(--sage)',
            }} />
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{text}</div>
          </div>
        ))}
      </Card>

      <Card padding={24}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
          Compare
        </div>
        <Button variant="ghost" full>vs. last week</Button>
      </Card>
    </div>
  );
}
