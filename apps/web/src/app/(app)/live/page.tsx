'use client';

import { useEffect } from 'react';
import { Card, Tag, Button, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';

const LIVE_NOW = [
  {
    title: '7:00 morning flow',
    coach: 'Kai Larsen',
    img: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1200&q=80&auto=format&fit=crop',
    attendees: 247,
    starts: 'in 12 min',
  },
  {
    title: 'Sunrise run, easy zone',
    coach: 'Ari Ramos',
    img: 'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1200&q=80&auto=format&fit=crop',
    attendees: 184,
    starts: 'in 28 min',
  },
];

const UPCOMING = [
  { title: 'Strength: pull day', coach: 'Maya Chen', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80&auto=format&fit=crop', when: 'Today 18:00', mins: 50 },
  { title: 'Mobility for desks', coach: 'Romy K.', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80&auto=format&fit=crop', when: 'Today 19:30', mins: 25 },
  { title: 'Long run guided', coach: 'Julien P.', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80&auto=format&fit=crop', when: 'Tomorrow 7:00', mins: 75 },
  { title: 'Evening yin yoga', coach: 'Kai Larsen', img: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80&auto=format&fit=crop', when: 'Tomorrow 21:00', mins: 60 },
  { title: 'HIIT 20', coach: 'Alex Rivera', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&auto=format&fit=crop', when: 'Wed 12:00', mins: 20 },
  { title: 'Pilates core', coach: 'Lena Marek', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80&auto=format&fit=crop', when: 'Wed 18:30', mins: 40 },
];

function PulseDot() {
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
      background: '#fff', animation: 'v3-pulse 1.5s infinite',
    }} />
  );
}

export default function LivePage() {
  useEffect(() => { document.title = 'FitAI — Live Classes'; }, []);

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 48px' }}>
      <style>{`@keyframes v3-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }`}</style>

      {/* Coming soon banner */}
      <Card padding={20} style={{ marginBottom: 32, border: '1px solid rgba(232,93,44,0.2)', background: 'rgba(232,93,44,0.05)', textAlign: 'center' }}>
        <span className="v3-eyebrow" style={{ color: 'var(--accent)' }}>COMING SOON</span>
        <p className="v3-body" style={{ color: 'var(--text-2)', marginTop: 4 }}>
          Live classes are in development. Below is a preview of what&apos;s coming.
        </p>
      </Card>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Live</div>
        <h1 className="v3-display-2" style={{ margin: 0, maxWidth: 720 }}>
          Move with thousands.{' '}
          <span style={{ color: 'var(--clay)', fontWeight: 300, fontStyle: 'italic' }}>
            Right now.
          </span>
        </h1>
      </div>

      {/* Live now */}
      <SectionHeader eyebrow="LIVE NOW" title="Join in progress" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 64 }}>
        {LIVE_NOW.map((l) => (
          <Card key={l.title} padding={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{
              height: 260, position: 'relative',
              backgroundImage: `url(${l.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(11,9,7,0.95) 100%)',
              }} />
              {/* Live badge */}
              <div style={{
                position: 'absolute', top: 16, left: 16,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 20,
                background: 'rgba(232,93,44,0.9)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: '#fff',
              }}>
                <PulseDot /> LIVE
              </div>
              {/* Bottom info */}
              <div style={{
                position: 'absolute', bottom: 20, left: 20, right: 20,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              }}>
                <div>
                  <div className="v3-display-3" style={{ marginBottom: 4, color: '#fff' }}>
                    {l.title}
                  </div>
                  <div className="v3-caption" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    with {l.coach} &middot; {l.attendees} training now
                  </div>
                </div>
                <Button variant="accent" icon={<FitIcon name="bolt" size={16} color="#fff" />} disabled>
                  Coming soon
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Upcoming */}
      <SectionHeader eyebrow="UPCOMING" title="On the schedule" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {UPCOMING.map((u) => (
          <Card key={u.title + u.when} padding={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }}>
            <div style={{
              height: 160,
              backgroundImage: `url(${u.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
            }} />
            <div style={{ padding: 20 }}>
              <div className="v3-caption" style={{ marginBottom: 6, color: 'var(--accent-hot)' }}>
                {u.when} &middot; {u.mins} min
              </div>
              <div className="v3-title" style={{ marginBottom: 4, fontSize: 15 }}>{u.title}</div>
              <div className="v3-caption">with {u.coach}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
