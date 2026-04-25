'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const GREEN = '#00FF88';
const CYAN = '#00E5FF';
const RED = '#FF3B5C';
const ORANGE = '#FF9F0A';
const LIME = '#A8FF00';

function Glow({ color, top, left, size = 200 }: {
  color: string; top: string; left: string; size?: number;
}) {
  return (
    <div style={{
      position: 'absolute', top, left, width: size, height: size,
      borderRadius: '50%', background: color, filter: 'blur(80px)',
      opacity: 0.06, pointerEvents: 'none',
    }} />
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
      color, background: `${color}12`, border: `1px solid ${color}25`,
      letterSpacing: '0.05em',
    }}>
      {label}
    </span>
  );
}

function BigMetric({ value, unit, label, color, glow }: {
  value: string; unit: string; label: string; color: string; glow?: boolean;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 20, padding: '24px 20px', position: 'relative', overflow: 'hidden',
    }}>
      {glow && <div style={{
        position: 'absolute', top: -30, right: -30, width: 100, height: 100,
        borderRadius: '50%', background: color, filter: 'blur(50px)', opacity: 0.1,
      }} />}
      <span style={{
        fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
        letterSpacing: '0.15em', fontWeight: 600,
      }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
        <span style={{
          fontSize: 42, fontWeight: 900, color, letterSpacing: '-0.03em',
          textShadow: `0 0 30px ${color}40`,
        }}>{value}</span>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>{unit}</span>
      </div>
    </div>
  );
}

function GlassCard({ children, style }: {
  children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24,
      padding: '28px 24px', position: 'relative', overflow: 'hidden',
      transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s',
      ...style,
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
    }}>
      {children}
    </div>
  );
}

function PulseWave({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 40" style={{ width: '100%', height: 40, opacity: 0.4 }}>
      <path
        d="M0 20 Q25 5 50 20 T100 20 T150 20 T200 20"
        fill="none" stroke={color} strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <path
        d="M0 20 Q25 35 50 20 T100 20 T150 20 T200 20"
        fill="none" stroke={color} strokeWidth="1" opacity="0.3"
      />
    </svg>
  );
}

export default function DesignTestPage() {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => setPulse(p => !p), 2500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#050508', color: 'white',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '24px 16px 80px', maxWidth: 900, margin: '0 auto',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glows */}
      <Glow color={GREEN} top="-100px" left="60%" size={300} />
      <Glow color={RED} top="400px" left="-10%" size={250} />
      <Glow color={CYAN} top="900px" left="70%" size={200} />

      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 0 32px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: `linear-gradient(135deg, ${LIME}30, ${GREEN}10)`,
            border: `1px solid ${LIME}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: LIME,
          }}>F</div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>FitAI</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <StatusBadge label="System Online" color={GREEN} />
        </div>
      </header>

      {/* Hero: System Status */}
      <GlassCard style={{ marginBottom: 12, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 180, height: 180, borderRadius: '50%',
          background: GREEN, filter: 'blur(80px)',
          opacity: pulse ? 0.08 : 0.04, transition: 'opacity 2.5s ease',
          pointerEvents: 'none',
        }} />
        <span style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)',
        }}>Body System</span>
        <h1 style={{
          fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800,
          letterSpacing: '-0.04em', lineHeight: 1.05, marginTop: 8,
        }}>
          System Status:{' '}
          <span style={{ color: GREEN, textShadow: `0 0 40px ${GREEN}50` }}>
            Optimal
          </span>
        </h1>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 20,
        }}>
          <span style={{
            fontSize: 80, fontWeight: 900, color: GREEN,
            textShadow: `0 0 60px ${GREEN}30`,
            letterSpacing: '-0.05em', lineHeight: 1,
          }}>87</span>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)' }}>
            / 100 recovery score
          </span>
        </div>
        <PulseWave color={GREEN} />
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginTop: 8,
        }}>
          Tvoje telo je pripravene na vyssi intenzitu. Doporucujeme push den.
        </p>
      </GlassCard>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10, marginBottom: 12,
      }}>
        <BigMetric value="72" unit="BPM" label="Heart Rate" color={RED} glow />
        <BigMetric value="98" unit="%" label="O2 Saturace" color={CYAN} glow />
        <BigMetric value="54" unit="ms" label="HRV" color={GREEN} glow />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12,
      }}>
        <BigMetric value="47" unit="dni" label="Streak" color={ORANGE} />
        <BigMetric value="91" unit="%" label="Avg Form" color={LIME} />
      </div>

      {/* Cardio Pulse Card */}
      <GlassCard style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)',
            }}>Live Biometrics</span>
            <h2 style={{
              fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em',
              marginTop: 4, color: CYAN,
              textShadow: `0 0 20px ${CYAN}30`,
            }}>Cardiovascular Pulse</h2>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatusBadge label="HRV 54ms" color={GREEN} />
            <StatusBadge label="O2 98%" color={CYAN} />
          </div>
        </div>
        <div style={{ margin: '16px 0' }}>
          <PulseWave color={CYAN} />
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          Tvuj srdecni tep je stabilni. Nebyla zaznamenana zadna anomalie
          behem spanku ani treninkove aktivity.
        </p>
        <button style={{
          marginTop: 16, padding: '10px 20px', borderRadius: 12,
          background: `${CYAN}10`, border: `1px solid ${CYAN}25`,
          color: CYAN, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          Stahnout report
        </button>
      </GlassCard>

      {/* Today's Plan */}
      <GlassCard style={{ marginBottom: 12 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)',
        }}>Dnesni plan</span>
        <h2 style={{
          fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
          marginTop: 8,
        }}>Push Day — Chest & Shoulders</h2>
        <div style={{
          display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap',
        }}>
          {['Bench Press', 'OHP', 'Incline DB', 'Lateral Raises', 'Tricep Dips'].map(ex => (
            <span key={ex} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)',
            }}>{ex}</span>
          ))}
        </div>
        <Link href="/gym">
          <button style={{
            marginTop: 20, padding: '14px 28px', borderRadius: 14,
            background: `linear-gradient(135deg, ${LIME}, ${GREEN})`,
            border: 'none', color: '#050508', fontSize: 14,
            fontWeight: 700, cursor: 'pointer', width: '100%',
            boxShadow: `0 0 30px ${GREEN}20`,
          }}>
            Zacit trenink
          </button>
        </Link>
      </GlassCard>

      {/* Maintenance alerts */}
      <GlassCard style={{ marginBottom: 12 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)',
        }}>Body Maintenance</span>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { part: 'Ramena', status: 'Overdue', days: 14, color: RED },
            { part: 'Nohy', status: 'Fresh', days: 2, color: GREEN },
            { part: 'Zada', status: 'Due', days: 10, color: ORANGE },
          ].map(m => (
            <div key={m.part} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 14,
              background: 'rgba(255,255,255,0.02)',
              borderLeft: `3px solid ${m.color}`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: m.color, boxShadow: `0 0 8px ${m.color}60`,
              }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{m.part}</span>
                <span style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8,
                }}>{m.days}d since deload</span>
              </div>
              <StatusBadge label={m.status} color={m.color} />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Footer CTA */}
      <div style={{
        textAlign: 'center', padding: '40px 20px',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{
          fontSize: 11, color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          FitAI — Your Body&apos;s Operating System
        </p>
      </div>
    </div>
  );
}
