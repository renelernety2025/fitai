'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, Avatar, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getActiveDuels,
  getDuelHistory,
  submitDuelScore,
  challengeDuel,
} from '@/lib/api';

type Duel = {
  id: string; challengerName: string; challengedName: string;
  type: string; metric: string; xpBet: number;
  challengerScore: number | null; challengedScore: number | null;
  status: string; endsAt: string; winnerId: string | null; winnerName: string | null;
};

export default function DuelsPage() {
  const [active, setActive] = useState<Duel[]>([]);
  const [history, setHistory] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);

  const [scoreInput, setScoreInput] = useState<{ id: string; value: string } | null>(null);

  useEffect(() => { document.title = 'FitAI — Duels'; }, []);
  useEffect(() => {
    Promise.all([getActiveDuels(), getDuelHistory()])
      .then(([a, h]) => { setActive(a as Duel[]); setHistory(h as Duel[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleScore(id: string) {
    setScoreInput({ id, value: '' });
  }

  function submitScore() {
    if (!scoreInput || !scoreInput.value) return;
    submitDuelScore(scoreInput.id, Number(scoreInput.value))
      .then(() => getActiveDuels())
      .then(a => { setActive(a as Duel[]); setScoreInput(null); })
      .catch(() => {});
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <DuelsHeader />
      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)' }}>Loading...</div>
      ) : (
        <>
          <ActiveDuels duels={active} onScore={handleScore} />

          {scoreInput && (
            <Card padding={24} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="v3-body" style={{ color: 'var(--text-2)' }}>Enter score:</span>
              <input
                type="number"
                value={scoreInput.value}
                onChange={(e) => setScoreInput({ ...scoreInput, value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') submitScore(); }}
                autoFocus
                style={{
                  width: 100, padding: '8px 12px', background: 'var(--bg-2)',
                  border: '1px solid var(--stroke-2)', borderRadius: 'var(--r-sm)',
                  color: 'var(--text-1)', fontSize: 16, outline: 'none',
                }}
              />
              <Button variant="accent" size="sm" onClick={submitScore}>Submit</Button>
              <Button variant="ghost" size="sm" onClick={() => setScoreInput(null)}>Cancel</Button>
            </Card>
          )}

          <HistorySection duels={history} />
        </>
      )}
    </div>
  );

}

function DuelsHeader() {
  return (
    <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Duels</div>
        <h1 className="v3-display-2" style={{ margin: 0 }}>
          Head to<br /><em style={{ color: 'var(--clay)', fontWeight: 300 }}>head.</em>
        </h1>
      </div>
      <Button variant="primary" icon={<FitIcon name="plus" size={14} />} disabled>Challenge (coming soon)</Button>
    </div>
  );
}

function ActiveDuels({ duels, onScore }: { duels: Duel[]; onScore: (id: string) => void }) {
  if (duels.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-3)', fontSize: 14, marginBottom: 64 }}>
        No active duels. Challenge someone!
      </div>
    );
  }
  return (
    <>
      <SectionHeader eyebrow="Live now" title="Your active duels" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 64 }}>
        {duels.map(d => <DuelCard key={d.id} duel={d} onScore={() => onScore(d.id)} />)}
      </div>
    </>
  );
}

function DuelCard({ duel: d, onScore }: { duel: Duel; onScore: () => void }) {
  const winning = (d.challengerScore ?? 0) > (d.challengedScore ?? 0);
  const daysLeft = Math.max(0, Math.ceil((new Date(d.endsAt).getTime() - Date.now()) / 86400000));

  return (
    <Card padding={28}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Tag>{d.type} · {d.metric}</Tag>
        <div className="v3-caption" style={{ color: 'var(--accent)' }}>{daysLeft}d left</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
        <VsColumn name="You" score={d.challengerScore} leading={winning} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text-3)', fontStyle: 'italic' }}>vs</div>
        <VsColumn name={d.challengedName} score={d.challengedScore} leading={!winning} />
      </div>
      <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 'var(--r-pill)', overflow: 'hidden', display: 'flex' }}>
        <div style={{ flex: d.challengerScore ?? 1, background: 'var(--accent)' }} />
        <div style={{ flex: d.challengedScore ?? 1, background: 'var(--clay)' }} />
      </div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="v3-caption">{d.xpBet} XP bet</span>
        <Button variant="ghost" size="sm" onClick={onScore}>Log Score</Button>
      </div>
    </Card>
  );
}

function VsColumn({ name, score, leading }: { name: string; score: number | null; leading: boolean }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <Avatar size={48} name={name} ring={leading ? 'var(--accent)' : 'var(--stroke-2)'} />
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8, marginBottom: 6 }}>{name}</div>
      <div className="v3-numeric" style={{ fontSize: 36, color: leading ? 'var(--accent)' : 'var(--text-1)' }}>
        {score ?? '--'}
      </div>
    </div>
  );
}

function HistorySection({ duels }: { duels: Duel[] }) {
  if (duels.length === 0) return null;
  return (
    <>
      <SectionHeader eyebrow="Past duels" title="History" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {duels.map(d => (
          <Card key={d.id} padding={20} style={{ opacity: 0.75 }}>
            <div className="v3-caption" style={{ marginBottom: 8 }}>{d.type} · {d.metric}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--text-1)' }}>{d.challengerName}</span>
              <span style={{ color: 'var(--text-3)' }}>vs</span>
              <span style={{ color: 'var(--text-1)' }}>{d.challengedName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, marginTop: 8 }}>
              <span>{d.challengerScore ?? 0}</span>
              <span style={{ color: 'var(--text-3)' }}>:</span>
              <span>{d.challengedScore ?? 0}</span>
            </div>
            {d.winnerName && (
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
                Winner: {d.winnerName} (+{d.xpBet} XP)
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
