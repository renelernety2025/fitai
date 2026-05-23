'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, Button, Tag } from '@/components/v3';
import { challengeDuel, searchUsers } from '@/lib/api';

const DUEL_TYPES = [
  { value: 'MAX_REPS', label: 'Max reps' },
  { value: 'HEAVIEST_LIFT', label: 'Heaviest lift' },
  { value: 'LONGEST_HOLD', label: 'Longest hold' },
  { value: 'FASTEST_DISTANCE', label: 'Fastest distance' },
];

const DUEL_DURATIONS = [
  { value: 'HOUR_1', label: '1 hour' },
  { value: 'HOUR_6', label: '6 hours' },
  { value: 'HOUR_24', label: '24 hours' },
  { value: 'HOUR_48', label: '48 hours' },
  { value: 'WEEK', label: '1 week' },
];

type SearchResult = { id: string; name: string; avatarUrl: string | null; level: string };

interface ChallengeModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function ChallengeModal({ onClose, onCreated }: ChallengeModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [opponent, setOpponent] = useState<SearchResult | null>(null);
  const [type, setType] = useState<string>('MAX_REPS');
  const [metric, setMetric] = useState('');
  const [duration, setDuration] = useState<string>('HOUR_24');
  const [xpBet, setXpBet] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => {
      searchUsers(query.trim()).then(r => setResults(r as SearchResult[])).catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function submit() {
    if (!opponent || !metric.trim()) { setErr('Pick an opponent and a metric'); return; }
    setSubmitting(true);
    setErr(null);
    challengeDuel({ challengedId: opponent.id, type, metric: metric.trim(), duration, xpBet })
      .then(onCreated)
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : 'Could not create duel'))
      .finally(() => setSubmitting(false));
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-1)', borderRadius: 16, padding: 32, width: 520, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 8 }}>New duel</div>
        <h2 className="v3-display-3" style={{ margin: '0 0 24px' }}>Pick a fight.</h2>

        {!opponent ? (
          <>
            <label className="v3-body" style={{ display: 'block', marginBottom: 6, color: 'var(--text-2)' }}>Find opponent</label>
            <input
              type="text"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--stroke-2)', borderRadius: 8, color: 'var(--text-1)', fontSize: 15, marginBottom: 12 }}
            />
            <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => setOpponent(r)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', width: '100%', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', color: 'var(--text-1)' }}
                >
                  <Avatar name={r.name} src={r.avatarUrl ?? undefined} size={32} />
                  <span style={{ flex: 1 }}>{r.name}</span>
                  <Tag>{r.level}</Tag>
                </button>
              ))}
              {query.length >= 2 && results.length === 0 && (
                <div style={{ padding: 16, color: 'var(--text-3)', fontSize: 13 }}>No matches.</div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 16, background: 'var(--bg-2)', borderRadius: 8 }}>
            <Avatar name={opponent.name} src={opponent.avatarUrl ?? undefined} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-1)', fontWeight: 500 }}>{opponent.name}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{opponent.level}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOpponent(null)}>Change</Button>
          </div>
        )}

        <Field label="Challenge type">
          <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
            {DUEL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>

        <Field label="What to compare (e.g. 'Bench press', '5K run')">
          <input
            type="text"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="Bench press, push-ups…"
            maxLength={200}
            style={inputStyle}
          />
        </Field>

        <Field label="Duration">
          <select value={duration} onChange={(e) => setDuration(e.target.value)} style={selectStyle}>
            {DUEL_DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </Field>

        <Field label={`XP bet (${xpBet})`}>
          <input
            type="range"
            min={0}
            max={500}
            step={10}
            value={xpBet}
            onChange={(e) => setXpBet(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </Field>

        {err && <div style={{ color: 'var(--clay)', fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={submit} disabled={submitting || !opponent || !metric.trim()}>
            {submitting ? 'Sending…' : 'Challenge'}
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: 'var(--bg-2)',
  border: '1px solid var(--stroke-2)', borderRadius: 8, color: 'var(--text-1)', fontSize: 15,
};
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'none' };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="v3-body" style={{ display: 'block', marginBottom: 6, color: 'var(--text-2)', fontSize: 13 }}>{label}</label>
      {children}
    </div>
  );
}
