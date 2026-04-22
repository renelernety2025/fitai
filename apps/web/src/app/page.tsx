import Link from 'next/link';

const LIME = '#A8FF00';

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'AI Chat Coach',
    desc: 'Konverzace s AI trenérem kdykoliv potřebuješ radu.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title: 'Workout Journal',
    desc: 'Deník tréninků s AI analýzou trendů a pokroku.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: 'Food Recognition',
    desc: 'Vyfoť jídlo a AI rozpozná makra za tebe.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7" />
        <path d="M4 22h16" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
    title: 'Ligy a výzvy',
    desc: '7denní výzvy s přáteli a týdenní žebříčky.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Skill Tree',
    desc: 'Odemykej dovednosti a sleduj svůj fitness level.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    title: 'Workout Calendar',
    desc: 'Heatmapa tréninků a denních check-inů.',
  },
];

const STEPS = [
  { num: '01', title: 'Registruj se', desc: 'E-mail a heslo. Žádná kreditka.' },
  { num: '02', title: 'Nastav profil', desc: 'Cíle, zkušenosti, vybavení. 2 minuty.' },
  { num: '03', title: 'Začni trénovat', desc: 'AI vytvoří plán a koučuje tě v reálném čase.' },
];

const PRICING = [
  {
    name: 'Free',
    price: '0 Kč',
    period: 'navždy',
    features: ['Základní tracking', '5 AI chatů/den', 'Komunita', '60+ cviků s instrukcemi'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '199 Kč',
    period: '/měsíc',
    features: [
      'Neomezený AI chat',
      'Recepty a jídelníčky',
      'Workout journal',
      'Kalendář a statistiky',
      'Ligy a výzvy',
    ],
    highlight: true,
  },
  {
    name: 'Premium',
    price: '399 Kč',
    period: '/měsíc',
    features: [
      'Vše z Pro',
      'Prioritní AI coaching',
      'Krevní rozbory analýza',
      'Rehab programy',
      'Marketplace přístup',
    ],
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white antialiased">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(168, 255, 0, 0.06) 0%, rgba(0, 0, 0, 1) 60%)',
        }}
      />

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-sm font-bold tracking-tight">FitAI</div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-5 py-2.5 text-[13px] font-medium text-white/60 transition hover:text-white"
          >
            Přihlásit
          </Link>
          <Link
            href="/register"
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold text-black transition hover:opacity-90"
            style={{ backgroundColor: LIME }}
          >
            Začít zdarma
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
        <div
          className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: LIME }}
        >
          AI Personal Trainer
        </div>
        <h1
          className="mx-auto max-w-5xl font-bold tracking-tight text-white"
          style={{
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            letterSpacing: '-0.05em',
            lineHeight: 0.92,
          }}
        >
          Tvůj AI osobní trenér
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-white/55">
          Personalizované plány, real-time koučink, výživa a komunita.
          Vše poháněné umělou inteligencí. Zdarma.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 rounded-full px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105 hover:opacity-90"
            style={{ backgroundColor: LIME }}
          >
            Registrace zdarma
            <span className="transition group-hover:translate-x-1">-&gt;</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-10 py-5 text-base font-medium text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Vyzkoušet demo
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="mx-auto max-w-4xl px-6 pb-32">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white/40 sm:gap-10">
          <span>60+ cviků</span>
          <span className="hidden sm:inline" style={{ color: LIME }}>
            ·
          </span>
          <span>35+ funkcí</span>
          <span className="hidden sm:inline" style={{ color: LIME }}>
            ·
          </span>
          <span>AI coaching</span>
          <span className="hidden sm:inline" style={{ color: LIME }}>
            ·
          </span>
          <span>Zdarma</span>
        </div>
      </section>

      {/* Feature showcase */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="mb-12 text-center">
          <div
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: LIME }}
          >
            Funkce
          </div>
          <h2
            className="font-bold tracking-tight text-white"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.04em',
            }}
          >
            Všechno na jednom místě
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/8 p-7 transition hover:border-white/15"
            >
              <div className="mb-4" style={{ color: LIME }}>
                {f.icon}
              </div>
              <div className="mb-2 text-base font-semibold text-white">{f.title}</div>
              <div className="text-sm leading-relaxed text-white/45">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 pb-32">
        <div className="mb-12 text-center">
          <div
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: LIME }}
          >
            Jak to funguje
          </div>
          <h2
            className="font-bold tracking-tight text-white"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.04em',
            }}
          >
            3 kroky ke změně
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.num} className="text-center">
              <div
                className="mb-4 text-4xl font-black"
                style={{ color: LIME }}
              >
                {s.num}
              </div>
              <div className="mb-2 text-lg font-semibold text-white">{s.title}</div>
              <div className="text-sm text-white/45">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="mb-12 text-center">
          <div
            className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: LIME }}
          >
            Ceník
          </div>
          <h2
            className="font-bold tracking-tight text-white"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.04em',
            }}
          >
            Vyber si plán
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PRICING.map((p) => (
            <div
              key={p.name}
              className="relative rounded-2xl border p-8"
              style={{
                borderColor: p.highlight ? LIME : 'rgba(255,255,255,0.08)',
                boxShadow: p.highlight ? `0 0 40px ${LIME}20` : 'none',
              }}
            >
              {p.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-black"
                  style={{ backgroundColor: LIME }}
                >
                  Nejoblíbenější
                </div>
              )}
              <div className="mb-1 text-sm font-semibold text-white/50">{p.name}</div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{p.price}</span>
                <span className="text-sm text-white/30">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/55">
                    <span style={{ color: LIME }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 block rounded-full py-3 text-center text-sm font-semibold transition"
                style={
                  p.highlight
                    ? { backgroundColor: LIME, color: '#000' }
                    : { border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }
                }
              >
                {p.price === '0 Kč' ? 'Začít zdarma' : 'Vybrat plán'}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-white/25">
          Platby budou dostupné brzy. Aktuálně jsou všechny funkce zdarma.
        </p>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-32 text-center">
        <h2
          className="font-bold tracking-tight text-white"
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            letterSpacing: '-0.05em',
            lineHeight: 1,
          }}
        >
          Připraven začít?
        </h2>
        <p className="mt-6 text-base text-white/55">
          Bez kreditky. Bez závazku. 5 minut a jsi uvnitř.
        </p>
        <div className="mt-10">
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 rounded-full px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105 hover:opacity-90"
            style={{ backgroundColor: LIME }}
          >
            Vytvořit účet zdarma
            <span className="transition group-hover:translate-x-1">-&gt;</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6">
          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/privacy" className="transition hover:text-white/50">
              Ochrana soukromí
            </Link>
            <Link href="/terms" className="transition hover:text-white/50">
              Podmínky
            </Link>
            <Link href="/ai-disclaimer" className="transition hover:text-white/50">
              AI Disclaimer
            </Link>
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/20">
            FitAI 2026. Powered by Claude AI.
          </div>
        </div>
      </footer>
    </div>
  );
}
