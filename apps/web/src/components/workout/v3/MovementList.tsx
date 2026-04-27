'use client';

import { useState } from 'react';
import { Card, Tag, Chip, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';

interface Movement {
  name: string;
  sets: string;
  tempo: string;
  rest: string;
  heavy?: boolean;
  icon?: string;
}

interface Block {
  name: string;
  time: string;
  items: Movement[];
}

interface MovementListProps {
  blocks: Block[];
}

const ICON_FOR_BLOCK: Record<number, string> = {
  0: 'heart',
  1: 'dumbbell',
  2: 'muscle',
  3: 'leaf',
};

export function MovementList({ blocks }: MovementListProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [view, setView] = useState<'list' | 'video' | '3d'>('list');

  function toggle(idx: number) {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionHeader eyebrow="BREAKDOWN" title="Movement plan" />
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <Chip active={view === 'list'} onClick={() => setView('list')}>List</Chip>
          <Chip active={view === 'video'} onClick={() => setView('video')}>Video</Chip>
          <Chip active={view === '3d'} onClick={() => setView('3d')}>3D</Chip>
        </div>
      </div>

      {blocks.map((block, bi) => (
        <Card key={bi} padding={0} style={{ marginBottom: 12, overflow: 'hidden' }}>
          <button
            onClick={() => toggle(bi)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', width: '100%',
              borderBottom: expanded[bi] ? '1px solid var(--stroke-1)' : 'none',
              background: 'var(--bg-2, var(--bg-card))',
              border: 'none', cursor: 'pointer', color: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="v3-numeric" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {String(bi + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{block.name}</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
                {block.time}
              </span>
            </div>
            <FitIcon
              name="arrow"
              size={14}
              color="var(--text-3)"
              style={{
                transform: expanded[bi] ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform .2s ease',
              }}
            />
          </button>

          {expanded[bi] && (
            <div>
              {block.items.map((item, i) => (
                <MovementRow
                  key={i}
                  item={item}
                  index={i}
                  isLast={i === block.items.length - 1}
                  blockIcon={ICON_FOR_BLOCK[bi] ?? 'dumbbell'}
                />
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function MovementRow({ item, index, isLast, blockIcon }: {
  item: Movement; index: number; isLast: boolean; blockIcon: string;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '36px 48px 1fr 120px 80px 60px',
      alignItems: 'center', padding: '14px 20px', gap: 12,
      borderBottom: isLast ? 'none' : '1px solid var(--stroke-1)',
    }}>
      <div className="v3-numeric" style={{ fontSize: 11, color: 'var(--text-3)' }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 8, background: 'var(--bg-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <FitIcon name={item.icon ?? blockIcon} size={18} color="var(--text-2)" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{item.name}</div>
        <div className="v3-caption">
          {item.tempo === '-' ? 'No tempo' : `Tempo ${item.tempo}`}
        </div>
      </div>
      <div className="v3-numeric" style={{
        fontSize: 13,
        color: item.heavy ? 'var(--accent-hot)' : 'var(--text-1)',
        fontWeight: item.heavy ? 600 : 500,
      }}>
        {item.sets}
      </div>
      <div className="v3-numeric" style={{ fontSize: 12, color: 'var(--text-3)' }}>
        rest {item.rest}
      </div>
      <div style={{ textAlign: 'right' }}>
        {item.heavy && <Tag color="var(--accent)">PR</Tag>}
      </div>
    </div>
  );
}
