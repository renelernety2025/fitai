'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, Button, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getMyStack, logSupplement, getSupplementCatalog, addToStack } from '@/lib/api';

type Supplement = { id: string; name: string; dosage: string; timing: string; takenToday: boolean; monthlyCost?: number };
type CatalogItem = { id: string; name: string; defaultDosage: string; description?: string };

const TIMING_COLOR: Record<string, string> = { MORNING: '#FF9F0A', PRE_WORKOUT: 'var(--accent)', POST_WORKOUT: 'var(--sage, #34d399)', EVENING: '#BF5AF2' };
const TIMING_LABEL: Record<string, string> = { MORNING: 'Morning', PRE_WORKOUT: 'Pre-workout', POST_WORKOUT: 'Post-workout', EVENING: 'Evening' };

export default function SupplementsPage() {
  const [stack, setStack] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => { document.title = 'FitAI — Supplements'; }, []);

  const refresh = useCallback(() => {
    getMyStack().then(setStack).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function openModal() {
    setShowModal(true);
    if (catalog.length === 0) {
      setCatalogLoading(true);
      getSupplementCatalog().then(setCatalog).catch(console.error).finally(() => setCatalogLoading(false));
    }
  }

  function handleAdd() {
    if (!selectedId) return;
    addToStack({ supplementId: selectedId, dosage: '', timing: '' })
      .then(() => { setShowModal(false); setSelectedId(''); refresh(); })
      .catch(console.error);
  }

  const taken = stack.filter((s) => s.takenToday).length;

  if (loading) {
    return <><div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1.5s infinite' }} /></div></>;
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; My stack</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Your daily<br /><em className="v3-clay" style={{ fontWeight: 300 }}>stack.</em>
          </h1>
        </section>

        {stack.length === 0 && !showModal && (
          <Card padding={48} style={{ textAlign: 'center' as const }}>
            <p className="v3-body" style={{ color: 'var(--text-2)' }}>Your stack is empty.</p>
            <div style={{ marginTop: 16 }}><Button variant="accent" onClick={openModal}>Add supplement</Button></div>
          </Card>
        )}

        {stack.length > 0 && (
          <>
            <Card padding={20} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="v3-eyebrow">TODAY</div>
                  <span className="v3-numeric" style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)' }}>{taken}<span style={{ color: 'var(--text-3)' }}>/{stack.length}</span></span>
                </div>
                <Button variant="ghost" size="sm" onClick={openModal}>+ Add</Button>
              </div>
              <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: stack.length > 0 ? `${(taken / stack.length) * 100}%` : '0%', background: 'var(--sage, #34d399)', borderRadius: 2 }} />
              </div>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {stack.map((s) => (
                <Card key={s.id} padding={20} style={{ opacity: s.takenToday ? 1 : 0.8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Tag color={TIMING_COLOR[s.timing]}>{TIMING_LABEL[s.timing] || s.timing}</Tag>
                    <button onClick={() => logSupplement(s.id).then(refresh)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${s.takenToday ? 'var(--sage, #34d399)' : 'var(--stroke-1)'}`, background: s.takenToday ? 'color-mix(in srgb, var(--sage, #34d399) 15%, transparent)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.takenToday && <FitIcon name="check" size={14} color="var(--sage, #34d399)" />}
                    </button>
                  </div>
                  <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{s.name}</div>
                  <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 2 }}>{s.dosage}</div>
                  {s.monthlyCost != null && (
                    <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 8 }}>{s.monthlyCost} Kc/month</div>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}

        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}>
            <Card padding={32} style={{ width: '100%', maxWidth: 420 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span className="v3-display-3">Add supplement</span>
                <button onClick={() => { setShowModal(false); setSelectedId(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FitIcon name="x" size={20} color="var(--text-3)" /></button>
              </div>
              {catalogLoading ? <p className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</p> : (
                <>
                  <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 14, marginBottom: 16 }}>
                    <option value="">Select...</option>
                    {catalog.map((c) => <option key={c.id} value={c.id}>{c.name} -- {c.defaultDosage}</option>)}
                  </select>
                  <Button variant="accent" full onClick={handleAdd} disabled={!selectedId}>Add to stack</Button>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
