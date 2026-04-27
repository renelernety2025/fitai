'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Chip, Avatar, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getSocialFeed,
  type FeedItem,
} from '@/lib/api';

function timeAgo(date: string) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

type Filter = 'following' | 'squads' | 'worldwide';

export default function CommunityPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<Filter>('following');
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'FitAI — Community'; }, []);
  useEffect(() => {
    getSocialFeed().then(setFeed).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <Header />
      <ComposerCard />
      <FilterChips filter={filter} onChange={setFilter} />
      <FeedList feed={feed} loading={loading} />
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="eyebrow-serif" style={{ marginBottom: 12 }}>Community</div>
        <h1 className="display-2" style={{ margin: 0 }}>
          The<br /><em style={{ color: 'var(--clay)', fontWeight: 300 }}>feed.</em>
        </h1>
      </div>
      <Button variant="primary" icon={<FitIcon name="plus" size={14} />}>New post</Button>
    </div>
  );
}

function ComposerCard() {
  return (
    <Card padding={20} style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar size={36} name="You" />
        <div style={{ flex: 1, fontSize: 14, color: 'var(--text-3)' }}>
          Share your session, your PR, your wins...
        </div>
        <Button size="sm" variant="glass" icon={<FitIcon name="dumbbell" size={12} />}>Workout</Button>
        <Button size="sm" variant="glass" icon={<FitIcon name="trophy" size={12} />}>PR</Button>
        <Button size="sm" variant="accent">Post</Button>
      </div>
    </Card>
  );
}

function FilterChips({ filter, onChange }: { filter: Filter; onChange: (f: Filter) => void }) {
  const filters: Filter[] = ['following', 'squads', 'worldwide'];
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      {filters.map(f => (
        <Chip key={f} active={filter === f} onClick={() => onChange(f)}>
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </Chip>
      ))}
    </div>
  );
}

function PostCard({ item }: { item: FeedItem }) {
  const isPR = item.type === 'pr' || item.type === 'personal_record';
  const isStreak = item.type === 'streak';
  return (
    <Card padding={0} style={{ marginBottom: 16, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar src={item.user.avatarUrl ?? undefined} name={item.user.name} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href={`/profile/${item.user.id}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', textDecoration: 'none' }}>
              {item.user.name}
            </Link>
            {isPR && <span className="v3-tag" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', padding: '4px 10px', borderRadius: 'var(--r-xs)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>NEW PR</span>}
            {isStreak && <span className="v3-tag" style={{ background: 'color-mix(in srgb, #FFB547 12%, transparent)', color: '#FFB547', padding: '4px 10px', borderRadius: 'var(--r-xs)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>STREAK</span>}
          </div>
          <div className="caption">{timeAgo(item.createdAt)}</div>
        </div>
      </div>
      <div style={{ padding: '0 24px 16px' }}>
        <p style={{ fontSize: 15, color: 'var(--text-1)', margin: 0, lineHeight: 1.5 }}>{item.title}</p>
        {item.body && <p style={{ fontSize: 14, color: 'var(--text-2)', margin: '4px 0 0', lineHeight: 1.5 }}>{item.body}</p>}
      </div>
      <EngagementFooter />
    </Card>
  );
}

function EngagementFooter() {
  return (
    <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 20, borderTop: '1px solid var(--stroke-1)' }}>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer' }}>
        <FitIcon name="heart" size={16} /> <span>0</span>
      </button>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
        <FitIcon name="bolt" size={16} /> <span>High-five</span>
      </button>
    </div>
  );
}

function FeedList({ feed, loading }: { feed: FeedItem[]; loading: boolean }) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)' }}>Loading...</div>;
  }
  if (feed.length === 0) {
    return <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)', fontSize: 14 }}>Feed is empty. Follow other athletes or start training.</div>;
  }
  return <>{feed.map(item => <PostCard key={item.id} item={item} />)}</>;
}
