'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Tag, SectionHeader } from '@/components/v3';
import { getCreators, applyAsCreator } from '@/lib/api';

type Creator = {
  id: string;
  displayName: string;
  bio: string | null;
  specializations: string[];
  subscriberCount: number;
  user: { id: string; name: string; avatarUrl: string | null };
};

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    document.title = 'FitAI — Creators';
  }, []);

  useEffect(() => {
    loadCreators();
  }, []);

  function loadCreators() {
    getCreators()
      .then((c) => setCreators(c as Creator[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <CreatorsHeader onApplyClick={() => setShowApply(true)} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)' }}>Loading...</div>
      ) : creators.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-3)', fontSize: 14 }}>
          No creators yet. Be the first to apply!
        </div>
      ) : (
        <>
          <SectionHeader eyebrow="Community" title="Approved Creators" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {creators.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </>
      )}

      {showApply && (
        <ApplyModal onClose={() => setShowApply(false)} onApplied={loadCreators} />
      )}
    </div>
  );
}

function CreatorsHeader({ onApplyClick }: { onApplyClick: () => void }) {
  return (
    <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div>
        <div className="eyebrow-serif" style={{ marginBottom: 12 }}>Create</div>
        <h1 className="display-2" style={{ margin: 0 }}>
          Creator<br />
          <em style={{ color: 'var(--clay)', fontWeight: 300 }}>program.</em>
        </h1>
      </div>
      <Button variant="primary" onClick={onApplyClick}>Apply as Creator</Button>
    </div>
  );
}

function CreatorCard({ creator: c }: { creator: Creator }) {
  const initials = c.displayName.slice(0, 2).toUpperCase();

  return (
    <Card padding={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>{c.displayName}</div>
          <div className="caption" style={{ color: 'var(--text-3)' }}>
            {c.subscriberCount} subscribers
          </div>
        </div>
      </div>
      {c.bio && (
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 16px', lineHeight: 1.5 }}>{c.bio}</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {c.specializations.map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
      </div>
    </Card>
  );
}

function ApplyModal({
  onClose,
  onApplied,
}: {
  onClose: () => void;
  onApplied: () => void;
}) {
  const [form, setForm] = useState({ displayName: '', bio: '', specializations: '' });
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    if (!form.displayName) return;
    setSubmitting(true);
    applyAsCreator({
      displayName: form.displayName,
      bio: form.bio || undefined,
      specializations: form.specializations.split(',').map((s) => s.trim()).filter(Boolean),
    })
      .then(() => { onClose(); onApplied(); })
      .catch(() => {})
      .finally(() => setSubmitting(false));
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--stroke-2)', background: 'var(--bg-1)',
    color: 'var(--text-1)', fontSize: 14,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
      <Card padding={32} style={{ maxWidth: 420, width: '90%' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--text-1)' }}>Apply as Creator</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={inputStyle} placeholder="Display Name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Bio (optional)" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <input style={inputStyle} placeholder="Specializations (comma separated)" value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Applying...' : 'Apply'}
          </Button>
        </div>
      </Card>
      </div>
    </div>
  );
}
