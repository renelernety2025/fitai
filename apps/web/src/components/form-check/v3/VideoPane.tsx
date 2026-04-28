'use client';

import { Card, Tag } from '@/components/v3';

type Severity = 'good' | 'warn' | 'bad';
interface Cue { t: string; text: string; sev: Severity }

const SEV_COLOR: Record<Severity, string> = {
  good: 'var(--sage)', warn: 'var(--warning)', bad: 'var(--danger)',
};
const SEV_LABEL: Record<Severity, string> = {
  good: 'Good rep', warn: 'Watch', bad: 'Fix',
};

export function VideoPane({ cues }: { cues: Cue[] }) {
  return (
    <div>
      <div style={{
        position: 'relative', aspectRatio: '16/10', background: '#000',
        borderRadius: 'var(--r-lg)', overflow: 'hidden',
        border: '1px solid var(--stroke-1)',
      }}>
        <img
          src="https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=960&q=80"
          alt="Squat form" draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
        />
        <SkeletonOverlay />
        <LiveCue text="Right hip rising early" />
        <VideoControls cues={cues} />
      </div>

      <Card padding={24} style={{ marginTop: 16 }}>
        <div className="v3-eyebrow" style={{ marginBottom: 16 }}>AI Cue timeline</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {cues.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '10px 0',
              borderBottom: i < cues.length - 1 ? '1px solid var(--stroke-1)' : 'none',
            }}>
              <div className="v3-numeric" style={{ fontSize: 13, width: 56, color: 'var(--text-3)' }}>
                {c.t}
              </div>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: SEV_COLOR[c.sev], flexShrink: 0,
              }} />
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text-1)' }}>{c.text}</div>
              <Tag color={SEV_COLOR[c.sev]}>{SEV_LABEL[c.sev]}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SkeletonOverlay() {
  const joints: [number, number][] = [
    [50,22],[50,40],[42,32],[58,32],[42,58],[58,58],[38,78],[62,78],
  ];
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      viewBox="0 0 100 100" preserveAspectRatio="none"
    >
      <g stroke="var(--accent)" strokeWidth="0.4" fill="none" opacity="0.85">
        <circle cx="50" cy="22" r="2" />
        <line x1="50" y1="24" x2="50" y2="40" />
        <line x1="42" y1="32" x2="58" y2="32" />
        <line x1="50" y1="40" x2="42" y2="58" />
        <line x1="50" y1="40" x2="58" y2="58" />
        <line x1="42" y1="58" x2="38" y2="78" />
        <line x1="58" y1="58" x2="62" y2="78" />
        {joints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.8" fill="var(--accent)" />
        ))}
      </g>
      <circle cx="42" cy="58" r="3" fill="none" stroke="var(--danger)" strokeWidth="0.5">
        <animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function LiveCue({ text }: { text: string }) {
  return (
    <div style={{
      position: 'absolute', top: 24, left: 24,
      background: 'rgba(200,74,44,0.9)', backdropFilter: 'blur(10px)',
      padding: '8px 14px', borderRadius: 'var(--r-pill)',
      fontSize: 13, fontWeight: 500, color: '#fff',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 14 }}>&#9889;</span> {text}
    </div>
  );
}

function VideoControls({ cues }: { cues: Cue[] }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <button style={{
        width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </button>
      <div style={{
        flex: 1, height: 3, background: 'rgba(255,255,255,0.2)',
        borderRadius: 3, position: 'relative',
      }}>
        <div style={{ width: '42%', height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
        {cues.map((c, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${(i + 1) * 15}%`, top: -3,
            width: 2, height: 9, background: SEV_COLOR[c.sev],
          }} />
        ))}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff',
      }}>
        00:31 / 01:12
      </div>
    </div>
  );
}
