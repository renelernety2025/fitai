'use client';

import { useEffect, useState } from 'react';
import { Card, Button, SectionHeader, Tag, Chip } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getMyGear, addGearItem, deleteGearItem } from '@/lib/api';

type GearItem = { id: string; category: string; brand: string; model: string; sessionCount: number; maxSessions: number; purchaseDate: string | null; priceKc: number | null };

const CAT_ICON: Record<string, string> = { SHOES: 'shoe', BELT: 'shield', GLOVES: 'muscle', WRAPS: 'bolt', CLOTHING: 'star', EQUIPMENT: 'settings' };
const CATEGORIES = ['SHOES', 'BELT', 'GLOVES', 'WRAPS', 'CLOTHING', 'EQUIPMENT'];

function wearPct(item: GearItem): number { return item.maxSessions > 0 ? Math.min((item.sessionCount / item.maxSessions) * 100, 100) : 0; }
function wearColor(pct: number): string { return pct >= 80 ? 'var(--danger, #ef4444)' : pct >= 50 ? '#FF9F0A' : 'var(--sage, #34d399)'; }

export default function GearPage() {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'SHOES', brand: '', model: '', maxSessions: 300 });

  useEffect(() => { document.title = 'FitAI — Gear'; }, []);

  function load() { setLoading(true); getMyGear().then((g) => setItems(g as GearItem[])).catch(() => {}).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  function handleAdd() {
    if (!form.brand.trim() || !form.model.trim()) return;
    addGearItem({ category: form.category, brand: form.brand, model: form.model, maxSessions: form.maxSessions })
      .then(() => { setShowAdd(false); load(); }).catch(() => {});
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Equipment</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Your<br /><em className="v3-clay" style={{ fontWeight: 300 }}>gear.</em>
          </h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 12 }}>Track wear on your equipment. Replace on time = fewer injuries.</p>
        </section>

        <div style={{ marginBottom: 24 }}>
          <Button variant="accent" size="sm" onClick={() => setShowAdd(true)} icon={<FitIcon name="plus" size={14} />}>Add Gear</Button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center' }}>
            <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <Card padding={48} style={{ textAlign: 'center' as const }}>
            <FitIcon name="shoe" size={32} color="var(--text-3)" />
            <p className="v3-body" style={{ color: 'var(--text-3)', marginTop: 12 }}>No gear yet. Add your first shoes or gloves!</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {items.map((item) => {
              const pct = wearPct(item);
              const color = wearColor(pct);
              return (
                <Card key={item.id} padding={20} style={{ position: 'relative' }}>
                  <button onClick={() => { if (confirm('Delete this gear item?')) deleteGearItem(item.id).then(load); }} style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }} title="Delete">
                    <FitIcon name="x" size={14} color="var(--text-3)" />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <FitIcon name={CAT_ICON[item.category] || 'settings'} size={20} color="var(--accent)" />
                    <div>
                      <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.brand} {item.model}</div>
                      <Tag>{item.category}</Tag>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-3)' }}>{item.sessionCount} sessions</span>
                    <span className="v3-numeric" style={{ color, fontWeight: 600 }}>{Math.round(pct)}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
                  </div>
                  <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 6 }}>Max {item.maxSessions} sessions</div>
                </Card>
              );
            })}
          </div>
        )}

        {showAdd && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', padding: 16 }}>
            <Card padding={32} style={{ width: '100%', maxWidth: 420 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span className="v3-display-3">Add Gear</span>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FitIcon name="x" size={20} color="var(--text-3)" /></button>
              </div>
              <div className="v3-eyebrow" style={{ marginBottom: 8 }}>CATEGORY</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 16 }}>
                {CATEGORIES.map((c) => (
                  <Chip key={c} active={form.category === c} onClick={() => setForm({ ...form, category: c })} icon={<FitIcon name={CAT_ICON[c] || 'settings'} size={12} />}>{c}</Chip>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand" style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 14 }} />
                <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 14 }} />
              </div>
              <div className="v3-eyebrow" style={{ marginBottom: 6 }}>MAX SESSIONS</div>
              <input type="number" value={form.maxSessions} onChange={(e) => setForm({ ...form, maxSessions: Number(e.target.value) })} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 14, marginBottom: 16 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" full onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button variant="accent" full onClick={handleAdd}>Add</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
