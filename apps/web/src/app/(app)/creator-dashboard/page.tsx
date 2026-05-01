'use client';

import { useState, useEffect } from 'react';
import { Card, Metric, BarChart, Chip } from '@/components/v3';
import {
  getDashboardStats, getSubscriberGrowth, getDashboardEarnings,
  getPostPerformance, getTopHashtags,
} from '@/lib/api';
import { ContentTools } from './ContentTools';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  subscriberCount: number; subscriberDelta: string; subscriberPositive: boolean;
  monthlyXP: number; totalXP: number; postCount: number;
  engagementRate: string; topPostTitle: string;
}
interface GrowthPoint { label: string; value: number }
interface EarningsWeek { label: string; xp: number }
export interface PostRow { id: string; title: string; views: number; likes: number; comments: number; isSubscriberOnly: boolean }

// ─── Section A: Stats Hero ────────────────────────────────────────────────────

function StatsHero({ stats }: { stats: Stats | null }) {
  const metrics = stats ? [
    { label: 'Subscribers', value: stats.subscriberCount, delta: stats.subscriberDelta, pos: stats.subscriberPositive },
    { label: 'XP this month', value: stats.monthlyXP.toLocaleString('en-US'), unit: 'XP' },
    { label: 'Total XP', value: stats.totalXP.toLocaleString('en-US'), unit: 'XP' },
    { label: 'Posts', value: stats.postCount },
    { label: 'Engagement', value: stats.engagementRate, unit: '%' },
    { label: 'Top post', value: stats.topPostTitle || '—' },
  ] : Array(6).fill(null);

  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ marginBottom: 20 }}>
        <div className="v3-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 6 }}>Creator Dashboard</div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-1)', lineHeight: 1 }}>
          Your creative hub
        </h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {metrics.map((m, i) => (
          <Card key={i} padding={20}>
            {m ? (
              <Metric
                label={m.label}
                value={m.value}
                unit={'unit' in m ? (m as { unit: string }).unit : undefined}
                delta={'delta' in m ? (m as { delta: string }).delta : undefined}
                deltaPositive={'pos' in m ? (m as { pos: boolean }).pos : undefined}
              />
            ) : (
              <div style={{ height: 60, background: 'var(--bg-3)', borderRadius: 8, opacity: 0.4 }} />
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

// ─── Section B: Analytics ─────────────────────────────────────────────────────

function Analytics({ growth, earnings, posts, hashtags }: {
  growth: GrowthPoint[]; earnings: EarningsWeek[]; posts: PostRow[]; hashtags: string[];
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div className="v3-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 16 }}>Analytika</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card padding={20}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Subscriber growth (30 days)</div>
          <BarChart data={growth.map((g) => g.value)} labels={growth.map((g) => g.label)}
            height={80} barW={12} gap={4} color="var(--accent)" highlight={growth.length - 1} />
        </Card>
        <Card padding={20}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>XP earnings (weeks)</div>
          <BarChart data={earnings.map((e) => e.xp)} labels={earnings.map((e) => e.label)}
            height={80} barW={12} gap={4} color="var(--accent)" highlight={earnings.length - 1} />
        </Card>
      </div>

      <Card padding={20} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Post performance</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--stroke-1)' }}>
                {['Post', 'Views', 'Likes', 'Comments', 'Type'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.length === 0
                ? <tr><td colSpan={5} style={{ padding: '20px 12px', color: 'var(--text-3)', textAlign: 'center' }}>No posts</td></tr>
                : posts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--stroke-1)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-1)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{p.views.toLocaleString('en-US')}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{p.likes}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{p.comments}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: p.isSubscriberOnly ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-3)', color: p.isSubscriberOnly ? 'var(--accent)' : 'var(--text-3)' }}>
                        {p.isSubscriberOnly ? 'Placené' : 'Zdarma'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {hashtags.length > 0 && (
        <Card padding={20}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Top hashtagy</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hashtags.map((tag) => <Chip key={tag}>#{tag}</Chip>)}
          </div>
        </Card>
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreatorDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [earnings, setEarnings] = useState<EarningsWeek[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);

  async function loadAll() {
    const [s, g, e, p, h] = await Promise.allSettled([
      getDashboardStats(), getSubscriberGrowth(30), getDashboardEarnings(12),
      getPostPerformance(20), getTopHashtags(),
    ]);
    if (s.status === 'fulfilled') setStats(s.value as Stats);
    if (g.status === 'fulfilled') setGrowth((g.value as GrowthPoint[]) ?? []);
    if (e.status === 'fulfilled') setEarnings((e.value as EarningsWeek[]) ?? []);
    if (p.status === 'fulfilled') setPosts((p.value as PostRow[]) ?? []);
    if (h.status === 'fulfilled') setHashtags((h.value as string[]) ?? []);
  }

  useEffect(() => { loadAll(); }, []);

  return (
    <div style={{ paddingTop: 32 }}>
      <StatsHero stats={stats} />
      <Analytics growth={growth} earnings={earnings} posts={posts} hashtags={hashtags} />
      <ContentTools posts={posts} onRefresh={loadAll} />
    </div>
  );
}
