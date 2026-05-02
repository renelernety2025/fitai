'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, SectionHeader } from '@/components/v3';
import {
  getMyOrg,
  createOrg,
  getOrgDashboard,
  getOrgLeaderboard,
  getOrgChallenges,
  inviteOrgMember,
  createOrgChallenge,
} from '@/lib/api/user';
import type { OrgDashboard, OrgMember } from '@/lib/api/user';

type Org = { id: string; name: string; slug: string; plan: string; myRole: string; members: any[] };
type OrgChallenge = { id: string; name: string; metric: string; startDate: string; endDate: string; isActive: boolean };

export default function EnterprisePage() {
  const [org, setOrg] = useState<Org | null>(null);
  const [stats, setStats] = useState<OrgDashboard | null>(null);
  const [board, setBoard] = useState<OrgMember[]>([]);
  const [challenges, setChallenges] = useState<OrgChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  useEffect(() => { document.title = 'FitAI — Business'; }, []);

  function load() {
    setLoading(true);
    getMyOrg()
      .then((o: Org | null) => {
        setOrg(o);
        if (o) return loadOrgData(o.id);
      })
      .catch(() => setOrg(null))
      .finally(() => setLoading(false));
  }

  function loadOrgData(id: string) {
    return Promise.all([
      getOrgDashboard(id).catch(() => null),
      getOrgLeaderboard(id).catch(() => []),
      getOrgChallenges(id).catch(() => []),
    ]).then(([s, b, c]) => {
      setStats(s);
      setBoard(b);
      setChallenges(c);
    });
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <HeroHeader hasOrg={!!org} onCreate={() => setShowCreate(true)} />

      {org ? (
        <>
          <StatsGrid stats={stats} />
          <MemberLeaderboard board={board} isAdmin={org.myRole === 'ADMIN'} onInvite={() => setShowInvite(true)} />
          <ChallengesSection
            challenges={challenges}
            isAdmin={org.myRole === 'ADMIN'}
            onCreate={() => setShowChallenge(true)}
          />
        </>
      ) : (
        <LandingBenefits />
      )}

      {showCreate && <CreateOrgModal onClose={() => setShowCreate(false)} onDone={load} />}
      {showInvite && org && <InviteModal orgId={org.id} onClose={() => setShowInvite(false)} onDone={load} />}
      {showChallenge && org && <ChallengeModal orgId={org.id} onClose={() => setShowChallenge(false)} onDone={load} />}
    </div>
  );
}

function HeroHeader({ hasOrg, onCreate }: { hasOrg: boolean; onCreate: () => void }) {
  return (
    <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Enterprise</div>
        <h1 className="v3-display-2" style={{ margin: 0, maxWidth: 720 }}>
          FitAI for<br /><em style={{ color: 'var(--clay)', fontWeight: 300 }}>Business.</em>
        </h1>
      </div>
      {!hasOrg && <Button variant="accent" onClick={onCreate}>Create organization</Button>}
    </div>
  );
}

function StatsGrid({ stats }: { stats: OrgDashboard | null }) {
  if (!stats) return null;
  const items = [
    { label: 'Active members', value: stats.activeMembers },
    { label: 'Sessions this week', value: stats.sessionsThisWeek },
    { label: 'Avg fitness score', value: stats.avgFitnessScore },
    { label: 'Team streak', value: `${stats.teamStreak}d` },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
      {items.map((s) => (
        <Card key={s.label} padding={24}>
          <div className="v3-caption" style={{ marginBottom: 8, color: 'var(--text-3)' }}>{s.label}</div>
          <div className="v3-display-3" style={{ color: 'var(--text-1)' }}>{s.value}</div>
        </Card>
      ))}
    </div>
  );
}

function MemberLeaderboard({ board, isAdmin, onInvite }: { board: OrgMember[]; isAdmin: boolean; onInvite: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionHeader eyebrow="Team" title="Leaderboard" />
        {isAdmin && <Button variant="ghost" size="sm" onClick={onInvite}>Invite member</Button>}
      </div>
      <Card padding={0} style={{ marginBottom: 48, overflow: 'hidden' }}>
        {board.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>No members yet.</div>
        ) : (
          board.map((m, i) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px',
              borderBottom: i < board.length - 1 ? '1px solid var(--stroke-1)' : 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, width: 24, color: 'var(--text-3)' }}>
                {i + 1}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'var(--text-2)', overflow: 'hidden',
              }}>
                {m.avatarUrl ? <img src={m.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text-1)' }}>{m.name}</div>
                <div className="v3-caption" style={{ color: 'var(--text-3)' }}>{m.streak}d streak</div>
              </div>
              <Tag>{m.role}</Tag>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
                {m.xp.toLocaleString()} XP
              </span>
            </div>
          ))
        )}
      </Card>
    </>
  );
}

