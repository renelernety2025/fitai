'use client';

import { Button, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';

interface WorkoutHeroProps {
  title: string;
  subtitle: string;
  tag: string;
  breadcrumb: string[];
  coach: { name: string; specialty: string };
  metrics: { duration: number; movements: number; sets: number; rpe: number };
  imageUrl?: string;
  onStart?: () => void;
  onPreview?: () => void;
}

export function WorkoutHero({
  title, subtitle, tag, breadcrumb, coach,
  metrics, imageUrl, onStart, onPreview,
}: WorkoutHeroProps) {
  return (
    <div style={{
      position: 'relative', height: 460, overflow: 'hidden',
      borderBottom: '1px solid var(--stroke-1)',
    }}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', filter: 'saturate(0.85) contrast(1.1)',
          }}
        />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(7,7,10,0.4) 0%, rgba(7,7,10,0.1) 50%, var(--bg-0) 100%)',
      }} />

      <div style={{
        position: 'relative', padding: '48px 32px', height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <Breadcrumb items={breadcrumb} />

        <div style={{ maxWidth: 720 }}>
          <div style={{ marginBottom: 16 }}>
            <Tag color="var(--accent)">{tag}</Tag>
          </div>
          <div className="v3-display-1" style={{ marginBottom: 16 }}>
            {title}
          </div>

          <CoachRow name={coach.name} specialty={coach.specialty} />
          <MetricsRow {...metrics} />

          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              variant="accent"
              size="lg"
              icon={<FitIcon name="bolt" size={16} color="#fff" />}
              onClick={onStart}
            >
              Start now
            </Button>
            <Button variant="glass" size="lg" onClick={onPreview}>
              Preview movements
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <FitIcon name="arrow" size={12} color="rgba(255,255,255,0.4)" />}
          <span style={{ color: i === items.length - 1 ? '#fff' : undefined }}>{item}</span>
        </span>
      ))}
    </div>
  );
}

function CoachRow({ name, specialty }: { name: string; specialty: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--bg-3)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FitIcon name="muscle" size={18} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
          <div className="v3-caption">{specialty}</div>
        </div>
      </div>
    </div>
  );
}

function MetricsRow({ duration, movements, sets, rpe }: WorkoutHeroProps['metrics']) {
  const items = [
    { value: String(duration), label: 'min' },
    { value: String(movements), label: 'movements' },
    { value: String(sets), label: 'sets' },
    { value: `RPE ${rpe}`, label: 'target' },
  ];
  return (
    <div style={{ display: 'flex', gap: 24, fontSize: 13, marginBottom: 24 }}>
      {items.map((m, i) => (
        <span key={i}>
          <span className="v3-numeric" style={{ fontSize: 16, marginRight: 4 }}>{m.value}</span>
          <span style={{ color: 'var(--text-3)' }}>{m.label}</span>
        </span>
      ))}
    </div>
  );
}
