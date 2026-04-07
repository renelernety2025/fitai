'use client';

import Link from 'next/link';

export default function LandingV2Page() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white antialiased">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(255, 55, 95, 0.08) 0%, rgba(0, 0, 0, 1) 60%)',
        }}
      />

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-sm font-bold tracking-tight">FitAI</div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login-v2"
            className="rounded-full px-5 py-2.5 text-[13px] font-medium text-white/60 transition hover:text-white"
          >
            Přihlásit
          </Link>
          <Link
            href="/register-v2"
            className="rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition hover:bg-white/90"
          >
            Začít zdarma
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-32 pt-24 text-center">
        <div className="mb-6 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
          AI fitness coach
        </div>
        <h1
          className="mx-auto max-w-4xl font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(3rem, 9vw, 8rem)', letterSpacing: '-0.05em', lineHeight: 0.92 }}
        >
          Trénink, který tě<br />opravdu sleduje.
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-white/55">
          Real-time pose detection. AI plány. Výživa. Lekce. Tvůj výkon a regenerace na jednom místě —
          zdarma.
        </p>
        <div className="mt-12">
          <Link
            href="/register-v2"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105 hover:bg-white/90"
          >
            Začít zdarma
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-3">
          {[
            {
              color: '#FF375F',
              kicker: 'Pose detection',
              title: 'Vidí tě.',
              body: 'MediaPipe sleduje 33 bodů těla a opravuje tvojí formu v reálném čase. Jako trenér za zády.',
            },
            {
              color: '#A8FF00',
              kicker: 'AI plány',
              title: 'Učí se s tebou.',
              body: 'Plán generovaný Claude AI podle tvé úrovně, regenerace, slabých míst a cílů. Mění se každý týden.',
            },
            {
              color: '#00E5FF',
              kicker: 'Holisticky',
              title: 'Vše v jednom.',
              body: 'Trénink, výživa, vzdělání, regenerace, komunita. Jeden systém. Žádné zbytečné aplikace.',
            },
          ].map((p) => (
            <div key={p.title}>
              <div
                className="mb-6 h-2 w-12 rounded-full"
                style={{ background: p.color, boxShadow: `0 0 16px ${p.color}` }}
              />
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                {p.kicker}
              </div>
              <h2
                className="mb-4 font-bold tracking-tight text-white"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.04em' }}
              >
                {p.title}
              </h2>
              <p className="text-sm leading-relaxed text-white/55">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-32 text-center">
        <h2
          className="font-bold tracking-tight text-white"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.05em', lineHeight: 1 }}
        >
          Připraven začít?
        </h2>
        <p className="mt-6 text-base text-white/55">
          Bez kreditky. Bez závazku. 5 minut a jsi uvnitř.
        </p>
        <div className="mt-10">
          <Link
            href="/register-v2"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-base font-semibold tracking-tight text-black transition hover:scale-105"
          >
            Vytvořit účet zdarma
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/8 py-12 text-center text-[10px] font-semibold uppercase tracking-[0.4em] text-white/20">
        FitAI · Designed for performance
      </footer>
    </div>
  );
}
