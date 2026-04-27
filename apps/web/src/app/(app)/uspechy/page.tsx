'use client';

import { useEffect, useState } from 'react';
import { Card, Chip, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getAchievements, checkAchievements, type Achievement } from '@/lib/api';

const CATEGORY_LABELS: Record<string, string> = {
  training: 'Training', streak: 'Streak', milestone: 'Milestones',
  habits: 'Habits', exploration: 'Exploration', nutrition: 'Nutrition', social: 'Social',
};

const RARITY_COLOR: Record<string, string> = {
  Common: 'var(--text-2)', Uncommon: 'var(--sage, #A8B89A)',
  Rare: 'var(--clay)', Epic: 'var(--accent)', Legendary: '#E5B45A',
};

function getRarity(xp: number): string {
  if (xp >= 500) return 'Legendary';
  if (xp >= 200) return 'Epic';
  if (xp >= 100) return 'Rare';
  if (xp >= 50) return 'Uncommon';
  return 'Common';
}

export default function UspechyPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { document.title = 'FitAI — Achievements'; }, []);
  useEffect(() => {
    checkAchievements()
      .then(() => getAchievements())
      .then(setAchievements)
      .catch(console.error);
  }, []);

  const unlocked = achievements.filter(a => a.unlocked);
  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter);
  const categories = Array.from(new Set(achievements.map(a => a.category)));

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <PageHeader earned={unlocked.length} total={achievements.length} />
      <CategoryChips categories={categories} filter={filter} onFilter={setFilter} />
      <BadgeGrid items={filtered} />
    </div>
  );
}

function PageHeader({ earned, total }: { earned: number; total: number }) {
  return (
    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="eyebrow-serif" style={{ marginBottom: 12 }}>Achievements</div>
        <h1 className="display-2" style={{ margin: 0 }}>
          Every milestone<br /><em style={{ color: 'var(--clay)', fontWeight: 300 }}>counts.</em>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <div>
          <div className="eyebrow">Earned</div>
          <div className="numeric-display" style={{ fontSize: 40 }}>
            {earned}<span style={{ fontSize: 18, color: 'var(--text-3)' }}>/{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryChips({ categories, filter, onFilter }: {
  categories: string[]; filter: string; onFilter: (f: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
      <Chip active={filter === 'all'} onClick={() => onFilter('all')}>All</Chip>
      {categories.map(c => (
        <Chip key={c} active={filter === c} onClick={() => onFilter(c)}>
          {CATEGORY_LABELS[c] ?? c}
        </Chip>
      ))}
    </div>
  );
}

function BadgeGrid({ items }: { items: Achievement[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {items.map(a => <BadgeCard key={a.id} achievement={a} />)}
    </div>
  );
}

function BadgeCard({ achievement: a }: { achievement: Achievement }) {
  const rarity = getRarity(a.xpReward);
  const color = RARITY_COLOR[rarity] ?? 'var(--text-3)';

  return (
    <Card padding={24} style={{ opacity: a.unlocked ? 1 : 0.55, position: 'relative', overflow: 'hidden' }}>
      {a.unlocked && (
        <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80,
          background: `radial-gradient(circle at top right, ${color}22, transparent 60%)` }} />
      )}
      <div style={{ fontSize: 44, marginBottom: 16, filter: a.unlocked ? 'none' : 'grayscale(0.8)' }}>
        {a.icon}
      </div>
      {!a.unlocked && (
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <FitIcon name="lock" size={16} color="var(--text-3)" />
        </div>
      )}
      <div className="title" style={{ marginBottom: 4 }}>{a.titleCs}</div>
      <div className="caption" style={{ marginBottom: 12, minHeight: 32 }}>{a.descriptionCs}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
        <span style={{ color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{rarity}</span>
        <span style={{ color: 'var(--text-3)' }}>
          {a.unlocked && a.unlockedAt
            ? new Date(a.unlockedAt).toLocaleDateString('cs-CZ')
            : `+${a.xpReward} XP`}
        </span>
      </div>
    </Card>
  );
}
