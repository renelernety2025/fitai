'use client';

import { useEffect, useState } from 'react';
import { Card, Button, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getVIPStatus, checkVIPEligibility, acceptVIP } from '@/lib/api';

type VIPStatus = { id: string; tier: string; invitedAt: string; privileges: string[]; isMember?: boolean; exclusiveContent?: { id: string; type: string; title: string }[] };
type VIPEligibility = { eligible: boolean; xpRank: number; totalUsers: number; streak: number; avgForm: number; requirements?: { label: string; met: boolean; current: string; target: string }[] };

export default function VIPPage() {
  const [status, setStatus] = useState<VIPStatus | null>(null);
  const [eligibility, setEligibility] = useState<VIPEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => { document.title = 'FitAI — VIP Lounge'; }, []);
  useEffect(() => {
    Promise.all([getVIPStatus(), checkVIPEligibility()]).then(([s, e]) => { setStatus(s); setEligibility(e); }).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  async function handleAccept() {
    setAccepting(true);
    try { await acceptVIP(); setStatus((prev) => prev ? { ...prev, isMember: true } : prev); } catch { /* noop */ } finally { setAccepting(false); }
  }

  if (loading) return <><div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1.5s infinite' }} /></div></>;
  if (error) return <><div style={{ padding: 48 }}><p className="v3-body" style={{ color: 'var(--danger, #ef4444)' }}>Failed to load VIP status.</p></div></>;

  const isMember = status?.isMember;

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Exclusive access</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>Welcome to<br /><em className="v3-clay" style={{ fontWeight: 300 }}>the club.</em></h1>
        </section>

        {isMember ? (
          <>
            <Card padding={32} style={{ marginBottom: 24 }}>
              <Tag color="var(--clay)">{status?.tier || 'VIP'} Member</Tag>
              <h2 className="v3-display-3" style={{ marginTop: 12, color: 'var(--clay)' }}>Welcome to the club.</h2>
              <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 8 }}>You have access to exclusive content and privileges.</p>
            </Card>

            <SectionHeader title="Privileges" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 32 }}>
              {status?.privileges.map((p, i) => (
                <Card key={i} padding="12px 16px">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FitIcon name="check" size={14} color="var(--clay)" />
                    <span className="v3-body" style={{ color: 'var(--text-2)' }}>{p}</span>
                  </div>
                </Card>
              ))}
            </div>

            {status?.exclusiveContent && status.exclusiveContent.length > 0 && (
              <>
                <SectionHeader title="Exclusive content" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                  {status.exclusiveContent.map((c) => (
                    <Card key={c.id} padding={16}>
                      <Tag>{c.type}</Tag>
                      <div className="v3-body" style={{ fontWeight: 600, color: 'var(--clay)', marginTop: 8 }}>{c.title}</div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <Card padding={32} style={{ marginBottom: 24 }}>
              <h2 className="v3-display-3" style={{ color: eligibility?.eligible ? 'var(--clay)' : 'var(--text-1)' }}>
                {eligibility?.eligible ? 'You qualify!' : 'Requirements'}
              </h2>
              <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 8, marginBottom: 20 }}>
                {eligibility?.eligible ? 'You are eligible for VIP access. Accept your invitation.' : 'Meet all requirements to access VIP.'}
              </p>
              {eligibility?.requirements?.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--stroke-1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FitIcon name={r.met ? 'check' : 'target'} size={14} color={r.met ? 'var(--clay)' : 'var(--text-3)'} />
                    <span className="v3-body" style={{ color: 'var(--text-2)' }}>{r.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <span className="v3-numeric" style={{ fontWeight: 600, color: r.met ? 'var(--clay)' : 'var(--text-3)' }}>{r.current}</span>
                    <span className="v3-caption" style={{ color: 'var(--text-3)' }}> / {r.target}</span>
                  </div>
                </div>
              ))}
              {eligibility?.eligible && (
                <div style={{ marginTop: 20 }}>
                  <Button variant="accent" full onClick={handleAccept} disabled={accepting}>{accepting ? 'Accepting...' : 'Accept invitation'}</Button>
                </div>
              )}
            </Card>

            <SectionHeader title="What you get" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Exclusive workouts from top trainers', 'Priority AI coaching', 'VIP badge on profile', 'Access to special challenges', 'Early access to new features'].map((text, i) => (
                <Card key={i} padding="12px 16px">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FitIcon name="star" size={14} color="var(--clay)" />
                    <span className="v3-body" style={{ color: 'var(--text-2)' }}>{text}</span>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
