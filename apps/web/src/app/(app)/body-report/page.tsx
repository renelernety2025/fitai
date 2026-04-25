'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Body Report — Weekly health intelligence
 * Aesthetic: Swiss modernism × noir cinema
 * One accent: electric mint. Everything else: grayscale.
 */

const MINT = '#2DFFA0';
const MINT_DIM = '#2DFFA015';
const BONE = '#E8E4DF';

function useMouse() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return pos;
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0' }} />;
}

function Stat({ label, value, unit, accent }: {
  label: string; value: string; unit?: string; accent?: boolean;
}) {
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{
        fontSize: 11, fontWeight: 500, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
        fontFamily: "'IBM Plex Mono', monospace",
      }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 6,
      }}>
        <span style={{
          fontSize: 38, fontWeight: 200, letterSpacing: '-0.04em',
          color: accent ? MINT : BONE,
          fontFamily: "'Instrument Serif', Georgia, serif",
        }}>{value}</span>
        {unit && <span style={{
          fontSize: 13, color: 'rgba(255,255,255,0.25)',
          fontFamily: "'IBM Plex Mono', monospace",
        }}>{unit}</span>}
      </div>
    </div>
  );
}

function BarChart({ data, color }: {
  data: { label: string; value: number; max: number }[];
  color: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 28, fontSize: 11, color: 'rgba(255,255,255,0.3)',
            fontFamily: "'IBM Plex Mono', monospace", textAlign: 'right',
          }}>{d.label}</span>
          <div style={{
            flex: 1, height: 3, background: 'rgba(255,255,255,0.06)',
            borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              width: `${(d.value / d.max) * 100}%`, height: '100%',
              background: color, borderRadius: 2,
              transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: `${i * 0.1}s`,
            }} />
          </div>
          <span style={{
            width: 32, fontSize: 11, color: 'rgba(255,255,255,0.4)',
            fontFamily: "'IBM Plex Mono', monospace", textAlign: 'right',
          }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function MuscleHeat({ groups }: {
  groups: { name: string; volume: number; status: string }[];
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
      {groups.map((g, i) => {
        const intensity = Math.min(g.volume / 30, 1);
        return (
          <div key={i} style={{
            padding: '14px 16px',
            background: `rgba(45, 255, 160, ${intensity * 0.08})`,
            borderLeft: `2px solid rgba(45, 255, 160, ${intensity * 0.5})`,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: BONE,
              letterSpacing: '-0.01em',
            }}>{g.name}</div>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.3)',
              fontFamily: "'IBM Plex Mono', monospace", marginTop: 2,
            }}>{g.volume} sets · {g.status}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function BodyReportPage() {
  const user = { name: 'Demo User' };
  const mouse = useMouse();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const weekDays = ['Po', 'Ut', 'St', 'Ct', 'Pa', 'So', 'Ne'];
  const weekVolume = [
    { label: 'Po', value: 24, max: 35 },
    { label: 'Ut', value: 0, max: 35 },
    { label: 'St', value: 31, max: 35 },
    { label: 'Ct', value: 18, max: 35 },
    { label: 'Pa', value: 28, max: 35 },
    { label: 'So', value: 0, max: 35 },
    { label: 'Ne', value: 12, max: 35 },
  ];

  const muscles = [
    { name: 'Hrudník', volume: 18, status: 'recovered' },
    { name: 'Záda', volume: 24, status: 'fresh' },
    { name: 'Ramena', volume: 12, status: 'due' },
    { name: 'Nohy', volume: 28, status: 'fresh' },
    { name: 'Biceps', volume: 9, status: 'recovered' },
    { name: 'Triceps', volume: 11, status: 'recovered' },
    { name: 'Core', volume: 15, status: 'fresh' },
    { name: 'Lýtka', volume: 6, status: 'due' },
  ];

  const now = new Date();
  const weekNum = Math.ceil(
    ((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7,
  );

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh', background: '#09090B', color: BONE,
        fontFamily: "'DM Sans', -apple-system, sans-serif",
        position: 'relative', overflow: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');
        .fade-up { opacity: 0; transform: translateY(20px); animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fade-up-d1 { animation-delay: 0.1s; }
        .fade-up-d2 { animation-delay: 0.2s; }
        .fade-up-d3 { animation-delay: 0.35s; }
        .fade-up-d4 { animation-delay: 0.5s; }
        .fade-up-d5 { animation-delay: 0.65s; }
        .fade-up-d6 { animation-delay: 0.8s; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .report-grid { display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px) { .report-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Cursor light follow */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 0,
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${MINT}04 0%, transparent 70%)`,
        transform: `translate(${mouse.x - 200}px, ${mouse.y - 200}px)`,
        transition: 'transform 0.3s ease-out',
      }} />

      {/* Scanline effect */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
        background: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        opacity: 0.4,
      }} />

      <div style={{
        maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Report header */}
        <header className="fade-up" style={{ marginBottom: 48 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <div style={{
                fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
                color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                Weekly Body Intelligence · W{weekNum}
              </div>
              <h1 style={{
                fontSize: 'clamp(2.5rem, 7vw, 4rem)',
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontWeight: 400, letterSpacing: '-0.03em',
                lineHeight: 1, marginTop: 12, color: BONE,
              }}>
                Body<br />
                <em style={{ color: MINT }}>Report.</em>
              </h1>
            </div>
            <div style={{
              textAlign: 'right', fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              color: 'rgba(255,255,255,0.2)', lineHeight: 1.8,
            }}>
              {now.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
              {user?.name || 'Demo User'}<br />
              <span style={{ color: MINT }}>● online</span>
            </div>
          </div>
        </header>

        <Divider />

        {/* Key metrics row */}
        <section className="fade-up fade-up-d1">
          <div className="report-grid" style={{ gap: 1 }}>
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: 20 }}>
              <Stat label="Recovery Score" value="87" unit="/ 100" accent />
            </div>
            <div style={{ paddingLeft: 20 }}>
              <Stat label="Week Volume" value="113" unit="sets" />
            </div>
          </div>
        </section>

        <Divider />

        <section className="fade-up fade-up-d1">
          <div className="report-grid" style={{ gap: 1 }}>
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: 20 }}>
              <Stat label="Avg Form Score" value="91" unit="%" accent />
            </div>
            <div style={{ paddingLeft: 20 }}>
              <Stat label="Active Streak" value="47" unit="dní" />
            </div>
          </div>
        </section>

        <Divider />

        {/* Weekly volume chart */}
        <section className="fade-up fade-up-d2" style={{ padding: '28px 0' }}>
          <div style={{
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: 16,
          }}>Weekly Distribution</div>
          <BarChart data={weekVolume} color={MINT} />
        </section>

        <Divider />

        {/* Muscle heatmap */}
        <section className="fade-up fade-up-d3" style={{ padding: '28px 0' }}>
          <div style={{
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: 16,
          }}>Muscle Group Load</div>
          <div style={{
            borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <MuscleHeat groups={muscles} />
          </div>
        </section>

        <Divider />

        {/* Insights */}
        <section className="fade-up fade-up-d4" style={{ padding: '28px 0' }}>
          <div style={{
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: 16,
          }}>AI Insights</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '↗', text: 'Bench press progres: +2.5kg za poslední 2 týdny. Konzistentní růst.', type: 'positive' },
              { icon: '⚠', text: 'Ramena mají 14 sessions od posledního deloadu. Doporučuji recovery den.', type: 'warning' },
              { icon: '◎', text: 'Tvůj spánek se zlepšil o 12% — přímo koreluje s lepší formou.', type: 'neutral' },
            ].map((insight, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, padding: '16px 18px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 12,
                borderLeft: `2px solid ${
                  insight.type === 'positive' ? MINT :
                  insight.type === 'warning' ? '#FF9F0A' : 'rgba(255,255,255,0.15)'
                }`,
              }}>
                <span style={{
                  fontSize: 16, width: 20, flexShrink: 0,
                  color: insight.type === 'positive' ? MINT :
                    insight.type === 'warning' ? '#FF9F0A' : 'rgba(255,255,255,0.4)',
                }}>{insight.icon}</span>
                <p style={{
                  fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)',
                  margin: 0,
                }}>{insight.text}</p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Week comparison */}
        <section className="fade-up fade-up-d5" style={{ padding: '28px 0' }}>
          <div style={{
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em',
            textTransform: 'uppercase', marginBottom: 16,
          }}>Week-over-Week</div>
          <div className="report-grid" style={{ gap: 20 }}>
            {[
              { label: 'Volume', current: '113', prev: '98', delta: '+15.3%', up: true },
              { label: 'Form', current: '91%', prev: '88%', delta: '+3.4%', up: true },
              { label: 'Sessions', current: '5', prev: '4', delta: '+1', up: true },
              { label: 'Rest days', current: '2', prev: '3', delta: '-1', up: false },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.4)',
                }}>{m.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 600, color: BONE,
                  }}>{m.current}</span>
                  <span style={{
                    fontSize: 11,
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: m.up ? MINT : '#FF3B5C',
                  }}>{m.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Footer */}
        <footer className="fade-up fade-up-d6" style={{
          padding: '32px 0', textAlign: 'center',
        }}>
          <p style={{
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
            color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em',
          }}>
            Generated by FitAI · {now.toLocaleDateString('cs-CZ')} · W{weekNum}
          </p>
        </footer>
      </div>
    </div>
  );
}
