'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, Avatar, AvatarStack, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getMySquad,
  getSquadLeaderboard,
  createSquad,
  leaveSquad,
} from '@/lib/api';

type SquadMember = { id: string; name: string; weeklyXP: number; avatarUrl: string | null };
type Squad = { id: string; name: string; motto: string; weeklyXP: number; members: SquadMember[] };
type LeaderboardRow = { id: string; name: string; memberCount: number; weeklyXP: number };

export default function SquadsPage() {
  const [mySquad, setMySquad] = useState<Squad | null>(null);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', motto: '' });

  useEffect(() => { document.title = 'FitAI — Squads'; }, []);

  function load() {
    setLoading(true);
    Promise.all([getMySquad().catch(() => null), getSquadLeaderboard().catch(() => [])])
      .then(([s, b]) => { setMySquad(s as Squad | null); setBoard(b as LeaderboardRow[]); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleCreate() {
    if (!form.name.trim()) return;
    createSquad(form).then(() => { setShowCreate(false); load(); }).catch(() => {});
  }

  function handleLeave() {
    if (!mySquad) return;
    leaveSquad(mySquad.id).then(() => load()).catch(() => {});
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <SquadsHeader onSearch={() => {}} onCreate={() => setShowCreate(true)} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)' }}>Loading...</div>
      ) : (
        <>
          <YourSquads mySquad={mySquad} onLeave={handleLeave} />
          <DiscoverSection board={board} />
        </>
      )}

      {showCreate && (
        <CreateModal form={form} setForm={setForm} onCreate={handleCreate} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}

function SquadsHeader({ onSearch, onCreate }: { onSearch: () => void; onCreate: () => void }) {
  return (
    <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="eyebrow-serif" style={{ marginBottom: 12 }}>Squads</div>
        <h1 className="display-2" style={{ margin: 0, maxWidth: 720 }}>
          Stronger,<br /><em style={{ color: 'var(--clay)', fontWeight: 300 }}>together.</em>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button variant="ghost" icon={<FitIcon name="search" size={14} />}>Find a squad</Button>
        <Button variant="primary" icon={<FitIcon name="plus" size={14} />} onClick={onCreate}>Create squad</Button>
      </div>
    </div>
  );
}

function YourSquads({ mySquad, onLeave }: { mySquad: Squad | null; onLeave: () => void }) {
  if (!mySquad) {
    return (
      <Card padding={32} style={{ marginBottom: 64, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 16 }}>You are not in any squad yet.</p>
      </Card>
    );
  }
  return (
    <>
      <SectionHeader eyebrow="Your squads" title="1 active" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 64 }}>
        <Card padding={24} hover>
          <div className="title" style={{ marginBottom: 6 }}>{mySquad.name}</div>
          {mySquad.motto && <div className="caption" style={{ marginBottom: 12, fontStyle: 'italic' }}>{mySquad.motto}</div>}
          <div className="caption" style={{ marginBottom: 16 }}>{mySquad.members.length} members</div>
          <AvatarStack avatars={mySquad.members.map(m => ({ name: m.name, src: m.avatarUrl ?? undefined }))} size={26} max={5} />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>
              {mySquad.weeklyXP.toLocaleString()} XP
            </span>
            <Button variant="ghost" size="sm" onClick={onLeave}>Leave</Button>
          </div>
        </Card>
      </div>
    </>
  );
}

function DiscoverSection({ board }: { board: LeaderboardRow[] }) {
  if (board.length === 0) return null;
  return (
    <>
      <SectionHeader eyebrow="Discover" title="Find your people" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {board.map(s => (
          <Card key={s.id} padding={20} hover>
            <div style={{ marginBottom: 10 }}><Tag>{s.memberCount} members</Tag></div>
            <div className="title" style={{ marginBottom: 6 }}>{s.name}</div>
            <div className="caption">{s.weeklyXP.toLocaleString()} weekly XP</div>
          </Card>
        ))}
      </div>
    </>
  );
}

function CreateModal({ form, setForm, onCreate, onClose }: {
  form: { name: string; motto: string };
  setForm: (f: { name: string; motto: string }) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
      <Card padding={32} style={{ width: '100%', maxWidth: 420 }}>
        <h3 className="title" style={{ marginBottom: 16 }}>Create Squad</h3>
        <div className="caption" style={{ marginBottom: 4 }}>Name</div>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Squad name"
          style={{ width: '100%', padding: '10px 14px', marginBottom: 16, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 8, color: 'var(--text-1)', fontSize: 14 }} />
        <div className="caption" style={{ marginBottom: 4 }}>Motto</div>
        <input value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} placeholder="Optional motto"
          style={{ width: '100%', padding: '10px 14px', marginBottom: 24, background: 'var(--bg-2)', border: '1px solid var(--stroke-1)', borderRadius: 8, color: 'var(--text-1)', fontSize: 14 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="accent" onClick={onCreate} style={{ flex: 1 }}>Create</Button>
        </div>
      </Card>
    </div>
  );
}
