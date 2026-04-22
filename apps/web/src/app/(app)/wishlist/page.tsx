'use client';

/**
 * Wishlist — saved items with type filters and social proof.
 */

import { useEffect, useState, useMemo } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { GlassCard } from '@/components/v2/GlassCard';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getWishlist, removeFromWishlist } from '@/lib/api';

type WishlistItem = { id: string; itemType: string; itemId: string; addedAt: string; itemName?: string; savedCount?: number };

const TABS = ['All', 'Exercises', 'Plans', 'Recipes', 'Experiences', 'Clips'];

const TYPE_COLORS: Record<string, string> = {
  exercise: '#FF375F',
  plan: '#A8FF00',
  recipe: '#FF9F0A',
  experience: '#BF5AF2',
  clip: '#00E5FF',
};

function typeBadgeColor(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] || '#6E6E73';
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState('All');
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'FitAI — Wishlist';
  }, []);

  useEffect(() => {
    getWishlist()
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'All') return items;
    const typeKey = tab.toLowerCase().replace(/s$/, '');
    return items.filter(
      (i) => i.itemType.toLowerCase() === typeKey,
    );
  }, [items, tab]);

  async function handleRemove(id: string) {
    setRemoving(id);
    try {
      await removeFromWishlist(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      /* noop */
    } finally {
      setRemoving(null);
    }
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Chci Zkusit</V2SectionLabel>
        <V2Display size="xl">Wishlist.</V2Display>
      </section>

      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all ${
              tab === t
                ? 'bg-[#FF375F] text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-8 text-sm text-[#FF375F]">
          Nepodarilo se nacist wishlist.
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mb-3 text-4xl text-white/15">
            &#9825;
          </div>
          <p className="text-sm text-white/30">
            {tab === 'All'
              ? 'Wishlist je prazdny. Pridej neco.'
              : `Zadne ${tab.toLowerCase()} v wishlistu.`}
          </p>
        </div>
      ) : (
        <StaggerContainer>
          <div className="space-y-3">
            {filtered.map((item) => (
              <StaggerItem key={item.id}>
                <GlassCard className="p-4" hover={false}>
                  <div className="flex items-center gap-4">
                    {/* Type badge */}
                    <span
                      className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase"
                      style={{
                        color: typeBadgeColor(item.itemType),
                        background: `${typeBadgeColor(item.itemType)}15`,
                        border: `1px solid ${typeBadgeColor(item.itemType)}30`,
                      }}
                    >
                      {item.itemType}
                    </span>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {item.itemName}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-3 text-[10px] text-white/30">
                        <span>
                          {new Date(item.addedAt).toLocaleDateString('cs-CZ')}
                        </span>
                        <span>
                          {item.savedCount} lidi si ulozilo
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={removing === item.id}
                      className="flex-shrink-0 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] text-white/40 hover:bg-[#FF375F]/20 hover:text-[#FF375F] transition-all disabled:opacity-40"
                    >
                      {removing === item.id ? '...' : 'Odebrat'}
                    </button>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      )}
    </V2Layout>
  );
}
