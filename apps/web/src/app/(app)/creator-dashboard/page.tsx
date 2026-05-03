'use client';

import { useState, useEffect } from 'react';
import { Card, Metric, BarChart, Chip } from '@/components/v3';
import {
  getDashboardStats, getSubscriberGrowth, getDashboardEarnings,
  getPostPerformance, getTopHashtags,
} from '@/lib/api';
import { ContentTools } from './ContentTools';

// ─── Types (match backend response shapes from creator-dashboard.service.ts) ──

interface TopPost {
  id: string;
  caption?: string;
  likeCount: number;
  commentCount: number;
  photo?: string;
}

interface Stats {
  subscribers: number;
  monthlyXPEarned: number;
  totalXPEarned: number;
  posts: number;
  subscriberOnlyPosts: number;
  engagementRate: number;
  topPost: TopPost | null;
}

interface GrowthPoint { date: string; newSubs: number; churn: number }
interface EarningsWeek { week: string; tips: number; subscriptions: number }
interface HashtagCount { name: string; count: number }
export interface PostRow {
  id: string;
  caption: string | null;
  type: string;
  likeCount: number;
  commentCount: number;
  engagementScore: number;
  isSubscriberOnly: boolean;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function postTitle(p: { caption?: string | null }, fallback = '(bez textu)'): string {
  const text = (p.caption || '').trim();
  if (!text) return fallback;
  return text.length > 60 ? text.slice(0, 60) + '…' : text;
}

function shortDate(iso: string): string {
  // YYYY-MM-DD → MM-DD
  return iso.slice(5);
}

// ─── Section A: Stats Hero ────────────────────────────────────────────────────

function StatsHero({ stats, statsError }: { stats: Stats | null; statsError: boolean }) {
  if (statsError && !stats) {
    return (
      <section style={{ marginBottom: 40 }}>
        <div style={{ marginBottom: 20 }}>
          <div className="v3-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 6 }}>Creator Dashboard</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-1)', lineHeight: 1 }}>
            Your creative hub
          </h1>
        </div>
        <Card padding={28}>
          <div style={{ textAlign: 'center' }}>
            <div className="v3-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 8 }}>Creator status pending</div>
            <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.5, margin: '0 auto', maxWidth: 480 }}>
              Tento účet zatím nemá schválený Creator profil. Stats hub se aktivuje, jakmile tě admin schválí jako Creator. Mezi tím si můžeš prohlížet ostatní sekce níže.
            </p>
          </div>
        </Card>
      </section>
    );
  }

  const metrics = stats ? [
    { label: 'Subscribers', value: stats.subscribers },
    { label: 'XP this month', value: stats.monthlyXPEarned.toLocaleString('en-US'), unit: 'XP' },
    { label: 'Total XP', value: stats.totalXPEarned.toLocaleString('en-US'), unit: 'XP' },
    { label: 'Posts', value: stats.posts },
    { label: 'Subscriber-only', value: stats.subscriberOnlyPosts },
    { label: 'Engagement', value: stats.engagementRate.toFixed(1) },
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
              />
            ) : (
              <div style={{ height: 60, background: 'var(--bg-3)', borderRadius: 8, opacity: 0.4 }} />
            )}
          </Card>
        ))}
      </div>
      {stats?.topPost && (
        <Card padding={16} style={{ marginTop: 12 }}>
          <div className="v3-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 6 }}>Top post</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flex: 1, color: 'var(--text-1)', fontSize: 14 }}>{postTitle(stats.topPost)}</span>
            <span className="v3-numeric" style={{ color: 'var(--text-2)', fontSize: 12 }}>♥ {stats.topPost.likeCount}</span>
            <span className="v3-numeric" style={{ color: 'var(--text-2)', fontSize: 12 }}>💬 {stats.topPost.commentCount}</span>
          </div>
        </Card>
      )}
    </section>
  );
}

// ─── Section B: Analytics ─────────────────────────────────────────────────────

function Analytics({ growth, earnings, posts, hashtags }: {
  growth: GrowthPoint[]; earnings: EarningsWeek[]; posts: PostRow[]; hashtags: HashtagCount[];
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div className="v3-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 16 }}>Analytika</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card padding={20}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Subscriber growth (30 days)</div>
          <BarChart data={growth.map((g) => g.newSubs)} labels={growth.map((g) => shortDate(g.date))}
            height={80} barW={12} gap={4} color="var(--accent)" highlight={growth.length - 1} />
        </Card>
        <Card padding={20}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>XP earnings (weeks)</div>
          <BarChart data={earnings.map((e) => e.tips + e.subscriptions)} labels={earnings.map((e) => shortDate(e.week))}
            height={80} barW={12} gap={4} color="var(--accent)" highlight={earnings.length - 1} />
        </Card>
      </div>

      <Card padding={20} style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Post performance</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--stroke-1)' }}>
                {['Post', 'Engagement', 'Likes', 'Comments', 'Type'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 500, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.length === 0
                ? <tr><td colSpan={5} style={{ padding: '20px 12px', color: 'var(--text-3)', textAlign: 'center' }}>No posts</td></tr>
                : posts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--stroke-1)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-1)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{postTitle(p)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{Math.round(p.engagementScore || 0).toLocaleString('en-US')}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{p.likeCount}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{p.commentCount}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 'var(--r-pill)', background: p.isSubscriberOnly ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--bg-3)', color: p.isSubscriberOnly ? 'var(--accent)' : 'var(--text-3)' }}>
                        {p.isSubscriberOnly ? 'Paid' : 'Free'}
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
          <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Top hashtags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hashtags.map((tag) => (
              <Chip key={tag.name}>#{tag.name} · {tag.count}</Chip>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreatorDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [earnings, setEarnings] = useState<EarningsWeek[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [hashtags, setHashtags] = useState<HashtagCount[]>([]);

  async function loadAll() {
    const [s, g, e, p, h] = await Promise.allSettled([
      getDashboardStats(), getSubscriberGrowth(30), getDashboardEarnings(12),
      getPostPerformance(20), getTopHashtags(),
    ]);
    if (s.status === 'fulfilled') {
      setStats(s.value as Stats);
      setStatsError(false);
    } else {
      setStats(null);
      setStatsError(true);
    }
    if (g.status === 'fulfilled') setGrowth((g.value as GrowthPoint[]) ?? []);
    if (e.status === 'fulfilled') setEarnings((e.value as EarningsWeek[]) ?? []);
    if (p.status === 'fulfilled') setPosts((p.value as PostRow[]) ?? []);
    if (h.status === 'fulfilled') setHashtags((h.value as HashtagCount[]) ?? []);
  }

  useEffect(() => { loadAll(); }, []);

  return (
    <div style={{ paddingTop: 32 }}>
      <StatsHero stats={stats} statsError={statsError} />
      <Analytics growth={growth} earnings={earnings} posts={posts} hashtags={hashtags} />
      <ContentTools posts={posts} onRefresh={loadAll} />
    </div>
  );
}
