'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAVY = '#0B1A2E';
const NAVY_LIGHT = '#132744';
const ORANGE = '#FF7A2F';
const SKY = '#4FC3F7';
const LIME = '#C6FF00';
const CREAM = '#FFF8F0';
const CORAL = '#FF6B6B';

function Pill({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '8px 18px', borderRadius: 30,
      fontSize: 13, fontWeight: 600,
      ...style,
    }}>{children}</span>
  );
}

function FeatureCard({ title, desc, bg, emoji, style }: {
  title: string; desc: string; bg: string; emoji: string;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: bg, borderRadius: 24, padding: '28px 24px',
      position: 'relative', overflow: 'hidden', cursor: 'pointer',
      transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
      ...style,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.01)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'; }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.4)' }}>
        {title}
      </span>
      <div style={{ fontSize: 36, margin: '16px 0 8px' }}>{emoji}</div>
      <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

function StatBubble({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 4, padding: '14px 20px',
    }}>
      <span style={{
        fontSize: 32, fontWeight: 800, color: 'white',
        letterSpacing: '-0.03em',
      }}>{value}</span>
      <span style={{
        fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)',
      }}>{label}</span>
    </div>
  );
}

export default function DesignTestPage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame: number;
    const target = 2847;
    const dur = 1500;
    const start = Date.now();
    const tick = () => {
      const t = Math.min((Date.now() - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(ease * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{ background: CREAM, minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
        .hero-heading { font-size: clamp(2.2rem, 6vw, 4.5rem); font-weight: 800; line-height: 0.95; letter-spacing: -0.03em; color: white; text-transform: uppercase; }
        .cta-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 30px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .cta-btn:hover { transform: scale(1.04); }
        .cta-btn:active { transform: scale(0.97); }
        .nav-link { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: white; }
        .bento { display: grid; grid-template-columns: 1.2fr 0.8fr 1fr; gap: 14px; }
        @media (max-width: 768px) { .bento { grid-template-columns: 1fr; } .hero-heading { font-size: 2.2rem; } }
        .float-anim { animation: floaty 3s ease-in-out infinite; }
        @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .side-card { background: ${NAVY_LIGHT}; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .avatar-stack { display: flex; }
        .avatar-stack > div { width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${NAVY}; margin-left: -8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .avatar-stack > div:first-child { margin-left: 0; }
      `}</style>

      {/* ── HERO SECTION ── */}
      <div style={{ background: NAVY, borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -100, right: -80, width: 300, height: 300,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', bottom: -50, left: '30%', width: 200, height: 200,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)',
        }} />

        {/* Nav */}
        <nav style={{
          maxWidth: 1200, margin: '0 auto', padding: '20px 32px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>FitAI.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/exercises" className="nav-link">Cviky</Link>
              <Link href="/ai-chat" className="nav-link">AI Coach</Link>
              <Link href="/community" className="nav-link">Komunita</Link>
            </div>
          </div>
          <Link href="/register">
            <button className="cta-btn" style={{ background: 'white', color: NAVY }}>
              Zkusit zdarma
            </button>
          </Link>
        </nav>

        {/* Hero content */}
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '48px 32px 60px',
          display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32,
          position: 'relative', zIndex: 2,
        }}>

          {/* Left sidebar cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="side-card">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  🏋️
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: SKY, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  🧠
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>AI trenér pro tvůj cíl</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Personalizované plány</span>
            </div>
            <div className="side-card">
              <div style={{ fontSize: 28 }}>👟</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Sleduj svůj gear</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Vybavení, suplementy, rutiny</span>
            </div>
          </div>

          {/* Center hero */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Pill style={{ background: `${ORANGE}20`, color: ORANGE, alignSelf: 'flex-start', marginBottom: 20 }}>
              ⚡ Posuň svůj trénink
            </Pill>
            <h1 className="hero-heading">
              Tvůj AI
              <br />
              osobní
              <br />
              <span style={{ color: ORANGE }}>trenér</span>{' '}
              <span style={{
                display: 'inline-flex', width: 56, height: 56,
                borderRadius: 16, background: ORANGE,
                alignItems: 'center', justifyContent: 'center',
                fontSize: 28, verticalAlign: 'middle', transform: 'rotate(-5deg)',
              }}>💪</span>
            </h1>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 32, marginTop: 32,
            }}>
              <Link href="/register">
                <button className="cta-btn" style={{
                  background: ORANGE, color: 'white', fontSize: 15, padding: '16px 32px',
                  boxShadow: `0 8px 24px ${ORANGE}40`,
                }}>
                  Začít trénovat →
                </button>
              </Link>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 240, lineHeight: 1.5 }}>
                Od ranních tréninků po večerní stretching — AI ti pomáhá s formou, výživou i regenerací.
              </span>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 32px 40px',
          display: 'flex', justifyContent: 'center', gap: 48,
          position: 'relative', zIndex: 2,
        }}>
          <StatBubble value={`${count}+`} label="Uživatelů" />
          <StatBubble value="60+" label="Cviků" />
          <StatBubble value="340+" label="API endpointů" />
          <StatBubble value="99" label="DB modelů" />
        </div>
      </div>

      {/* ── BENTO SECTION ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 48px' }}>

        {/* Section header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: 20,
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800,
              color: NAVY, letterSpacing: '-0.03em', lineHeight: 1.1,
            }}>
              Aktivní život s&nbsp;
              <span style={{ color: ORANGE }}>hlavní</span>
              <br />postavou. Tebou.
            </h2>
            <div className="avatar-stack" style={{ marginTop: 12 }}>
              <div style={{ background: CORAL }}>🧔</div>
              <div style={{ background: SKY }}>👩</div>
              <div style={{ background: LIME, color: '#333' }}>💪</div>
              <div style={{ background: ORANGE }}>🏃</div>
            </div>
          </div>
          <Link href="/exercises">
            <button className="cta-btn" style={{
              background: NAVY, color: 'white', fontSize: 13,
            }}>
              Prozkoumat cviky ↗
            </button>
          </Link>
        </div>

        {/* Bento grid */}
        <div className="bento">
          {/* Card 1: Green - exercises */}
          <FeatureCard
            title="Knihovna cviků"
            emoji="🎯"
            desc="60+ cviků s 3D animací, fázemi a coaching hints."
            bg="linear-gradient(135deg, #E8F5E9, #C8E6C9)"
          />

          {/* Card 2: Orange - AI coach */}
          <FeatureCard
            title="AI Coach"
            emoji="🤖"
            desc="Claude AI ti dává zpětnou vazbu česky v reálném čase."
            bg={`linear-gradient(135deg, #FFF3E0, #FFE0B2)`}
            style={{ color: '#333' }}
          />

          {/* Card 3: Blue - progress */}
          <FeatureCard
            title="Tvůj pokrok"
            emoji="📊"
            desc="XP, streaky, ligy, skill tree. Gamifikace co motivuje."
            bg={`linear-gradient(135deg, #E3F2FD, #BBDEFB)`}
          />
        </div>

        {/* Second row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 14, marginTop: 14,
        }}>
          {/* Big card */}
          <div style={{
            background: NAVY, borderRadius: 24, padding: '32px 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative', overflow: 'hidden', minHeight: 200,
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 120, height: 120,
              borderRadius: '50%', background: ORANGE, opacity: 0.1,
            }} />
            <div>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: ORANGE,
              }}>Nové</span>
              <h3 style={{
                fontSize: 22, fontWeight: 800, color: 'white',
                letterSpacing: '-0.02em', marginTop: 8, lineHeight: 1.2,
              }}>
                1v1 Duely, Squads,<br />Limited Drops
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Pill style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>⚔️ Duely</Pill>
              <Pill style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>👥 Squads</Pill>
              <Pill style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>💎 Drops</Pill>
            </div>
          </div>

          {/* Stats card */}
          <div style={{
            background: 'white', borderRadius: 24, padding: '32px 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'rgba(0,0,0,0.35)',
            }}>Aktivní komunita</span>
            <div style={{
              fontSize: 56, fontWeight: 800, color: NAVY,
              letterSpacing: '-0.04em', lineHeight: 1, marginTop: 8,
            }}>
              {count}+
            </div>
            <p style={{
              fontSize: 13, color: 'rgba(0,0,0,0.4)', marginTop: 8, lineHeight: 1.5,
            }}>
              Lidí trénuje s AI. Připoj se k nim.
            </p>
            <Link href="/register">
              <button className="cta-btn" style={{
                background: ORANGE, color: 'white', marginTop: 16,
                boxShadow: `0 4px 16px ${ORANGE}30`,
              }}>
                Začít zdarma →
              </button>
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24,
          justifyContent: 'center',
        }}>
          {[
            { label: 'Pose Detection', icon: '🎯' },
            { label: 'Meal Plans', icon: '🍽️' },
            { label: 'Voice Coach', icon: '🎙️' },
            { label: 'Body Photos', icon: '📸' },
            { label: 'Supplements', icon: '💊' },
            { label: 'Gear Tracker', icon: '👟' },
            { label: 'Form Check', icon: '📹' },
            { label: 'Playlists', icon: '🎵' },
          ].map(f => (
            <Pill key={f.label} style={{
              background: 'white', border: '1px solid rgba(0,0,0,0.08)',
              color: NAVY, fontSize: 12,
            }}>
              {f.icon} {f.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '24px', fontSize: 12,
        color: 'rgba(0,0,0,0.3)',
      }}>
        FitAI 2026 · Powered by Claude AI
      </footer>
    </div>
  );
}
