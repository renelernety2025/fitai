'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getPaidChallenges,
  createPaidChallenge,
  joinPaidChallenge,
} from '@/lib/api';

type Challenge = {
  id: string;
  name: string;
  description: string;
  entryFeeXP: number;
  potXP: number;
  metric: string;
  status: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  createdBy: { id: string; name: string };
  _count: { participants: number };
};

export default function PaidChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Challenge | null>(null);

  useEffect(() => {
    document.title = 'FitAI — Paid Challenges';
  }, []);

  useEffect(() => {
    loadChallenges();
  }, []);

  function loadChallenges() {
    getPaidChallenges()
      .then((c) => setChallenges(c as Challenge[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  function handleJoin(c: Challenge) {
    setConfirm(c);
  }

  function confirmJoin() {
    if (!confirm) return;
    setJoining(confirm.id);
    joinPaidChallenge(confirm.id)
      .then(() => {
        setConfirm(null);
        loadChallenges();
      })
      .catch(() => {})
      .finally(() => setJoining(null));
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <PageHeader onCreateClick={() => setShowCreate(true)} />

      {loading ? (
        <LoadingState />
      ) : challenges.length === 0 ? (
        <EmptyState />
      ) : (
        <ChallengeGrid
          challenges={challenges}
          joining={joining}
          onJoin={handleJoin}
        />
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={loadChallenges}
        />
      )}

      {confirm && (
        <ConfirmModal
          challenge={confirm}
          joining={!!joining}
          onConfirm={confirmJoin}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function PageHeader({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="eyebrow-serif" style={{ marginBottom: 12 }}>Compete</div>
        <h1 className="display-2" style={{ margin: 0 }}>
          Compete for<br />
          <em style={{ color: 'var(--clay)', fontWeight: 300 }}>real stakes.</em>
        </h1>
      </div>
      <Button variant="primary" icon={<FitIcon name="plus" size={14} />} onClick={onCreateClick}>
        Create Challenge
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)' }}>
      Loading...
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)', fontSize: 14 }}>
      No active challenges yet. Create the first one!
    </div>
  );
}

function ChallengeGrid({
  challenges,
  joining,
  onJoin,
}: {
  challenges: Challenge[];
  joining: string | null;
  onJoin: (c: Challenge) => void;
}) {
  return (
    <>
      <SectionHeader eyebrow="Active" title="Open challenges" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {challenges.map((c) => (
          <ChallengeCard key={c.id} challenge={c} joining={joining === c.id} onJoin={() => onJoin(c)} />
        ))}
      </div>
    </>
  );
}

function ChallengeCard({
  challenge: c,
  joining,
  onJoin,
}: {
  challenge: Challenge;
  joining: boolean;
  onJoin: () => void;
}) {
  const daysLeft = Math.max(0, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000));
  const metricLabel: Record<string, string> = {
    total_reps: 'Total Reps',
    total_volume: 'Total Volume',
    total_sessions: 'Sessions',
    streak_days: 'Streak Days',
  };

  return (
    <Card padding={28}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Tag>{metricLabel[c.metric] || c.metric}</Tag>
        <div className="caption" style={{ color: 'var(--accent)' }}>
          {daysLeft}d left
        </div>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px', color: 'var(--text-1)' }}>{c.name}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 20px', lineHeight: 1.5 }}>{c.description}</p>
      <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
        <StatBlock label="Entry" value={`${c.entryFeeXP} XP`} />
        <StatBlock label="Pot" value={`${c.potXP} XP`} accent />
        <StatBlock label="Players" value={`${c._count.participants}/${c.maxParticipants}`} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="caption" style={{ color: 'var(--text-3)' }}>by {c.createdBy.name}</span>
        <Button variant="primary" size="sm" onClick={onJoin} disabled={joining}>
          {joining ? 'Joining...' : 'Join'}
        </Button>
      </div>
    </Card>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="caption" style={{ color: 'var(--text-3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--text-1)' }}>{value}</div>
    </div>
  );
}

function ConfirmModal({
  challenge,
  joining,
  onConfirm,
  onCancel,
}: {
  challenge: Challenge;
  joining: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()}>
      <Card padding={32} style={{ maxWidth: 400, width: '90%' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 18, color: 'var(--text-1)' }}>Confirm Entry</h3>
        <p style={{ fontSize: 14, color: 'var(--text-2)', margin: '0 0 24px' }}>
          Join &quot;{challenge.name}&quot; for <strong>{challenge.entryFeeXP} XP</strong>?
          This will be deducted from your balance.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} disabled={joining}>
            {joining ? 'Joining...' : 'Pay & Join'}
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}

function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    entryFeeXP: 50,
    metric: 'total_reps',
    maxParticipants: 100,
    startDate: '',
    endDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    if (!form.name || !form.startDate || !form.endDate) return;
    setSubmitting(true);
    createPaidChallenge(form)
      .then(() => {
        onClose();
        onCreated();
      })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid var(--stroke-2)',
    background: 'var(--bg-1)',
    color: 'var(--text-1)',
    fontSize: 14,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
      <Card padding={32} style={{ maxWidth: 460, width: '90%' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--text-1)' }}>Create Challenge</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={inputStyle} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div style={{ display: 'flex', gap: 12 }}>
            <input style={inputStyle} type="number" placeholder="Entry Fee XP" value={form.entryFeeXP} onChange={(e) => setForm({ ...form, entryFeeXP: Number(e.target.value) })} />
            <select style={inputStyle} value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}>
              <option value="total_reps">Total Reps</option>
              <option value="total_volume">Total Volume</option>
              <option value="total_sessions">Sessions</option>
              <option value="streak_days">Streak Days</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input style={inputStyle} type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <input style={inputStyle} type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}
