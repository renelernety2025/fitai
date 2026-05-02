'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, Chip, Tag, Button, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getMarketplace } from '@/lib/api';

const IMG = {
  track: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80&auto=format&fit=crop',
  lift: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=80&auto=format&fit=crop',
  mobility: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=900&q=80&auto=format&fit=crop',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&auto=format&fit=crop',
  yoga: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=900&q=80&auto=format&fit=crop',
  run: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=900&q=80&auto=format&fit=crop',
  deadlift: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=900&q=80&auto=format&fit=crop',
  stretch: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80&auto=format&fit=crop',
};

const FEATURED = [
  { title: 'The Half-Marathon Build', coach: 'Alex Rivera', dur: '12 weeks', price: '89', cover: IMG.track, tag: 'Bestseller' },
  { title: 'Strong Mornings, 8 weeks', coach: 'Maya Chen', dur: '8 weeks', price: '69', cover: IMG.lift, tag: 'New' },
  { title: 'Mobility for Lifters', coach: 'Kai Larsen', dur: '4 weeks', price: '39', cover: IMG.mobility, tag: null },
];

const PROGRAMS = [
  { title: 'Couch to 5K, gentle', coach: 'Ari Ramos', wks: 8, price: '39', cover: IMG.run },
  { title: 'Postpartum Strength', coach: 'Lena Marek', wks: 10, price: '59', cover: IMG.mobility },
  { title: 'Hypertrophy 101', coach: 'Maya Chen', wks: 12, price: '89', cover: IMG.gym },
  { title: 'Marathon Block', coach: 'Julien P.', wks: 16, price: '129', cover: IMG.track },
  { title: 'Yoga for Runners', coach: 'Kai Larsen', wks: 6, price: '49', cover: IMG.yoga },
  { title: 'Daily Walk Plan', coach: 'Romy K.', wks: 12, price: 'Free', cover: IMG.stretch },
  { title: 'Heavy Pull, 6w', coach: 'Maya Chen', wks: 6, price: '59', cover: IMG.deadlift },
  { title: 'Deload & Reset', coach: 'Lena Marek', wks: 2, price: '19', cover: IMG.mobility },
];

const CATS = ['All', 'Running', 'Strength', 'Yoga', 'Mobility', 'Nutrition', 'Recovery'];

export default function MarketplacePage() {
  const [cat, setCat] = useState('All');
  const [apiListings, setApiListings] = useState<any[]>([]);

  useEffect(() => { document.title = 'FitAI — Marketplace'; }, []);

  useEffect(() => {
    const params = cat === 'All' ? undefined : `type=${encodeURIComponent(cat)}`;
    getMarketplace(params)
      .then((data) => setApiListings(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [cat]);

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 48px' }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Marketplace</div>
        <h1 className="v3-display-2" style={{ margin: 0, maxWidth: 800 }}>
          Programs designed by the<br />
          <span style={{ color: 'var(--clay)', fontWeight: 300, fontStyle: 'italic' }}>
            best in the world.
          </span>
        </h1>
      </div>

      {/* Featured */}
      <SectionHeader eyebrow="FEATURED" title="This week's picks" />
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 64,
      }}>
        {FEATURED.map((p, i) => (
          <Link key={p.title} href="/trainers" style={{ textDecoration: 'none' }}>
          <Card padding={0} hover style={{ overflow: 'hidden', minHeight: i === 0 ? 420 : 'auto' }}>
            <div style={{
              height: i === 0 ? 280 : 200, position: 'relative',
              backgroundImage: `url(${p.cover})`, backgroundSize: 'cover', backgroundPosition: 'center',
            }}>
              {p.tag && (
                <span style={{
                  position: 'absolute', top: 16, left: 16,
                }}>
                  <Tag color="var(--accent)">{p.tag}</Tag>
                </span>
              )}
            </div>
            <div style={{ padding: 24 }}>
              <div className="v3-caption" style={{ marginBottom: 6 }}>
                by {p.coach} &middot; {p.dur}
              </div>
              <div className={i === 0 ? 'v3-display-3' : 'v3-title'} style={{ marginBottom: 12 }}>
                {p.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="v3-numeric" style={{ fontSize: 24, color: 'var(--accent)' }}>
                  {p.price === 'Free' ? 'Free' : `$${p.price}`}
                </span>
                <Button variant="ghost" size="sm" iconRight={<FitIcon name="arrow" size={14} />}>
                  View
                </Button>
              </div>
            </div>
          </Card>
          </Link>
        ))}
      </div>

      {/* Browse */}
      <SectionHeader eyebrow="BROWSE" title="All programs" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATS.map((c) => (
          <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {/* Community listings from API */}
        {apiListings.map((item: any) => (
          <Link key={item.id} href="/trainers" style={{ textDecoration: 'none' }}>
            <Card padding={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ height: 180, background: 'linear-gradient(135deg, var(--bg-2), var(--bg-3))' }} />
              <div style={{ padding: 20 }}>
                <div className="v3-title" style={{ marginBottom: 4, fontSize: 15 }}>{item.title}</div>
                <div className="v3-caption" style={{ marginBottom: 12 }}>
                  {item.trainerName || 'Community'} &middot; {item.type}
                </div>
                <span className="v3-numeric" style={{ color: 'var(--accent)', fontSize: 18 }}>
                  {(item.priceXP || 0).toLocaleString()} XP
                </span>
              </div>
            </Card>
          </Link>
        ))}
        {/* Curated programs */}
        {PROGRAMS.map((p) => (
          <Card key={p.title} padding={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{
              height: 180,
              backgroundImage: `url(${p.cover})`, backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
            <div style={{ padding: 20 }}>
              <div className="v3-title" style={{ marginBottom: 4, fontSize: 15 }}>{p.title}</div>
              <div className="v3-caption" style={{ marginBottom: 12 }}>
                {p.coach} &middot; {p.wks} weeks
              </div>
              <span className="v3-numeric" style={{
                color: p.price === 'Free' ? 'var(--sage)' : 'var(--accent)', fontSize: 18,
              }}>
                {p.price === 'Free' ? 'Free' : `$${p.price}`}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
