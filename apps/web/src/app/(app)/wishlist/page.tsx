'use client';

import { useEffect, useState, useMemo } from 'react';

import { Card, Button, Chip, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getWishlist, removeFromWishlist } from '@/lib/api';

type WishlistItem = { id: string; itemType: string; itemId: string; addedAt: string; itemName?: string; savedCount?: number };

const TABS = ['All', 'Exercises', 'Plans', 'Recipes', 'Experiences', 'Clips'];
const TYPE_COLOR: Record<string, string> = { exercise: 'var(--accent)', plan: 'var(--sage)', recipe: 'var(--warning)', experience: 'var(--clay-deep)', clip: 'var(--clay)' };

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState('All');
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Wishlist'; }, []);
  useEffect(() => { getWishlist().then(setItems).catch(() => setError(true)).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    if (tab === 'All') return items;
    const key = tab.toLowerCase().replace(/s$/, '');
    return items.filter((i) => i.itemType.toLowerCase() === key);
  }, [items, tab]);

  async function handleRemove(id: string) {
    setRemoving(id);
    try { await removeFromWishlist(id); setItems((prev) => prev.filter((i) => i.id !== id)); } catch { /* noop */ } finally { setRemoving(null); }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Saved</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>Your<br /><em className="v3-clay" style={{ fontWeight: 300 }}>wishlist.</em></h1>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 24 }}>
          {TABS.map((t) => <Chip key={t} active={tab === t} onClick={() => setTab(t)}>{t}</Chip>)}
        </div>

        {error && <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 16 }}>Failed to load wishlist.</p>}

        {loading ? (
          <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center' }}><span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span></div>
        ) : filtered.length === 0 ? (
          <Card padding={48} style={{ textAlign: 'center' as const }}>
            <FitIcon name="heart" size={28} color="var(--text-3)" />
            <p className="v3-body" style={{ color: 'var(--text-3)', marginTop: 12 }}>
              {tab === 'All' ? 'Wishlist is empty. Add something.' : `No ${tab.toLowerCase()} in wishlist.`}
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map((item) => (
              <Card key={item.id} padding="12px 16px">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Tag color={TYPE_COLOR[item.itemType.toLowerCase()]}>{item.itemType}</Tag>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="v3-body" style={{ fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.itemName}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                      <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{new Date(item.addedAt).toLocaleDateString('cs-CZ')}</span>
                      <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{item.savedCount} saves</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)} disabled={removing === item.id}>
                    {removing === item.id ? '...' : 'Remove'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
