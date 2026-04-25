'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FitIcon, FitIconBox } from '@/components/icons/FitIcons';

const NAVY = '#0B1A2E';
const NAVY_LIGHT = '#132744';
const ORANGE = '#FF7A2F';
const CREAM = '#FFF8F0';

function Pill({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 18px', borderRadius: 30, fontSize: 13, fontWeight: 600,
      ...style,
    }}>{children}</span>
  );
}

function FeatureCard({ title, desc, bg, icon, iconBg }: {
  title: string; desc: string; bg: string; icon: string; iconBg: string;
}) {
  return (
    <div style={{
      background: bg, borderRadius: 24, padding: '28px 24px',
      cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}
    onMouseEnter={e => { (e.currentTarget).style.transform = 'translateY(-4px)'; }}
    onMouseLeave={e => { (e.currentTarget).style.transform = 'translateY(0)'; }}>
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'rgba(0,0,0,0.4)' }}>{title}</span>
      <FitIconBox name={icon} bg={iconBg} size={48} radius={14}
        style={{ margin: '16px 0 12px' }} />
      <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

function AnimCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / 1500, 1);
      setVal(Math.floor((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{val}</>;
}

export default function DesignTestPage() {
  return (
    <div style={{ background: CREAM, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
        .hero-h { font-size: clamp(2.2rem, 6vw, 4.5rem); font-weight: 800; line-height: 0.95; letter-spacing: -0.03em; color: white; text-transform: uppercase; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 30px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: transform 0.2s; }
        .btn:hover { transform: scale(1.04); }
        .nav-a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-a:hover { color: white; }
        .bento { display: grid; grid-template-columns: 1.2fr 0.8fr 1fr; gap: 14px; }
        @media (max-width: 768px) { .bento { grid-template-columns: 1fr; } }
      `}</style>

      {/* HERO */}
      <div style={{ background: NAVY, borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -80, width: 300, height: 300,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />

        <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>FitAI.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link href="/dashboard" className="nav-a">Dashboard</Link>
              <Link href="/exercises" className="nav-a">Cviky</Link>
              <Link href="/ai-chat" className="nav-a">AI Coach</Link>
              <Link href="/community" className="nav-a">Komunita</Link>
            </div>
          </div>
          <Link href="/register">
            <button className="btn" style={{ background: 'white', color: NAVY }}>Zkusit zdarma</button>
          </Link>
        </nav>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 60px',
          display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, position: 'relative', zIndex: 2 }}>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: NAVY_LIGHT, borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <FitIconBox name="dumbbell" bg={ORANGE} size={48} />
                <FitIconBox name="brain" bg="#4FC3F7" size={48} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginTop: 12 }}>AI trenér pro tvůj cíl</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Personalizované plány</p>
            </div>
            <div style={{ background: NAVY_LIGHT, borderRadius: 20, padding: 24 }}>
              <FitIcon name="shoe" size={28} color="rgba(255,255,255,0.6)" />
              <p style={{ fontSize: 13, fontWeight: 600, color: 'white', marginTop: 12 }}>Sleduj svůj gear</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Vybavení, suplementy, rutiny</p>
            </div>
          </div>

          {/* Hero text */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Pill style={{ background: `${ORANGE}20`, color: ORANGE, alignSelf: 'flex-start', marginBottom: 20 }}>
              <FitIcon name="bolt" size={14} color={ORANGE} /> Posuň svůj trénink
            </Pill>
            <h1 className="hero-h">
              Tvůj AI<br />osobní<br />
              <span style={{ color: ORANGE }}>trenér</span>{' '}
              <FitIconBox name="muscle" bg={ORANGE} size={52} radius={16}
                style={{ display: 'inline-flex', verticalAlign: 'middle', transform: 'rotate(-5deg)' }} />
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 32 }}>
              <Link href="/register">
                <button className="btn" style={{
                  background: ORANGE, color: 'white', fontSize: 15, padding: '16px 32px',
                  boxShadow: `0 8px 24px ${ORANGE}40`,
                }}>
                  Začít trénovat <FitIcon name="arrow" size={16} />
                </button>
              </Link>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 240, lineHeight: 1.5 }}>
                Od ranních tréninků po večerní stretching — AI ti pomáhá s formou, výživou i regenerací.
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 40px',
          display: 'flex', justifyContent: 'center', gap: 48, position: 'relative', zIndex: 2 }}>
          {[
            { v: 2847, l: 'Uživatelů', icon: 'users' },
            { v: 60, l: 'Cviků', icon: 'target' },
            { v: 340, l: 'Endpointů', icon: 'bolt' },
            { v: 99, l: 'DB modelů', icon: 'settings' },
          ].map(s => (
            <div key={s.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 20px' }}>
              <FitIcon name={s.icon} size={16} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>
                <AnimCounter target={s.v} />+
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BENTO */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800,
            color: NAVY, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Aktivní život s{'\u00a0'}
            <span style={{ color: ORANGE }}>hlavní</span><br />postavou. Tebou.
          </h2>
          <Link href="/exercises">
            <button className="btn" style={{ background: NAVY, color: 'white', fontSize: 13 }}>
              Prozkoumat <FitIcon name="arrow" size={14} />
            </button>
          </Link>
        </div>

        <div className="bento">
          <FeatureCard title="Knihovna cviků" icon="target" iconBg="#43A047"
            desc="60+ cviků s 3D animací, fázemi a coaching hints."
            bg="linear-gradient(135deg, #E8F5E9, #C8E6C9)" />
          <FeatureCard title="AI Coach" icon="brain" iconBg="#E65100"
            desc="Claude AI ti dává zpětnou vazbu česky v reálném čase."
            bg="linear-gradient(135deg, #FFF3E0, #FFE0B2)" />
          <FeatureCard title="Tvůj pokrok" icon="chart" iconBg="#1565C0"
            desc="XP, streaky, ligy, skill tree. Gamifikace co motivuje."
            bg="linear-gradient(135deg, #E3F2FD, #BBDEFB)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <div style={{ background: NAVY, borderRadius: 24, padding: '32px 28px',
            position: 'relative', overflow: 'hidden', minHeight: 200 }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120,
              borderRadius: '50%', background: ORANGE, opacity: 0.1 }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: ORANGE }}>Nové</span>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white',
              letterSpacing: '-0.02em', marginTop: 8, lineHeight: 1.2 }}>
              1v1 Duely, Squads,<br />Limited Drops
            </h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {[
                { icon: 'sword', label: 'Duely' },
                { icon: 'users', label: 'Squads' },
                { icon: 'crown', label: 'Drops' },
              ].map(p => (
                <Pill key={p.label} style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                  <FitIcon name={p.icon} size={12} /> {p.label}
                </Pill>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 24, padding: '32px 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            border: '1px solid rgba(0,0,0,0.06)' }}>
            <FitIcon name="users" size={20} color="rgba(0,0,0,0.25)" />
            <div style={{ fontSize: 56, fontWeight: 800, color: NAVY,
              letterSpacing: '-0.04em', lineHeight: 1, marginTop: 8 }}>
              <AnimCounter target={2847} />+
            </div>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.4)', marginTop: 8, lineHeight: 1.5 }}>
              Lidí trénuje s AI. Připoj se k nim.
            </p>
            <Link href="/register">
              <button className="btn" style={{ background: ORANGE, color: 'white', marginTop: 16,
                boxShadow: `0 4px 16px ${ORANGE}30` }}>
                Začít zdarma <FitIcon name="arrow" size={14} />
              </button>
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24, justifyContent: 'center' }}>
          {[
            { label: 'Pose Detection', icon: 'camera' },
            { label: 'Meal Plans', icon: 'apple' },
            { label: 'Voice Coach', icon: 'music' },
            { label: 'Body Photos', icon: 'camera' },
            { label: 'Supplements', icon: 'pill' },
            { label: 'Gear Tracker', icon: 'shoe' },
            { label: 'Form Check', icon: 'target' },
            { label: 'Playlists', icon: 'music' },
          ].map(f => (
            <Pill key={f.label} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', color: NAVY, fontSize: 12 }}>
              <FitIcon name={f.icon} size={14} color={ORANGE} /> {f.label}
            </Pill>
          ))}
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: 24, fontSize: 12, color: 'rgba(0,0,0,0.3)' }}>
        FitAI 2026 · Powered by Claude AI
      </footer>
    </div>
  );
}
