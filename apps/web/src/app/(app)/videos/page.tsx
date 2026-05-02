'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Chip, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getVideos, type VideoData } from '@/lib/api';

const CATS = [
  { v: 'ALL', l: 'All' }, { v: 'YOGA', l: 'Yoga' }, { v: 'PILATES', l: 'Pilates' },
  { v: 'STRENGTH', l: 'Strength' }, { v: 'CARDIO', l: 'Cardio' }, { v: 'MOBILITY', l: 'Mobility' },
];

const catColor: Record<string, string> = {
  YOGA: 'var(--sage, #34d399)', PILATES: '#00E5FF', STRENGTH: '#FF9F0A', CARDIO: 'var(--accent)', MOBILITY: '#BF5AF2',
};

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [cat, setCat] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const f: Record<string, string> = {};
    if (cat !== 'ALL') f.category = cat;
    getVideos(f).then(setVideos).catch(() => setError(true)).finally(() => setLoading(false));
  }, [cat]);

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Library</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Watch and<br />
            <em className="v3-clay" style={{ fontWeight: 300 }}>follow.</em>
          </h1>
          <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 16 }}>
            Yoga, Pilates, strength, cardio, mobility. With real-time pose detection.
          </p>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 32 }}>
          {CATS.map((c) => <Chip key={c.v} active={cat === c.v} onClick={() => setCat(c.v)}>{c.l}</Chip>)}
        </div>

        {loading && (
          <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center' }}>
            <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading videos...</span>
          </div>
        )}
        {error && !loading && (
          <Card padding={32} style={{ textAlign: 'center' }}>
            <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 12 }}>Failed to load videos.</p>
            <button onClick={() => setCat(cat)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Try again</button>
          </Card>
        )}
        {!loading && !error && videos.length === 0 && (
          <Card padding={48} style={{ textAlign: 'center' }}>
            <p className="v3-body" style={{ color: 'var(--text-3)' }}>No videos in this category.</p>
          </Card>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {videos.map((v) => (
            <Link key={v.id} href={`/videos/${v.id}`} style={{ textDecoration: 'none' }}>
              <Card hover padding={0} style={{ overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <img src={v.thumbnailUrl} alt={v.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.5), transparent)' }} />
                  <span style={{ position: 'absolute', bottom: 10, right: 10 }}>
                    <Tag>{Math.floor(v.durationSeconds / 60)} min</Tag>
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <Tag color={catColor[v.category]}>{v.category}</Tag>
                    <Tag>{v.difficulty}</Tag>
                  </div>
                  <div className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{v.title}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
