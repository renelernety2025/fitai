import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/v3';

export const metadata: Metadata = {
  title: 'FitAI — AI Personal Trainer | Become Your Strongest Self',
  description: 'World-class AI coaching that adapts to your body. Personalized workout plans, real-time form feedback, nutrition tracking, and a community that shows up.',
  openGraph: {
    title: 'FitAI — AI Personal Trainer',
    description: 'World-class AI coaching that adapts to your body.',
    url: 'https://fitai.bfevents.cz',
    siteName: 'FitAI',
    type: 'website',
  },
};

const HERO_IMG = 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=2400&q=85&auto=format&fit=crop';

const DISCIPLINES = [
  'Walking', 'Running', 'Yoga', 'Strength', 'Mobility',
  'Pilates', 'HIIT', 'Cycling', 'Recovery', 'Breathwork',
  'Stretching', 'Endurance',
];

const METRICS: { value: string; label: string }[] = [
  { value: '60+', label: 'Exercises in library' },
  { value: 'AI', label: 'Personal trainer' },
  { value: '100%', label: 'Complete nutrition' },
  { value: '24/7', label: 'Always available' },
];

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Train', href: '/register' },
  { label: 'Community', href: '/register' },
  { label: 'Pricing', href: '/register' },
];

const FEATURES = [
  { icon: '\u{1F3AF}', title: 'AI Form Coaching', desc: 'Real-time pose detection with Claude AI feedback. Your form is analyzed every rep, every set.' },
  { icon: '\u{1F4CA}', title: 'Smart Plans', desc: 'AI-generated periodized training plans that adapt to your recovery, goals, and progress.' },
  { icon: '\u{1F34E}', title: 'Nutrition Tracking', desc: 'Photo-based food recognition, macro tracking, and AI-generated meal plans with shopping lists.' },
  { icon: '\u{1F3C6}', title: 'Gamification', desc: 'Leagues, skill trees, boss fights, achievements, and battle passes keep you motivated.' },
  { icon: '\u{1F465}', title: 'Community', desc: 'Social feed, challenges, squads, gym buddy matching, and creator economy.' },
  { icon: '\u{1F4F1}', title: 'Mobile + Web', desc: 'Train anywhere. Full-featured iOS app with camera workout mode and web dashboard.' },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100vh' }}>
      {/* Sticky nav */}
      <nav style={{
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
          <Logo size={20} />
          <div className="landing-nav-links" style={{ display: 'flex', gap: 36, fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href} style={{ color: 'var(--text-2)', textDecoration: 'none' }}>{l.label}</Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/login" className="landing-signin" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>
              Sign in
            </Link>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '10px 20px', fontSize: 12, fontWeight: 600,
              borderRadius: 'var(--r-pill)',
              background: 'var(--accent)', color: '#fff',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-ember)',
            }}>
              Start free
            </Link>
            <button className="landing-hamburger" aria-label="Menu" style={{
              display: 'none', background: 'none', border: 'none',
              color: 'var(--text-1)', fontSize: 24, cursor: 'pointer', padding: 4,
            }}>
              &#9776;
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: 820, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: 'cover', backgroundPosition: 'center 35%',
          filter: 'saturate(0.85) contrast(1.05) brightness(0.92)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: [
            'radial-gradient(ellipse at 70% 35%, rgba(232,93,44,0.10) 0%, transparent 55%)',
            'linear-gradient(180deg, rgba(11,9,7,0.35) 0%, rgba(11,9,7,0.55) 55%, var(--bg-0) 100%)',
          ].join(', '),
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(11,9,7,0.78) 0%, rgba(11,9,7,0.35) 45%, transparent 75%)',
        }} />
        <div style={{
          position: 'relative', zIndex: 2, minHeight: 820,
          maxWidth: 1440, margin: '0 auto', padding: '120px 40px 96px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          <div style={{ maxWidth: 780 }}>
            <div className="v3-eyebrow" style={{ marginBottom: 24, color: 'var(--accent-hot)' }}>
              AI-powered fitness — Train smarter, not harder
            </div>
            <h1 className="v3-display-1" style={{ margin: '0 0 28px', color: 'var(--text-1)' }}>
              Become your<br />
              <span style={{ color: 'var(--clay)', fontWeight: 300 }}>strongest self.</span>
            </h1>
            <p style={{
              fontSize: 19, color: 'var(--text-2)', maxWidth: 560,
              marginBottom: 40, lineHeight: 1.5, fontWeight: 400,
            }}>
              World-class coaching, an AI that adapts to your body, and a community
              that shows up — every day, wherever you train.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 28px', fontSize: 13, fontWeight: 600,
                borderRadius: 'var(--r-pill)',
                background: 'var(--accent)', color: '#fff',
                textDecoration: 'none', boxShadow: 'var(--shadow-ember)',
              }}>
                Start free for 14 days <span>&#8594;</span>
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '15px 24px', fontSize: 13, fontWeight: 500,
                borderRadius: 'var(--r-pill)',
                border: '1px solid rgba(245,237,224,0.22)',
                color: 'var(--text-1)', textDecoration: 'none',
              }}>
                Sign in
              </Link>
            </div>
            {/* Platform highlights */}
            <div style={{ display: 'flex', gap: 32, marginTop: 64, alignItems: 'center' }}>
              <SocialStat value="60+" label="Guided exercises" />
              <Divider />
              <SocialStat value="AI" label="Real-time coaching" />
              <Divider />
              <SocialStat value="3" label="Coach personalities" />
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{
        borderTop: '1px solid var(--stroke-1)', borderBottom: '1px solid var(--stroke-1)',
        overflow: 'hidden', padding: '32px 0', background: 'var(--bg-1, var(--bg-0))',
      }}>
        <div style={{
          display: 'flex', gap: 56, fontFamily: 'var(--font-display)',
          fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em',
          color: 'var(--text-3)', whiteSpace: 'nowrap',
          animation: 'v3-marquee 50s linear infinite',
        }}>
          {[...DISCIPLINES, ...DISCIPLINES, ...DISCIPLINES].map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 56 }}>
              <span>{t}</span>
              <span style={{ color: 'var(--accent)', fontSize: 8 }}>&#9670;</span>
            </span>
          ))}
        </div>
        <style>{`@keyframes v3-marquee{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}`}</style>
      </div>

      {/* Metrics bar */}
      <section style={{
        borderBottom: '1px solid var(--stroke-1)',
        padding: '56px 40px',
        display: 'flex', justifyContent: 'center', gap: 80,
      }}>
        {METRICS.map((m) => (
          <div key={m.label} style={{ textAlign: 'center' }}>
            <div className="v3-numeric" style={{ fontSize: 48, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
              {m.value}
            </div>
            <div className="v3-eyebrow" style={{ marginTop: 8 }}>{m.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" style={{
        padding: '96px 40px',
        maxWidth: 1440, margin: '0 auto',
      }}>
        <div className="v3-eyebrow" style={{ textAlign: 'center', marginBottom: 16, color: 'var(--accent-hot)' }}>
          Everything you need
        </div>
        <h2 className="v3-display-2" style={{ textAlign: 'center', marginBottom: 64 }}>
          Built for real athletes.
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              padding: 32, borderRadius: 'var(--r-md)',
              border: '1px solid var(--stroke-1)', background: 'var(--bg-1, rgba(255,255,255,0.03))',
            }}>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: 'var(--text-1)' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--stroke-1)',
        padding: '48px 40px',
      }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-3)' }}>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
            <Link href="/ai-disclaimer" style={{ color: 'inherit', textDecoration: 'none' }}>AI Disclaimer</Link>
          </div>
          <div className="v3-eyebrow" style={{ color: 'var(--text-3)', opacity: 0.5 }}>
            FitAI 2026. Powered by Claude AI.
          </div>
        </div>
      </footer>

      <style>{`
        @media(max-width:768px){
          .landing-nav-links{display:none!important}
          .landing-signin{display:none!important}
          .landing-hamburger{display:block!important}
        }
      `}</style>
    </div>
  );
}

function SocialStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="v3-numeric" style={{ fontSize: 18, color: 'var(--text-1)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 32, background: 'var(--stroke-2)' }} />;
}
