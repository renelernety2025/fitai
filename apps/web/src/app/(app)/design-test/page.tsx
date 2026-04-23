'use client';

import Link from 'next/link';
import { useState } from 'react';

const ORANGE = '#E8622A';
const CREAM = '#F5E6D3';
const CHARCOAL = '#1C1C1C';
const WARM_BLACK = '#141414';

const faqItems = [
  { q: 'Jak funguje AI coaching?', a: 'Claude AI analyzuje tvoji formu v reálném čase a dává ti personalizované tipy česky.' },
  { q: 'Potřebuji speciální vybavení?', a: 'Ne. FitAI funguje s kamerou telefonu nebo laptopu. Žádné senzory, žádné wearables.' },
  { q: 'Je to zdarma?', a: 'Základní verze ano. Pro plán zahrnuje AI coaching, meal plány a neomezené analýzy.' },
  { q: 'Jak přesná je detekce formy?', a: 'MediaPipe + AI dosahuje 94% přesnosti na hlavních compound cvicích.' },
];

export default function DesignTestPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: ORANGE, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
        .bento-grid { display: grid; gap: 12px; padding: 12px; max-width: 1200px; margin: 0 auto; }
        .card { border-radius: 20px; overflow: hidden; position: relative; }
        .card-dark { background: ${CHARCOAL}; color: white; }
        .card-cream { background: ${CREAM}; color: ${CHARCOAL}; }
        .card-orange { background: ${ORANGE}; color: white; border: 2px solid rgba(255,255,255,0.2); }
        .card-warm { background: ${WARM_BLACK}; color: white; }
        .serif { font-family: 'Playfair Display', Georgia, serif; }
        .card-hover { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .resource-row { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); cursor: pointer; transition: background 0.2s; }
        .resource-row:hover { background: rgba(255,255,255,0.05); }
        .resource-row:last-child { border-bottom: none; }
        .resource-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .faq-item { border-bottom: 1px solid rgba(0,0,0,0.1); }
        .faq-q { padding: 18px 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-weight: 500; font-size: 15px; }
        .faq-a { overflow: hidden; transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s; }
        .photo-card { background-size: cover; background-position: center; }
        .stat-num { font-size: clamp(3rem, 8vw, 5rem); font-weight: 900; line-height: 1; letter-spacing: -0.03em; }
        .tag { display: inline-block; padding: 6px 16px; border-radius: 30px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .newsletter-input { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px 18px; color: white; font-size: 14px; width: 100%; outline: none; transition: border-color 0.2s; }
        .newsletter-input::placeholder { color: rgba(255,255,255,0.4); }
        .newsletter-input:focus { border-color: ${ORANGE}; }
        .cta-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 30px; font-weight: 600; font-size: 14px; cursor: pointer; border: none; transition: transform 0.2s, box-shadow 0.2s; }
        .cta-btn:hover { transform: scale(1.03); }
        .cta-btn:active { transform: scale(0.98); }
        @media (min-width: 768px) {
          .bento-grid { grid-template-columns: repeat(4, 1fr); grid-auto-rows: minmax(120px, auto); }
          .span-2 { grid-column: span 2; }
          .span-3 { grid-column: span 3; }
          .span-4 { grid-column: span 4; }
          .row-2 { grid-row: span 2; }
          .row-3 { grid-row: span 3; }
        }
        @media (max-width: 767px) {
          .bento-grid { grid-template-columns: 1fr 1fr; }
          .span-2, .span-3, .span-4 { grid-column: span 2; }
          .row-2, .row-3 { grid-row: span 1; }
        }
      `}</style>

      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: CHARCOAL, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ORANGE, fontWeight: 900, fontSize: 16 }}>F</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL }}>FitAI</span>
        </div>
        <nav style={{ display: 'flex', gap: 24, fontSize: 14, fontWeight: 500, color: CHARCOAL }}>
          <Link href="/dashboard" style={{ color: CHARCOAL, textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/exercises" style={{ color: CHARCOAL, textDecoration: 'none' }}>Cviky</Link>
          <Link href="/ai-chat" style={{ color: CHARCOAL, textDecoration: 'none' }}>AI Coach</Link>
        </nav>
      </header>

      {/* Bento Grid */}
      <div className="bento-grid">

        {/* Hero — dark, big text */}
        <div className="card card-dark span-2 row-2 card-hover" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="tag" style={{ background: ORANGE, color: 'white', marginBottom: 16 }}>AI Personal Trainer</span>
            <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.05, marginTop: 16, letterSpacing: '-0.02em' }}>
              Trénink, který tě<br />
              <span style={{ color: ORANGE, fontStyle: 'italic' }}>opravdu sleduje.</span>
            </h1>
          </div>
          <div style={{ marginTop: 24 }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
              Real-time pose detection. Personalizovaný AI coach. Výsledky, které vidíš.
            </p>
            <Link href="/register">
              <button className="cta-btn" style={{ background: ORANGE, color: 'white', marginTop: 20 }}>
                Začít zdarma <span style={{ fontSize: 18 }}>→</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Stats card */}
        <div className="card card-cream card-hover" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.4)' }}>Aktivní uživatelé</span>
          <div className="stat-num serif" style={{ color: CHARCOAL }}>2K+</div>
          <span className="tag" style={{ background: CHARCOAL, color: CREAM, alignSelf: 'flex-start' }}>Rosteme</span>
        </div>

        {/* Photo card */}
        <div className="card photo-card row-2 card-hover" style={{
          backgroundImage: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8))',
          backgroundColor: '#2a2a2a',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px 20px', minHeight: 280
        }}>
          <span className="serif" style={{ color: 'white', fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
            &ldquo;Za 3 měsíce jsem přidal 15kg na bench.&rdquo;
          </span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 }}>— Martin K., Praha</span>
        </div>

        {/* Resources */}
        <div className="card card-dark span-2 card-hover" style={{ padding: 0 }}>
          <div style={{ padding: '20px 20px 8px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>Funkce</div>
          <div className="resource-row">
            <div className="resource-icon" style={{ background: ORANGE }}>🎯</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Pose Detection</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Real-time analýza formy</div>
            </div>
          </div>
          <div className="resource-row">
            <div className="resource-icon" style={{ background: '#2d7d46' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>AI Coach</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Claude Haiku v češtině</div>
            </div>
          </div>
          <div className="resource-row">
            <div className="resource-icon" style={{ background: '#8B5CF6' }}>📊</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Progress Tracking</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>XP, streaky, ligy</div>
            </div>
          </div>
          <div className="resource-row">
            <div className="resource-icon" style={{ background: '#E84393' }}>🍽️</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Nutrition AI</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Jídelníček + food scanner</div>
            </div>
          </div>
        </div>

        {/* Quote block */}
        <div className="card card-warm span-2 card-hover" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: ORANGE, marginBottom: 12 }}>Naše mise</span>
          <blockquote className="serif" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 400, lineHeight: 1.35, fontStyle: 'italic', margin: 0, color: CREAM }}>
            &ldquo;Dnes trénuje s AI přes <span style={{ color: ORANGE, fontWeight: 700 }}>2 000 lidí</span>. Doufáme, že se přidáš i ty.&rdquo;
          </blockquote>
          <Link href="/register">
            <button className="cta-btn" style={{ background: ORANGE, color: 'white', marginTop: 20, fontSize: 13 }}>
              Vyzkoušet FitAI
            </button>
          </Link>
        </div>

        {/* Stats 2 */}
        <div className="card card-cream card-hover" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.4)' }}>Cviky v knihovně</span>
          <div className="stat-num serif" style={{ color: CHARCOAL }}>60+</div>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>S 3D animací a coaching hints</span>
        </div>

        {/* Newsletter card */}
        <div className="card card-dark card-hover" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Zůstaň v obraze!</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Novinky a tipy 1× měsíčně.</p>
          <input className="newsletter-input" placeholder="Tvůj email" type="email" />
        </div>

        {/* Photo card 2 */}
        <div className="card photo-card card-hover" style={{
          backgroundImage: 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85))',
          backgroundColor: '#333',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px 18px', minHeight: 200
        }}>
          <span className="serif" style={{ color: 'white', fontSize: 16, fontWeight: 700 }}>AI Form Check</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>Nahraj video → analýza</span>
        </div>

        {/* Sponsors / Partners */}
        <div className="card card-dark span-2 card-hover" style={{ padding: '24px 28px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 16, display: 'block' }}>Postaveno na</span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            {['Claude AI', 'ElevenLabs', 'MediaPipe', 'AWS', 'Next.js'].map(t => (
              <span key={t} style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="card card-cream span-2 row-2 card-hover" style={{ padding: '32px 28px' }}>
          <h3 className="serif" style={{ fontSize: 26, fontWeight: 900, marginBottom: 4, color: CHARCOAL }}>Časté otázky</h3>
          <div style={{ marginTop: 12 }}>
            {faqItems.map((item, i) => (
              <div key={i} className="faq-item">
                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{item.q}</span>
                  <span style={{ fontSize: 20, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                </div>
                <div className="faq-a" style={{ maxHeight: openFaq === i ? 120 : 0, opacity: openFaq === i ? 1 : 0 }}>
                  <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', lineHeight: 1.6, paddingBottom: 16 }}>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature highlight */}
        <div className="card card-warm span-2 card-hover" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>Nové</span>
            <h3 className="serif" style={{ fontSize: 28, fontWeight: 900, marginTop: 14, lineHeight: 1.1, color: CREAM }}>
              Rhythm of<br />your Gains
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginTop: 16 }}>
            Duely 1v1. Squads. Ligy. Sezónní battle pass. Protože fitness je víc než jen čísla.
          </p>
        </div>

        {/* CTA final */}
        <div className="card span-4 card-hover" style={{
          background: `linear-gradient(135deg, ${CHARCOAL} 0%, #2a1810 100%)`,
          padding: '48px 36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}>
          <div>
            <h2 className="serif" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
              Připraven na změnu?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 }}>
              Začni trénovat s AI ještě dnes. Zdarma, bez závazků.
            </p>
          </div>
          <Link href="/register">
            <button className="cta-btn" style={{ background: ORANGE, color: 'white', fontSize: 16, padding: '18px 36px' }}>
              Začít zdarma <span style={{ fontSize: 20 }}>→</span>
            </button>
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', textAlign: 'center', fontSize: 12, color: CHARCOAL, opacity: 0.5 }}>
        FitAI 2026 · Powered by Claude AI · <Link href="/privacy" style={{ color: CHARCOAL }}>Privacy</Link> · <Link href="/terms" style={{ color: CHARCOAL }}>Terms</Link>
      </footer>
    </div>
  );
}
