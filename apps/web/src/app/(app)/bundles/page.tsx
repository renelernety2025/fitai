'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Button, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getBundles, purchaseBundle } from '@/lib/api';

type Bundle = { id: string; name: string; description?: string; items: any[]; priceXP: number; giftable: boolean; creator?: { name: string }; purchased?: boolean; creatorName?: string };

const TYPE_ICON: Record<string, string> = { workout_plan: 'dumbbell', meal_plan: 'apple', supplement: 'pill', challenge: 'bolt', recovery: 'heart' };

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { document.title = 'FitAI — Bundles'; }, []);
  useEffect(() => { getBundles().then(setBundles).catch(() => setError(true)).finally(() => setLoading(false)); }, []);

  async function handlePurchase(id: string) {
    try { await purchaseBundle(id); setBundles((prev) => prev.map((b) => b.id === id ? { ...b, purchased: true } : b)); } catch { /* noop */ }
  }

  const available = useMemo(() => bundles.filter((b) => !b.purchased), [bundles]);
  const myBundles = useMemo(() => bundles.filter((b) => b.purchased), [bundles]);

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Packages</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>Curated<br /><em className="v3-clay" style={{ fontWeight: 300 }}>for you.</em></h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 12 }}>Exercise, meal, and challenge bundles from the community. Pay with XP.</p>
        </section>

        {error && <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 16 }}>Failed to load bundles.</p>}

        {loading ? (
          <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center' }}><span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span></div>
        ) : bundles.length === 0 ? (
          <Card padding={48} style={{ textAlign: 'center' as const }}><p className="v3-body" style={{ color: 'var(--text-3)' }}>No bundles yet.</p></Card>
        ) : (
          <>
            {available.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 32 }}>
                {available.map((b) => (
                  <Card key={b.id} padding={20}>
                    <div className="v3-body" style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 16 }}>{b.name}</div>
                    {b.description && <p className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>{b.description}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginTop: 12 }}>
                      {b.items.slice(0, 5).map((item, i) => (
                        <Tag key={i}><FitIcon name={TYPE_ICON[item.type] || 'settings'} size={10} /> {item.name}</Tag>
                      ))}
                      {b.items.length > 5 && <Tag>+{b.items.length - 5}</Tag>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <span className="v3-caption" style={{ color: 'var(--text-3)' }}>by {b.creatorName || b.creator?.name || 'Unknown'}</span>
                      {b.giftable && <Tag color="#BF5AF2">Giftable</Tag>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <span className="v3-numeric" style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{b.priceXP} XP</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="accent" size="sm" onClick={() => handlePurchase(b.id)}>Buy</Button>
                        {b.giftable && <Button variant="ghost" size="sm">Gift</Button>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {myBundles.length > 0 && (
              <>
                <SectionHeader title="My bundles" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {myBundles.map((b) => (
                    <Card key={b.id} padding={20}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{b.name}</div>
                        <Tag color="var(--sage, #34d399)">Owned</Tag>
                      </div>
                      {b.description && <p className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>{b.description}</p>}
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
