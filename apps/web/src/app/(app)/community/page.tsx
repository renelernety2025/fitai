'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, Button, Chip, SectionHeader } from '@/components/v3';
import { PostComposer, PostCard } from '@/components/v3';
import {
  getForYouFeed,
  getFollowingFeed,
  getTrendingFeed,
  getPromoCards,
  dismissPromo,
} from '@/lib/api';
import type { PostData } from '@/lib/api/posts';

type FeedTab = 'for-you' | 'following' | 'trending';

const PROMO_POSITIONS = [5, 12, 20];
const PAGE_SIZE = 20;

interface PromoCard {
  id: string;
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaUrl: string;
}

export default function CommunityPage() {
  const [tab, setTab] = useState<FeedTab>('for-you');
  const [posts, setPosts] = useState<PostData[]>([]);
  const [promos, setPromos] = useState<PromoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    document.title = 'Komunita | FitAI';
    getPromoCards().then(setPromos).catch(() => {});
  }, []);

  const fetchFeed = useCallback(
    async (reset: boolean, currentCursor: string | undefined) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      const fetcher =
        tab === 'for-you'
          ? getForYouFeed
          : tab === 'following'
            ? getFollowingFeed
            : getTrendingFeed;

      try {
        const data: PostData[] = await fetcher(currentCursor);
        if (reset) {
          setPosts(data);
        } else {
          setPosts((prev) => [...prev, ...data]);
        }
        setHasMore(data.length >= PAGE_SIZE);
        if (data.length > 0) {
          setCursor(data[data.length - 1].id);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [tab],
  );

  // Reset feed on tab change
  useEffect(() => {
    setCursor(undefined);
    setHasMore(true);
    fetchFeed(true, undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchFeed(false, cursor);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, cursor, fetchFeed]);

  function handlePostCreated() {
    setCursor(undefined);
    fetchFeed(true, undefined);
  }

  function handleDismissPromo(id: string) {
    dismissPromo(id).catch(() => {});
    setPromos((prev) => prev.filter((p) => p.id !== id));
  }

  function renderFeed() {
    const items: React.ReactNode[] = [];
    let promoIndex = 0;

    posts.forEach((post, i) => {
      if (PROMO_POSITIONS.includes(i) && promoIndex < promos.length) {
        const promo = promos[promoIndex++];
        items.push(<PromoCardItem key={`promo-${promo.id}`} promo={promo} onDismiss={handleDismissPromo} />);
      }
      items.push(
        <PostCard key={post.id} post={post} onUpdate={() => fetchFeed(true, undefined)} />,
      );
    });

    return items;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SectionHeader eyebrow="Komunita" title="Feed" />

      <PostComposer onPostCreated={handlePostCreated} />

      <div className="flex gap-2 mb-6">
        <Chip active={tab === 'for-you'} onClick={() => setTab('for-you')}>
          Pro tebe
        </Chip>
        <Chip active={tab === 'following'} onClick={() => setTab('following')}>
          Sledovaní
        </Chip>
        <Chip active={tab === 'trending'} onClick={() => setTab('trending')}>
          Trending
        </Chip>
      </div>

      {renderFeed()}

      {loading && (
        <p className="text-center text-[var(--text-3)] py-8">Načítám...</p>
      )}

      {!loading && posts.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-[var(--text-2)]">
            Zatím žádné posty. Buď první!
          </p>
        </Card>
      )}

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}

function PromoCardItem({
  promo,
  onDismiss,
}: {
  promo: PromoCard;
  onDismiss: (id: string) => void;
}) {
  return (
    <Card className="mb-4 p-4 border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--bg-1)] to-[var(--bg-0)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-3)',
            }}
          >
            Promoted
          </span>
          <h4 className="text-[var(--text-1)] font-semibold mt-1 truncate">
            {promo.title}
          </h4>
          {promo.subtitle && (
            <p className="text-sm text-[var(--text-2)] mt-0.5 line-clamp-2">
              {promo.subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" onClick={() => { window.location.href = promo.ctaUrl; }}>
            {promo.ctaText}
          </Button>
          <button
            onClick={() => onDismiss(promo.id)}
            aria-label="Zavřít promo"
            style={{
              fontSize: 16,
              lineHeight: 1,
              color: 'var(--text-3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            ×
          </button>
        </div>
      </div>
    </Card>
  );
}
