'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, Chip, Tag, Button, SectionHeader, Avatar } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getTrainerDetail } from '@/lib/api';

const IMG = {
  hero: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=2400&q=85&auto=format&fit=crop',
  track: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80&auto=format&fit=crop',
  run: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=900&q=80&auto=format&fit=crop',
};

const MOCK_PROGRAMS = [
  { title: 'The Half-Marathon Build', wks: 12, students: 1240, price: '89', cover: IMG.track },
  { title: 'Couch to 5K, Gentle', wks: 8, students: 3420, price: '39', cover: IMG.run },
  { title: 'Marathon Block', wks: 16, students: 580, price: '129', cover: IMG.track },
];

const STATS: [string, string][] = [
  ['Students', '12,420'],
  ['Programs', '8'],
  ['Avg. rating', '4.92'],
  ['Years coaching', '14'],
];

const SPECIALTIES = [
  'Marathon', 'Half-marathon', '5K/10K',
  'Run injury prevention', 'Strength for runners', 'Triathlon',
];

export default function TrainerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [trainer, setTrainer] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'FitAI — Trainer'; }, []);

  useEffect(() => {
    if (!id) return;
    getTrainerDetail(id)
      .then((data) => {
        setTrainer(data);
        const d = data as { name?: string };
        if (d?.name) document.title = `FitAI — ${d.name}`;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const t = trainer as { name?: string; avatarUrl?: string; bio?: string } | null;
  const name = t?.name || 'Alex Rivera';

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        height: 480, position: 'relative',
        backgroundImage: `url(${t?.avatarUrl || IMG.hero})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(11,9,7,0.2) 0%, rgba(11,9,7,0.4) 60%, var(--bg-0) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 64, left: 48, right: 48,
          display: 'flex', alignItems: 'flex-end', gap: 32,
        }}>
          <Avatar
            src={t?.avatarUrl || IMG.hero}
            size={120}
            ring="var(--bg-0)"
          />
          <div style={{ flex: 1 }}>
            <span style={{ marginBottom: 16, display: 'inline-block' }}>
              <Tag>Faculty &middot; Running</Tag>
            </span>
            <h1 className="v3-display-1" style={{ margin: 0, fontSize: 72, lineHeight: 1 }}>
              {name}
            </h1>
            <div className="v3-body" style={{ marginTop: 12, color: 'var(--text-2)' }}>
              {t?.bio || 'Marathon coach, former Olympic team physiotherapist'}
            </div>
          </div>
          <Button variant="accent" size="lg">Follow</Button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '64px 48px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64 }}>
        <div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
            {STATS.map(([label, value]) => (
              <Card key={label} padding={20}>
                <div className="v3-eyebrow" style={{ marginBottom: 8 }}>{label}</div>
                <div className="v3-numeric" style={{ fontSize: 32, color: 'var(--text-1)' }}>{value}</div>
              </Card>
            ))}
          </div>

          {/* Philosophy */}
          <SectionHeader eyebrow="ABOUT" title="Coaching philosophy" />
          <Card padding={32} style={{ marginBottom: 48 }}>
            <p className="v3-body" style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: 'var(--text-2)' }}>
              I believe distance running is a practice in patience. The best programs
              do less than you think and let your body adapt. After fourteen years of
              coaching everyone from first-timers to Olympic-team marathoners, I have
              come back to the same truths: easy days should be easy, hard days should
              be honest, and recovery is where the work pays off.
            </p>
            <div className="v3-eyebrow-serif" style={{ marginTop: 24 }}>
              — {name}, Boulder, March 2026
            </div>
          </Card>

          {/* Programs */}
          <SectionHeader eyebrow="PROGRAMS" title={`What ${name.split(' ')[0]} teaches`} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {MOCK_PROGRAMS.map((p) => (
              <Card key={p.title} padding={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{
                  height: 160,
                  backgroundImage: `url(${p.cover})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }} />
                <div style={{ padding: 20 }}>
                  <div className="v3-title" style={{ marginBottom: 4, fontSize: 15 }}>{p.title}</div>
                  <div className="v3-caption" style={{ marginBottom: 12 }}>
                    {p.wks} weeks &middot; {p.students.toLocaleString()} students
                  </div>
                  <span className="v3-numeric" style={{ color: 'var(--accent)', fontSize: 18 }}>
                    ${p.price}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card padding={28} style={{ marginBottom: 16 }}>
            <div className="v3-title" style={{ marginBottom: 16 }}>Get coaching</div>
            <Button variant="accent" full size="lg" style={{ marginBottom: 8 }}>
              Browse programs
            </Button>
            <Button variant="ghost" full>Book 1:1 session</Button>
            <div className="v3-caption" style={{ marginTop: 16 }}>
              1:1 sessions $120 &middot; 60 min &middot; video call
            </div>
          </Card>
          <Card padding={24}>
            <div className="v3-title" style={{ marginBottom: 12 }}>Specialties</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SPECIALTIES.map((s) => <Chip key={s}>{s}</Chip>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
