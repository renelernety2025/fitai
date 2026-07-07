'use client';

import { useEffect, useState } from 'react';
import { Card, Tag, Sparkline, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getPersonalRecords, getPredictions } from '@/lib/api';
import type { PersonalRecordEntry } from '@fitai/shared';
import type { PredictionItem } from '@/lib/api/progress';

// Sector times are a feature gap: the /records list endpoint returns
// PersonalRecordEntry (no sector splits), so the expanded panel stays hidden.
type PersonalRecord = PersonalRecordEntry & {
  eccentricMs?: number; holdMs?: number; concentricMs?: number;
};

export default function RecordsPage() {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Records'; }, []);

  useEffect(() => {
    Promise.all([
      getPersonalRecords().then((d) => setRecords(d)),
      getPredictions().then((d) => setPredictions(d.predictions)).catch(() => {}),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-0)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="v3-eyebrow" style={{ opacity: 0.4 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '40px 56px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Records</div>
        <h1 className="v3-display-2" style={{ margin: 0 }}>
          Your strongest,<br /><span className="v3-clay" style={{ fontWeight: 300 }}>fastest, longest.</span>
        </h1>
      </div>

      {records.length === 0 && (
        <Card padding={48} style={{ textAlign: 'center' }}>
          <div className="v3-display-3" style={{ marginBottom: 8 }}>No records yet</div>
          <div className="v3-caption">Start training to set personal records.</div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {records.map((pr) => (
          <RecordCard key={pr.exerciseId} pr={pr} expanded={expanded === pr.exerciseId} onToggle={() => setExpanded(expanded === pr.exerciseId ? null : pr.exerciseId)} />
        ))}
      </div>

      {predictions.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <SectionHeader eyebrow="Predictions" title="What's next for you." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {predictions.map((p) => (
              <PredictionCard key={p.exerciseId} prediction={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecordCard({ pr, expanded, onToggle }: { pr: PersonalRecord; expanded: boolean; onToggle: () => void }) {
  const hasSectors = pr.eccentricMs || pr.holdMs || pr.concentricMs;
  const daysAgo = Math.floor((Date.now() - new Date(pr.date).getTime()) / 86_400_000);
  const prLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

  return (
    <Card padding={32} hover onClick={onToggle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>{pr.exerciseName}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="v3-numeric" style={{ fontSize: 48, color: 'var(--accent)', lineHeight: 1 }}>{pr.bestWeight ?? '--'}</span>
            <span className="v3-caption">kg</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            {pr.deltaWeight != null && pr.deltaWeight !== 0 && (
              <span className="v3-numeric" style={{ fontSize: 12, color: 'var(--sage)' }}>
                {pr.deltaWeight > 0 ? '+' : ''}{pr.deltaWeight} kg
              </span>
            )}
            <span className="v3-caption">{pr.bestReps} reps</span>
          </div>
        </div>
        <Tag color="var(--accent)">PR · {prLabel}</Tag>
      </div>

      {/* Progress sparkline — shown only when real history is available */}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <span className="v3-caption">{pr.exerciseNameCs ?? ''}</span>
        <span className="v3-caption">{new Date(pr.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
      </div>

      {expanded && hasSectors && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--stroke-1)' }}>
          <div className="v3-eyebrow" style={{ marginBottom: 10 }}>Sector times</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {pr.eccentricMs != null && (
              <div>
                <div className="v3-caption">Eccentric</div>
                <div className="v3-numeric" style={{ fontSize: 14, color: '#00E5FF' }}>{(pr.eccentricMs / 1000).toFixed(1)}s</div>
              </div>
            )}
            {pr.holdMs != null && (
              <div>
                <div className="v3-caption">Hold</div>
                <div className="v3-numeric" style={{ fontSize: 14, color: '#FF9F0A' }}>{(pr.holdMs / 1000).toFixed(1)}s</div>
              </div>
            )}
            {pr.concentricMs != null && (
              <div>
                <div className="v3-caption">Concentric</div>
                <div className="v3-numeric" style={{ fontSize: 14, color: 'var(--sage)' }}>{(pr.concentricMs / 1000).toFixed(1)}s</div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'var(--sage, #34d399)',
  medium: '#FF9F0A',
  low: 'var(--danger, #ef4444)',
};

function PredictionCard({ prediction: p }: { prediction: PredictionItem }) {
  const projectedData = [
    ...p.history,
    p.predicted4w,
    p.predicted8w,
    p.predicted12w,
  ];

  return (
    <Card padding={32}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>{p.exerciseName}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="v3-numeric" style={{ fontSize: 36, color: 'var(--text-1)', lineHeight: 1 }}>{p.currentBest}</span>
            <span className="v3-caption">kg now</span>
          </div>
        </div>
        <Tag color={CONFIDENCE_COLORS[p.confidence]}>
          {p.confidence}
        </Tag>
      </div>

      <PredictionSparkline data={projectedData} historyLen={p.history.length} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
        <PredictionTarget label="4 weeks" value={p.predicted4w} current={p.currentBest} />
        <PredictionTarget label="8 weeks" value={p.predicted8w} current={p.currentBest} />
        <PredictionTarget label="12 weeks" value={p.predicted12w} current={p.currentBest} />
      </div>
    </Card>
  );
}

function PredictionTarget({ label, value, current }: { label: string; value: number; current: number }) {
  const diff = +(value - current).toFixed(1);
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="v3-numeric" style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)' }}>{value}</div>
      <div className="v3-caption" style={{ fontSize: 10 }}>{label}</div>
      {diff > 0 && (
        <div className="v3-numeric" style={{ fontSize: 10, color: 'var(--sage, #34d399)', marginTop: 2 }}>+{diff} kg</div>
      )}
    </div>
  );
}

function PredictionSparkline({ data, historyLen }: { data: number[]; historyLen: number }) {
  const width = 400;
  const height = 60;
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));

  const solidPath = points.slice(0, historyLen)
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const dashedPath = points.slice(historyLen - 1)
    .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block', width: '100%' }} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={solidPath} stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d={dashedPath} stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="6 4" opacity="0.5" />
    </svg>
  );
}
