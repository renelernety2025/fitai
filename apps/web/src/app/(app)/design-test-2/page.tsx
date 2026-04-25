'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FitIcon, FitIconBox } from '@/components/icons/FitIcons';

const STONE = '#1A1A17';
const SAND = '#F4F1EB';
const WARM = '#C8B89A';
const ACCENT = '#D4442A';

export default function DesignTest2Page() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const parallax = Math.min(scrollY * 0.15, 40);

  return (
    <div style={{ background: SAND, minHeight: '100vh', color: STONE }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
        .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .sans { font-family: 'Outfit', -apple-system, sans-serif; }
        .label { font-family: 'Outfit'; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em; color: ${WARM}; }
        .divider { height: 1px; background: ${STONE}12; }
        .hover-lift { transition: transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .hover-lift:hover { transform: translateY(-3px); }
        .fade-in { opacity: 0; animation: fi 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fd1 { animation-delay: 0.1s; } .fd2 { animation-delay: 0.2s; }
        .fd3 { animation-delay: 0.35s; } .fd4 { animation-delay: 0.5s; }
        .fd5 { animation-delay: 0.65s; } .fd6 { animation-delay: 0.8s; }
        @keyframes fi { to { opacity: 1; } }
        @media (max-width: 640px) { .two-col { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Thin top bar */}
      <div style={{
        background: STONE, padding: '10px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span className="sans" style={{ fontSize: 11, color: WARM, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          FitAI Athlete Profile
        </span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <FitIcon name="search" size={16} color={WARM} />
          <FitIcon name="settings" size={16} color={WARM} />
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span className="sans" style={{
              fontSize: 11, color: STONE, background: SAND,
              padding: '6px 16px', borderRadius: 20, fontWeight: 600,
            }}>Dashboard</span>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px' }}>

        {/* Hero */}
        <header className="fade-in" style={{
          padding: '64px 0 48px', borderBottom: `1px solid ${STONE}10`,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <p className="label fd1 fade-in">Athlete since 2024</p>
              <h1 className="serif" style={{
                fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 400,
                lineHeight: 0.92, letterSpacing: '-0.03em',
                marginTop: 8,
                transform: `translateY(${parallax}px)`,
                transition: 'transform 0.1s linear',
              }}>
                Rene<br />
                <em style={{ color: ACCENT }}>Chlubný</em>
              </h1>
            </div>
            <div className="fade-in fd2" style={{
              width: 100, height: 100, borderRadius: '50%',
              background: `linear-gradient(135deg, ${STONE}, ${STONE}CC)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 20,
            }}>
              <FitIcon name="muscle" size={36} color={ACCENT} strokeWidth={1.2} />
            </div>
          </div>

          <div className="fade-in fd3 sans" style={{
            display: 'flex', gap: 24, marginTop: 32, fontSize: 13,
            color: `${STONE}80`,
          }}>
            <span>Praha, CZ</span>
            <span style={{ color: `${STONE}20` }}>|</span>
            <span>Hypertrofie</span>
            <span style={{ color: `${STONE}20` }}>|</span>
            <span>PPL Split</span>
            <span style={{ color: `${STONE}20` }}>|</span>
            <span style={{ color: ACCENT }}>Legend Tier</span>
          </div>
        </header>

        {/* Stats grid */}
        <section className="fade-in fd3" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: `1px solid ${STONE}10`, gap: 0,
        }}>
          {[
            { n: '247', l: 'Day Streak', icon: 'flame' },
            { n: '91%', l: 'Avg Form', icon: 'target' },
            { n: '14.2k', l: 'Total XP', icon: 'star' },
            { n: '186', l: 'Sessions', icon: 'dumbbell' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '28px 0', textAlign: 'center',
              borderRight: i < 3 ? `1px solid ${STONE}08` : 'none',
            }}>
              <FitIcon name={s.icon} size={16} color={WARM} style={{ marginBottom: 8 }} />
              <div className="serif" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>
                {s.n}
              </div>
              <div className="label" style={{ marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </section>

        {/* Two column content */}
        <div className="two-col" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
          padding: '48px 0', borderBottom: `1px solid ${STONE}10`,
        }}>
          {/* Left: Recent PRs */}
          <section className="fade-in fd4">
            <p className="label" style={{ marginBottom: 20 }}>Personal Records</p>
            {[
              { ex: 'Bench Press', val: '95 kg', delta: '+2.5', date: '18. dub' },
              { ex: 'Squat', val: '120 kg', delta: '+5', date: '15. dub' },
              { ex: 'Deadlift', val: '140 kg', delta: '+10', date: '12. dub' },
              { ex: 'OHP', val: '55 kg', delta: '+2.5', date: '20. dub' },
            ].map((pr, i) => (
              <div key={i} className="hover-lift" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0', borderBottom: `1px solid ${STONE}06`,
              }}>
                <div>
                  <span className="sans" style={{ fontSize: 14, fontWeight: 600 }}>{pr.ex}</span>
                  <span className="sans" style={{ fontSize: 12, color: WARM, marginLeft: 10 }}>{pr.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="serif" style={{ fontSize: 20, fontWeight: 600 }}>{pr.val}</span>
                  <span className="sans" style={{
                    fontSize: 11, fontWeight: 600, color: '#2E7D32',
                    background: '#2E7D3210', padding: '2px 8px', borderRadius: 10,
                  }}>
                    <FitIcon name="trending" size={10} color="#2E7D32" /> {pr.delta}
                  </span>
                </div>
              </div>
            ))}
          </section>

          {/* Right: Body metrics */}
          <section className="fade-in fd5">
            <p className="label" style={{ marginBottom: 20 }}>Body Intelligence</p>
            {[
              { l: 'Recovery Score', v: '87 / 100', c: '#2E7D32' },
              { l: 'HRV', v: '54 ms', c: STONE },
              { l: 'Sleep Quality', v: '82%', c: STONE },
              { l: 'Weekly Volume', v: '113 sets', c: STONE },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 0', borderBottom: `1px solid ${STONE}06`,
              }}>
                <span className="sans" style={{ fontSize: 14, color: `${STONE}90` }}>{m.l}</span>
                <span className="serif" style={{ fontSize: 20, fontWeight: 600, color: m.c }}>{m.v}</span>
              </div>
            ))}

            {/* Muscle status mini */}
            <div style={{ marginTop: 24 }}>
              <p className="label" style={{ marginBottom: 12 }}>Muscle Status</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { n: 'Chest', s: 'fresh' }, { n: 'Back', s: 'fresh' },
                  { n: 'Shoulders', s: 'due' }, { n: 'Legs', s: 'fresh' },
                  { n: 'Arms', s: 'recovered' }, { n: 'Core', s: 'fresh' },
                ].map(m => (
                  <span key={m.n} className="sans" style={{
                    fontSize: 11, fontWeight: 500, padding: '5px 12px', borderRadius: 20,
                    background: m.s === 'fresh' ? '#2E7D3210' : m.s === 'due' ? `${ACCENT}10` : `${WARM}20`,
                    color: m.s === 'fresh' ? '#2E7D32' : m.s === 'due' ? ACCENT : `${STONE}80`,
                    border: `1px solid ${m.s === 'fresh' ? '#2E7D3220' : m.s === 'due' ? `${ACCENT}20` : `${WARM}30`}`,
                  }}>
                    {m.n}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Quote / Motivation */}
        <section className="fade-in fd5" style={{
          padding: '56px 0', textAlign: 'center',
          borderBottom: `1px solid ${STONE}10`,
        }}>
          <FitIcon name="flame" size={20} color={ACCENT} style={{ marginBottom: 16 }} />
          <blockquote className="serif" style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontStyle: 'italic', fontWeight: 400, lineHeight: 1.3,
            maxWidth: 560, margin: '0 auto', color: `${STONE}CC`,
          }}>
            &ldquo;Disciplína je most mezi cíli a jejich dosažením.&rdquo;
          </blockquote>
          <p className="sans" style={{
            fontSize: 12, color: WARM, marginTop: 16, letterSpacing: '0.1em',
          }}>
            JIM ROHN
          </p>
        </section>

        {/* Week activity */}
        <section className="fade-in fd6" style={{ padding: '48px 0 64px' }}>
          <p className="label" style={{ marginBottom: 20 }}>This Week</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((d, i) => {
              const active = [0, 2, 3, 4].includes(i);
              return (
                <div key={d} style={{
                  flex: 1, textAlign: 'center', padding: '16px 0',
                  borderRadius: 14,
                  background: active ? STONE : 'transparent',
                  border: active ? 'none' : `1px solid ${STONE}10`,
                  transition: 'all 0.3s',
                }}>
                  <span className="sans" style={{
                    fontSize: 11, fontWeight: 600,
                    color: active ? SAND : `${STONE}40`,
                  }}>{d}</span>
                  <div style={{ marginTop: 8 }}>
                    {active ? (
                      <FitIcon name="check" size={16} color={ACCENT} />
                    ) : (
                      <div style={{ width: 16, height: 16, margin: '0 auto', borderRadius: '50%',
                        border: `1px solid ${STONE}15` }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom bar */}
      <div style={{
        background: STONE, padding: '20px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span className="sans" style={{ fontSize: 11, color: `${SAND}40`, letterSpacing: '0.1em' }}>
          FitAI 2026
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['home', 'chart', 'dumbbell', 'heart', 'users'].map(icon => (
            <FitIcon key={icon} name={icon} size={18} color={`${SAND}40`} />
          ))}
        </div>
      </div>
    </div>
  );
}
