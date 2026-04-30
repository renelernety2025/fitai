'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Chip, SectionHeader, PostCard } from '@/components/v3';
import { getTrendingHashtags, getPostsByHashtag, getTrendingFeed } from '@/lib/api';
import type { TrendingHashtag } from '@/lib/api/hashtags';
import type { PostData } from '@/lib/api/posts';

function FeedSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--stroke-1)',
            borderRadius: 'var(--r-lg)',
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-3)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 96, height: 12, borderRadius: 6, background: 'var(--bg-3)' }} />
              <div style={{ width: 64, height: 10, borderRadius: 6, background: 'var(--bg-3)' }} />
            </div>
          </div>
          <div style={{ height: 192, borderRadius: 'var(--r-md)', background: 'var(--bg-3)', marginBottom: 12 }} />
          <div style={{ width: '75%', height: 12, borderRadius: 6, background: 'var(--bg-3)' }} />
        </div>
      ))}
    </div>
  );
}

export default function TrendingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8">
        <FeedSkeleton />
      </div>
    }>
      <TrendingContent />
    </Suspense>
  );
}

function TrendingContent() {
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get('tag');

  const [period, setPeriod] = useState<'24h' | '7d'>('24h');
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Trending | FitAI';
  }, []);

  useEffect(() => {
    setLoading(true);
    if (tagFilter) {
      getPostsByHashtag(tagFilter)
        .then((data: any) => setPosts(data?.posts || []))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        getTrendingHashtags(period),
        getTrendingFeed(),
      ])
        .then(([tags, trendingData]: [TrendingHashtag[], any]) => {
          setHashtags(tags || []);
          setPosts(trendingData?.posts || trendingData || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [period, tagFilter]);

  if (tagFilter) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/trending" style={{ color: 'var(--text-3)', fontSize: 20, lineHeight: 1 }}>
            &larr;
          </Link>
          <SectionHeader title={`#${tagFilter}`} eyebrow={`${posts.length} postů`} />
        </div>

        {loading && <FeedSkeleton />}
        {!loading && posts.length === 0 && (
          <Card style={{ padding: 32, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-2)' }}>Žádné posty s tímto hashtagem.</p>
          </Card>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <SectionHeader title="Trending" eyebrow="Co hýbe komunitou" />

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <Chip active={period === '24h'} onClick={() => setPeriod('24h')}>24 hodin</Chip>
        <Chip active={period === '7d'} onClick={() => setPeriod('7d')}>7 dní</Chip>
      </div>

      {/* Top 3 hero */}
      {hashtags.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {hashtags.slice(0, 3).map((tag, i) => (
            <Link key={tag.name} href={`/trending?tag=${encodeURIComponent(tag.name)}`} style={{ textDecoration: 'none' }}>
              <Card style={{ padding: 16, textAlign: 'center', cursor: 'pointer', transition: 'border-color .15s' }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>#{i + 1}</span>
                <p style={{ fontWeight: 600, color: 'var(--text-1)', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>
                  #{tag.name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{tag.postCount} postů</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Remaining hashtags */}
      {hashtags.length > 3 && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Všechny trending
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {hashtags.slice(3).map((tag) => (
              <Link key={tag.name} href={`/trending?tag=${encodeURIComponent(tag.name)}`} style={{ textDecoration: 'none' }}>
                <Chip>
                  #{tag.name}
                  <span style={{ color: 'var(--text-3)', marginLeft: 4 }}>{tag.postCount}</span>
                </Chip>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hot posts */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 16 }}>
        Hot Posts
      </p>
      {loading && <FeedSkeleton />}
      {!loading && posts.length === 0 && (
        <Card style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-2)' }}>Zatím žádné trending posty.</p>
        </Card>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
