'use client';

import React from 'react';
import { IMG, AVATARS, AvatarStack, LogoMark } from './shared';

// -- NAV --

export function Nav() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30,
      backdropFilter: 'blur(20px) saturate(140%)',
      WebkitBackdropFilter: 'blur(20px) saturate(140%)',
      background: 'rgba(11,9,7,0.72)',
      borderBottom: '1px solid var(--stroke-1)',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 40px',
      }}>
        <LogoMark size={20} />
        <div style={{ display: 'flex', gap: 36, fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
          <span>Train</span><span>Coaches</span><span>Programs</span>
          <span>Community</span><span>Pricing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/login" style={{ fontSize: 13, color: 'var(--text-2)' }}>Sign in</a>
          <a href="/register" className="lv3-btn-primary" style={{ padding: '10px 20px', fontSize: 12 }}>
            Start free
          </a>
        </div>
      </div>
    </div>
  );
}

// -- HERO --

export function Hero() {
  return (
    <div style={{ position: 'relative', minHeight: 820, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${IMG.heroLift})`,
        backgroundSize: 'cover', backgroundPosition: 'center 35%',
        filter: 'saturate(0.85) contrast(1.05) brightness(0.92)',
      }} />
      <div style={{ position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 70% 35%, rgba(232,93,44,0.10) 0%, transparent 55%), linear-gradient(180deg, rgba(11,9,7,0.35) 0%, rgba(11,9,7,0.55) 55%, var(--bg-0) 100%)',
      }} />
      <div style={{ position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(11,9,7,0.78) 0%, rgba(11,9,7,0.35) 45%, transparent 75%)',
      }} />
      <div style={{
        position: 'relative', zIndex: 2, minHeight: 820,
        maxWidth: 1440, margin: '0 auto', padding: '120px 40px 96px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{ maxWidth: 780 }}>
          <div className="lv3-eyebrow" style={{ marginBottom: 24, color: 'var(--accent-hot)' }}>
            &#9670; Spring 2026 — Now in 142 countries
          </div>
          <h1 className="lv3-display-1" style={{ margin: 0, marginBottom: 28 }}>
            Become your<br />
            <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>
              strongest self.
            </span>
          </h1>
          <p style={{
            fontSize: 19, color: 'var(--text-2)', maxWidth: 560,
            marginBottom: 40, lineHeight: 1.5, fontWeight: 400,
          }}>
            World-class coaching, an AI that adapts to your body, and a community
            that shows up — every day, wherever you train.
          </p>
          <HeroCTAs />
          <HeroSocialProof />
        </div>
      </div>
      <LiveCard />
    </div>
  );
}

function HeroCTAs() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <a href="/register" className="lv3-btn-primary" style={{ padding: '16px 28px', fontSize: 13 }}>
        Start free for 14 days <span style={{ fontSize: 14 }}>&#8594;</span>
      </a>
      <button className="lv3-btn-outline" style={{ padding: '15px 24px', fontSize: 13 }}>
        <span style={{ fontSize: 11 }}>&#9654;</span> Watch the film
        <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>1:42</span>
      </button>
    </div>
  );
}

function HeroSocialProof() {
  return (
    <div style={{ display: 'flex', gap: 32, marginTop: 64, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <AvatarStack avatars={AVATARS} size={32} />
        <div>
          <div className="lv3-numeric" style={{ fontSize: 18 }}>2.4M</div>
          <div className="lv3-meta">Members training</div>
        </div>
      </div>
      <div style={{ width: 1, height: 32, background: 'var(--stroke-2)' }} />
      <div>
        <div className="lv3-numeric" style={{ fontSize: 18 }}>4.9</div>
        <div className="lv3-meta">App Store &middot; 89K reviews</div>
      </div>
      <div style={{ width: 1, height: 32, background: 'var(--stroke-2)' }} />
      <div>
        <div className="lv3-numeric" style={{ fontSize: 18 }}>180</div>
        <div className="lv3-meta">Coaches in residence</div>
      </div>
    </div>
  );
}

function LiveCard() {
  const kms = [1, 1, 1, 0.6, 0];
  return (
    <div style={{
      position: 'absolute', right: 48, top: 168, zIndex: 3,
      width: 320, padding: 22, borderRadius: 'var(--r-lg)',
      background: 'rgba(20,17,13,0.78)',
      backdropFilter: 'blur(28px) saturate(140%)',
      WebkitBackdropFilter: 'blur(28px) saturate(140%)',
      border: '1px solid var(--stroke-2)', boxShadow: 'var(--shadow-pop)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span className="lv3-eyebrow" style={{ color: 'var(--sage)' }}>&#9679; Live &middot; 14:32</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Sara — morning run</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>3 of 5 km complete</div>
      <div style={{ fontFamily: 'var(--font-display-alt)', fontWeight: 500, fontSize: 18, marginBottom: 14 }}>
        Easy zone 2 &middot; 5 km
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 14 }}>
        <LiveCardStat label="Pace" value="5:42" unit="/km" note="&#8593; 8s faster" noteColor="var(--sage)" />
        <div style={{ width: 1, background: 'var(--stroke-1)' }} />
        <LiveCardStat label="Effort" value="Easy" note="just right" noteColor="var(--text-3)" />
      </div>
      <div style={{ borderTop: '1px solid var(--stroke-1)', paddingTop: 12, display: 'flex', gap: 6 }}>
        {kms.map((v, idx) => (
          <div key={idx} style={{ flex: 1 }}>
            <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, position: 'relative', overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%',
                width: `${v * 100}%`, background: 'var(--accent)',
                opacity: v >= 1 ? 0.9 : 0.5, borderRadius: 2,
              }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em' }}>KM {idx + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveCardStat({ label, value, unit, note, noteColor }: {
  label: string; value: string; unit?: string; note: string; noteColor: string;
}) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div className="lv3-numeric" style={{ fontSize: 22 }}>
        {value}{unit && <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 3 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 10, color: noteColor, marginTop: 2 }}>{note}</div>
    </div>
  );
}

// -- MARQUEE --

export function Marquee() {
  const items = ['Walking', 'Running', 'Yoga', 'Strength', 'Mobility', 'Pilates', 'HIIT', 'Cycling', 'Recovery', 'Breathwork', 'Stretching', 'Endurance'];
  const tripled = [...items, ...items, ...items];
  return (
    <div style={{
      borderTop: '1px solid var(--stroke-1)', borderBottom: '1px solid var(--stroke-1)',
      overflow: 'hidden', padding: '32px 0', background: 'var(--bg-1)',
    }}>
      <div className="lv3-marquee-track">
        {tripled.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 56 }}>
            <span>{t}</span>
            <span style={{ color: 'var(--accent)', fontSize: 8 }}>&#9670;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// -- COACHES --

const COACHES = [
  { name: 'Sara Lindqvist', discipline: 'Running \u00b7 Marathon', img: IMG.coachAri, tag: 'Featured' },
  { name: 'Maya Sato', discipline: 'Strength \u00b7 Hypertrophy', img: IMG.coachMaya, tag: 'New course' },
  { name: 'Kai Bergman', discipline: 'Yoga \u00b7 Mobility', img: IMG.coachKai, tag: null },
  { name: 'Diane Whittaker', discipline: 'Pilates \u00b7 Method', img: IMG.coachLena, tag: 'Live this week' },
  { name: 'Julien Marsh', discipline: 'Trail \u00b7 Endurance', img: IMG.coachJulien, tag: null },
  { name: 'Elena Rossi', discipline: 'Walking \u00b7 Outdoor', img: IMG.coachAlex, tag: null },
];

export function Coaches() {
  return (
    <div style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--stroke-1)', borderBottom: '1px solid var(--stroke-1)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
          <div style={{ maxWidth: 720 }}>
            <div className="lv3-eyebrow" style={{ marginBottom: 16, color: 'var(--accent-hot)' }}>The faculty</div>
            <h2 className="lv3-display-2" style={{ margin: 0 }}>
              Coaches who meet you<br />
              <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>where you are.</span>
            </h2>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-2)', borderBottom: '1px solid var(--stroke-2)', paddingBottom: 4 }}>
            Browse all 180 coaches &#8594;
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {COACHES.map((c, i) => (
            <CoachCard key={i} coach={c} large={i === 0 || i === 3} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CoachCard({ coach, large }: { coach: typeof COACHES[number]; large: boolean }) {
  const isLive = coach.tag === 'Live this week';
  return (
    <div style={{
      position: 'relative', height: large ? 600 : 400,
      gridRow: large ? 'span 2' : 'span 1',
      borderRadius: 'var(--r-md)', overflow: 'hidden',
      background: 'var(--bg-2)', cursor: 'pointer',
    }}>
      <img src={coach.img} alt={coach.name} style={{
        width: '100%', height: '100%', objectFit: 'cover',
        filter: 'saturate(0.85) contrast(1.04) brightness(0.95)',
        transition: 'transform 1.2s cubic-bezier(.2,.8,.2,1)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 35%, rgba(11,9,7,0.65) 80%, rgba(11,9,7,0.92) 100%)',
        pointerEvents: 'none',
      }} />
      {coach.tag && (
        <div style={{
          position: 'absolute', top: 18, left: 18,
          padding: '5px 11px', borderRadius: 999,
          background: isLive ? 'var(--accent)' : 'rgba(20,17,13,0.7)',
          backdropFilter: isLive ? 'none' : 'blur(8px)',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: isLive ? '#fff' : 'var(--text-1)',
          border: isLive ? 'none' : '1px solid var(--stroke-2)',
        }}>
          {isLive && '\u25cf '}{coach.tag}
        </div>
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 26,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(245,237,224,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            {coach.discipline}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: large ? 38 : 24,
            fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05,
          }}>{coach.name}</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '1px solid rgba(245,237,224,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
        }}>&#8599;</div>
      </div>
    </div>
  );
}
