'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, Avatar, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { useAuth } from '@/lib/auth-context';
import { getLeagueCurrent, joinLeague } from '@/lib/api';

const TIER_COLORS: Record<string, string> = {
  bronze: '#A06B45', silver: '#B8B8B8', gold: '#E5B45A',
  platinum: '#9FB5C4', diamond: '#7BBED8', master: '#C8A2D8', legend: 'var(--accent)',
};

const TIERS = [
  { name: 'Bronze', xp: '0' }, { name: 'Silver', xp: '500' }, { name: 'Gold', xp: '2,000' },
  { name: 'Platinum', xp: '6,000' }, { name: 'Diamond', xp: '15,000' },
  { name: 'Master', xp: '40,000' }, { name: 'Legend', xp: 'inf' },
];

interface LeagueData {
  tier: string; rank: number; weeklyXP: number; nextTierXP: number;
  joined: boolean; endsAt: string;
  leaderboard: { userId: string; name: string; weeklyXP: number; rank: number }[];
  promotionLine: number; relegationLine: number;
}

export default function LeaguesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeagueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => { document.title = 'FitAI — Leagues'; }, []);
  useEffect(() => {
    getLeagueCurrent().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  async function handleJoin() {
    setJoining(true);
    try { setData(await joinLeague()); } catch { /* noop */ }
    setJoining(false);
  }

  const tierKey = data?.tier?.toLowerCase() ?? 'bronze';
  const tierColor = TIER_COLORS[tierKey] ?? '#B8B8B8';

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <LeagueHeader tier={data?.tier ?? 'Leagues'} />

      {loading && <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)' }}>Loading...</div>}

      {!loading && data && (
        <>
          <TierLadder currentTier={tierKey} />
          <LeagueBoard data={data} userId={user?.id} tierColor={tierColor} />
        </>
      )}

      {!loading && !data && (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>No active league.</p>
          <Button variant="accent" onClick={handleJoin} disabled={joining}>
            {joining ? 'Joining...' : 'Join league'}
          </Button>
        </div>
      )}
    </div>
  );
}

function LeagueHeader({ tier }: { tier: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Leagues</div>
      <h1 className="v3-display-2" style={{ margin: 0 }}>
        Climb the<br /><em style={{ color: 'var(--clay)', fontWeight: 300 }}>ranks.</em>
      </h1>
    </div>
  );
}

function TierLadder({ currentTier }: { currentTier: string }) {
  const currentIdx = TIERS.findIndex(t => t.name.toLowerCase() === currentTier);
  return (
    <Card padding={32} style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        {TIERS.map((t, i) => {
          const c = TIER_COLORS[t.name.toLowerCase()] ?? '#B8B8B8';
          const isCurrent = i === currentIdx;
          const isPast = i < currentIdx;
          return (
            <div key={t.name} style={{ flex: 1, textAlign: 'center', opacity: isPast ? 0.4 : 1 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, margin: '0 auto 12px',
                background: isCurrent ? `linear-gradient(135deg, ${c}, ${c}88)` : `${c}22`,
                border: isCurrent ? `2px solid ${c}` : `1px solid ${c}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isCurrent ? `0 0 24px ${c}66` : 'none',
              }}>
                <FitIcon name="trophy" size={24} color={c} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: isCurrent ? 'var(--text-1)' : 'var(--text-3)' }}>{t.name}</div>
              <div className="v3-caption" style={{ fontFamily: 'var(--font-mono)' }}>{t.xp} XP</div>
              {isCurrent && <div style={{ marginTop: 8 }}><Tag color="var(--accent)">You are here</Tag></div>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function LeagueBoard({ data, userId, tierColor }: { data: LeagueData; userId?: string; tierColor: string }) {
  const lb = data.leaderboard.slice(0, 20);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
      <div>
        <SectionHeader eyebrow={`${data.tier} league`} title="This season" />
        <Card padding={0}>
          {lb.map((p, i) => {
            const isMe = p.userId === userId;
            return (
              <div key={p.userId} style={{
                display: 'grid', gridTemplateColumns: '60px 40px 1fr 100px',
                gap: 16, padding: '16px 24px', alignItems: 'center',
                background: isMe ? 'rgba(232,93,44,0.06)' : 'transparent',
                borderBottom: i < lb.length - 1 ? '1px solid var(--stroke-1)' : 'none',
              }}>
                <div className="v3-numeric" style={{
                  fontSize: 22,
                  color: p.rank <= 3 ? 'var(--accent)' : p.rank <= 10 ? 'var(--sage, #A8B89A)' : 'var(--text-3)',
                }}>
                  {String(p.rank).padStart(2, '0')}
                </div>
                <Avatar size={36} name={p.name} />
                <div style={{ fontSize: 14, color: 'var(--text-1)' }}>
                  {p.name}
                  {isMe && <span style={{ color: 'var(--accent)', fontSize: 10, marginLeft: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>You</span>}
                </div>
                <div className="v3-numeric" style={{ fontSize: 16 }}>{p.weeklyXP.toLocaleString()}</div>
              </div>
            );
          })}
          <div style={{ padding: '12px 24px', borderTop: '2px dashed var(--stroke-2)', textAlign: 'center', color: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Promotion zone · Top {data.promotionLine}
          </div>
        </Card>
      </div>
      <PromotionSidebar data={data} />
    </div>
  );
}

function PromotionSidebar({ data }: { data: LeagueData }) {
  const daysLeft = Math.max(0, Math.ceil((new Date(data.endsAt).getTime() - Date.now()) / 86400000));
  return (
    <div>
      <SectionHeader eyebrow="Promotion bar" title="What you need" />
      <Card padding={28} style={{ marginBottom: 16 }}>
        <div className="v3-caption" style={{ marginBottom: 8 }}>Days remaining</div>
        <div className="v3-numeric" style={{ fontSize: 56, color: 'var(--accent)' }}>{daysLeft}</div>
        <div style={{ height: 1, background: 'var(--stroke-1)', margin: '20px 0' }} />
        <div className="v3-caption" style={{ marginBottom: 8 }}>Your weekly XP</div>
        <div className="v3-numeric" style={{ fontSize: 32 }}>{data.weeklyXP.toLocaleString()}</div>
      </Card>
    </div>
  );
}