function ChallengesSection({ challenges, isAdmin, onCreate }: { challenges: OrgChallenge[]; isAdmin: boolean; onCreate: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionHeader eyebrow="Challenges" title="Team competitions" />
        {isAdmin && <Button variant="ghost" size="sm" onClick={onCreate}>New challenge</Button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {challenges.length === 0 ? (
          <Card padding={32}><p className="v3-caption" style={{ color: 'var(--text-3)' }}>No challenges yet.</p></Card>
        ) : challenges.map((c) => (
          <Card key={c.id} padding={20} hover>
            <div className="v3-title" style={{ marginBottom: 8 }}>{c.name}</div>
            <div className="v3-caption" style={{ marginBottom: 8, color: 'var(--text-3)' }}>Metric: {c.metric}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag>{c.isActive ? 'Active' : 'Ended'}</Tag>
              <Tag>{new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(c.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Tag>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function LandingBenefits() {
  const benefits = [
    { title: 'Team Analytics', desc: 'Track engagement, fitness scores, and participation across your organization.' },
    { title: 'Company Challenges', desc: 'Create custom fitness challenges to boost team morale and wellness.' },
    { title: 'Leaderboards', desc: 'Friendly competition drives results. See who is leading the pack.' },
    { title: 'Member Management', desc: 'Invite employees by email. Manage roles and access easily.' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 32 }}>
      {benefits.map((b) => (
        <Card key={b.title} padding={32} hover>
          <div className="v3-title" style={{ marginBottom: 8 }}>{b.title}</div>
          <div className="v3-caption" style={{ color: 'var(--text-3)' }}>{b.desc}</div>
        </Card>
      ))}
    </div>
  );
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', padding: '10px 14px', marginBottom: 16,
  background: 'var(--bg-2)', border: '1px solid var(--stroke-1)',
  borderRadius: 8, color: 'var(--text-1)', fontSize: 14,
};

function CreateOrgModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ name: '', slug: '', industry: '', size: '' });
  function handle() {
    if (!f.name.trim() || !f.slug.trim()) return;
    createOrg(f).then(() => { onClose(); onDone(); }).catch(() => {});
  }
  return (
    <ModalShell onClose={onClose}>
      <h3 className="v3-title" style={{ marginBottom: 16 }}>Create Organization</h3>
      <div className="v3-caption" style={{ marginBottom: 4 }}>Name</div>
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Acme Corp" style={INPUT_STYLE} />
      <div className="v3-caption" style={{ marginBottom: 4 }}>Slug</div>
      <input value={f.slug} onChange={e => setF({ ...f, slug: e.target.value })} placeholder="acme-corp" style={INPUT_STYLE} />
      <div className="v3-caption" style={{ marginBottom: 4 }}>Industry (optional)</div>
      <input value={f.industry} onChange={e => setF({ ...f, industry: e.target.value })} placeholder="Technology" style={INPUT_STYLE} />
      <div className="v3-caption" style={{ marginBottom: 4 }}>Size</div>
      <select value={f.size} onChange={e => setF({ ...f, size: e.target.value })} style={INPUT_STYLE}>
        <option value="">Select</option>
        <option value="1-50">1-50</option>
        <option value="51-200">51-200</option>
        <option value="201-500">201-500</option>
        <option value="500+">500+</option>
      </select>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="accent" onClick={handle} style={{ flex: 1 }}>Create</Button>
      </div>
    </ModalShell>
  );
}

function InviteModal({ orgId, onClose, onDone }: { orgId: string; onClose: () => void; onDone: () => void }) {
  const [email, setEmail] = useState('');
  function handle() {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    inviteOrgMember(orgId, trimmed).then(() => { onClose(); onDone(); }).catch(() => {});
  }
  return (
    <ModalShell onClose={onClose}>
      <h3 className="v3-title" style={{ marginBottom: 16 }}>Invite Member</h3>
      <div className="v3-caption" style={{ marginBottom: 4 }}>Email</div>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" style={INPUT_STYLE} />
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="accent" onClick={handle} style={{ flex: 1 }}>Send invite</Button>
      </div>
    </ModalShell>
  );
}

function ChallengeModal({ orgId, onClose, onDone }: { orgId: string; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ name: '', description: '', metric: 'sessions', startDate: '', endDate: '' });
  function handle() {
    if (!f.name.trim() || !f.startDate || !f.endDate) return;
    createOrgChallenge(orgId, f).then(() => { onClose(); onDone(); }).catch(() => {});
  }
  return (
    <ModalShell onClose={onClose}>
      <h3 className="v3-title" style={{ marginBottom: 16 }}>New Challenge</h3>
      <div className="v3-caption" style={{ marginBottom: 4 }}>Name</div>
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="30-Day Step Challenge" style={INPUT_STYLE} />
      <div className="v3-caption" style={{ marginBottom: 4 }}>Description (optional)</div>
      <input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Walk 10k steps daily" style={INPUT_STYLE} />
      <div className="v3-caption" style={{ marginBottom: 4 }}>Metric</div>
      <select value={f.metric} onChange={e => setF({ ...f, metric: e.target.value })} style={INPUT_STYLE}>
        <option value="sessions">Sessions</option>
        <option value="minutes">Minutes</option>
        <option value="xp">XP</option>
        <option value="streak">Streak days</option>
      </select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <div className="v3-caption" style={{ marginBottom: 4 }}>Start</div>
          <input type="date" value={f.startDate} onChange={e => setF({ ...f, startDate: e.target.value })} style={INPUT_STYLE} />
        </div>
        <div>
          <div className="v3-caption" style={{ marginBottom: 4 }}>End</div>
          <input type="date" value={f.endDate} onChange={e => setF({ ...f, endDate: e.target.value })} style={INPUT_STYLE} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
        <Button variant="accent" onClick={handle} style={{ flex: 1 }}>Create</Button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <Card padding={32} style={{ width: '100%', maxWidth: 440 }}>{children}</Card>
    </div>
  );
}
