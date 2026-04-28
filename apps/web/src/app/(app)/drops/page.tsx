'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getDrops, purchaseDrop, getMyDropPurchases } from '@/lib/api';

type Drop = { id: string; name: string; description: string; releaseDate: string; priceXP: number; totalEditions: number; remaining: number; imageUrl: string | null; category: string };
type Purchase = { id: string; dropId: string; dropName: string; editionNumber: number; purchasedAt: string };

function useCountdown(target: string): string {
  const [text, setText] = useState('');
  const compute = useCallback(() => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return 'LIVE';
    const d = Math.floor(diff / 86400000); const h = Math.floor((diff % 86400000) / 3600000); const m = Math.floor((diff % 3600000) / 60000);
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
  }, [target]);
  useEffect(() => { setText(compute()); const id = setInterval(() => setText(compute()), 1000); return () => clearInterval(id); }, [compute]);
  return text;
}

function CountdownTag({ releaseDate }: { releaseDate: string }) {
  const text = useCountdown(releaseDate);
  return <Tag color="var(--clay)">{text}</Tag>;
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Drops'; }, []);
  useEffect(() => {
    Promise.all([getDrops(), getMyDropPurchases()]).then(([d, p]) => { setDrops(d as Drop[]); setPurchases(p as Purchase[]); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function handlePurchase(id: string) {
    setPurchasing(id);
    purchaseDrop(id).then(() => Promise.all([getDrops(), getMyDropPurchases()]).then(([d, p]) => { setDrops(d as Drop[]); setPurchases(p as Purchase[]); })).catch(() => {}).finally(() => setPurchasing(null));
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Limited edition</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>Limited.<br /><em className="v3-clay" style={{ fontWeight: 300 }}>Exclusive.</em></h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 12 }}>Exclusive limited editions. Once gone, never coming back.</p>
        </section>

        {loading ? (
          <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center' }}><span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span></div>
        ) : (
          <>
            {drops.length === 0 && <Card padding={48} style={{ textAlign: 'center' as const }}><p className="v3-body" style={{ color: 'var(--text-3)' }}>No drops available.</p></Card>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {drops.map((drop) => {
                const soldOut = drop.remaining <= 0;
                const pct = ((drop.totalEditions - drop.remaining) / Math.max(drop.totalEditions, 1)) * 100;
                return (
                  <Card key={drop.id} padding={0} style={{ overflow: 'hidden', opacity: soldOut ? 0.5 : 1, filter: soldOut ? 'grayscale(0.5)' : 'none' }}>
                    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)' }}>
                      {soldOut ? <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.3em', color: 'var(--text-3)' }}>SOLD OUT</span> : <CountdownTag releaseDate={drop.releaseDate} />}
                    </div>
                    <div style={{ padding: 20 }}>
                      <div className="v3-body" style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 18 }}>{drop.name}</div>
                      <p className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>{drop.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                        <div>
                          <span className="v3-numeric" style={{ fontSize: 20, fontWeight: 700, color: 'var(--clay)' }}>{drop.priceXP.toLocaleString()} XP</span>
                          <div className="v3-caption" style={{ color: 'var(--text-3)' }}>{drop.remaining}/{drop.totalEditions} left</div>
                        </div>
                        <div style={{ width: 80, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--clay)', borderRadius: 2 }} />
                        </div>
                      </div>
                      {!soldOut && (
                        <div style={{ marginTop: 16 }}>
                          <Button variant="accent" full onClick={() => handlePurchase(drop.id)} disabled={purchasing === drop.id}>
                            {purchasing === drop.id ? 'Processing...' : 'Secure My Edition'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {purchases.length > 0 && (
              <section style={{ marginTop: 40 }}>
                <SectionHeader title="My purchases" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {purchases.map((p) => (
                    <Card key={p.id} padding="12px 16px">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{p.dropName}</span>
                          <div className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 2 }}>Edition #{p.editionNumber} / {new Date(p.purchasedAt).toLocaleDateString('cs-CZ')}</div>
                        </div>
                        <Tag color="var(--clay)">Owned</Tag>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
