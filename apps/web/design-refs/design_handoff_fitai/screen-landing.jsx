// FIT_AI — Landing page (v1 · cinematic, restored with inclusive imagery)
// Direction: bold cinematic hero · Inter Tight display · ember accent
// Tone: aspirational but accessible — "Become your strongest self"
// Imagery: woman running outdoor as primary, diverse coach mix

const Landing = () => {
  return (
    <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100%' }}>
      <LandingNav />
      <LandingHero />
      <LandingMarquee />
      <LandingCoaches />
      <LandingFeatureGrid />
      <LandingMetrics />
      <LandingPricing />
      <LandingFooter />
    </div>
  );
};

// ── NAV ─────────────────────────────────────────────────────
const LandingNav = () => (
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
      <Logo size={20} />
      <div style={{ display: 'flex', gap: 36, fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
        <span>Train</span>
        <span>Coaches</span>
        <span>Programs</span>
        <span>Community</span>
        <span>Pricing</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Sign in</span>
        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 12 }}>
          Start free
        </button>
      </div>
    </div>
  </div>
);

// ── HERO ────────────────────────────────────────────────────
const LandingHero = () => (
  <div style={{ position: 'relative', minHeight: 820, overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `url(${IMG.heroLift})`,
      backgroundSize: 'cover', backgroundPosition: 'center 35%',
      filter: 'saturate(0.85) contrast(1.05) brightness(0.92)',
    }}/>
    {/* Warm vignette + readability gradient */}
    <div style={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at 70% 35%, rgba(232,93,44,0.10) 0%, transparent 55%), linear-gradient(180deg, rgba(11,9,7,0.35) 0%, rgba(11,9,7,0.55) 55%, var(--bg-0) 100%)',
    }}/>
    <div style={{ position: 'absolute', inset: 0,
      background: 'linear-gradient(90deg, rgba(11,9,7,0.78) 0%, rgba(11,9,7,0.35) 45%, transparent 75%)',
    }}/>

    {/* Content */}
    <div style={{
      position: 'relative', zIndex: 2, minHeight: 820,
      maxWidth: 1440, margin: '0 auto', padding: '0 40px',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      paddingBottom: 96, paddingTop: 120,
    }}>
      <div style={{ maxWidth: 780 }}>
        <div className="eyebrow" style={{ marginBottom: 24, color: 'var(--accent-hot)' }}>
          ◆ Spring 2026 — Now in 142 countries
        </div>
        <h1 className="display-1" style={{ margin: 0, marginBottom: 28, color: 'var(--text-1)' }}>
          Become your<br/>
          <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>strongest self.</span>
        </h1>
        <p style={{ fontSize: 19, color: 'var(--text-2)', maxWidth: 560, marginBottom: 40, lineHeight: 1.5, fontWeight: 400 }}>
          World-class coaching, an AI that adapts to your body, and a community
          that shows up — every day, wherever you train.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn-primary" style={{ padding: '16px 28px', fontSize: 13 }}>
            Start free for 14 days
            <span style={{ fontSize: 14 }}>→</span>
          </button>
          <button className="btn-outline" style={{ padding: '15px 24px', fontSize: 13, color: 'var(--text-1)', borderColor: 'rgba(245,237,224,0.22)' }}>
            <span style={{ fontSize: 11 }}>▶</span> Watch the film
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>1:42</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 64, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AvatarStack avatars={[IMG.userAvi1, IMG.userAvi2, IMG.userAvi3, IMG.userAvi4, IMG.userAvi5]} size={32} />
            <div>
              <div className="numeric-display" style={{ fontSize: 18, color: 'var(--text-1)' }}>2.4M</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Members training</div>
            </div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--stroke-2)' }}/>
          <div>
            <div className="numeric-display" style={{ fontSize: 18, color: 'var(--text-1)' }}>4.9</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>App Store · 89K reviews</div>
          </div>
          <div style={{ width: 1, height: 32, background: 'var(--stroke-2)' }}/>
          <div>
            <div className="numeric-display" style={{ fontSize: 18, color: 'var(--text-1)' }}>180</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Coaches in residence</div>
          </div>
        </div>
      </div>
    </div>

    {/* Floating "today" card — softened, accessible metrics */}
    <div style={{
      position: 'absolute', right: 48, top: 168, zIndex: 3,
      width: 320, padding: 22, borderRadius: 'var(--r-lg)',
      background: 'rgba(20,17,13,0.78)',
      backdropFilter: 'blur(28px) saturate(140%)',
      border: '1px solid var(--stroke-2)',
      boxShadow: 'var(--shadow-pop)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span className="eyebrow" style={{ color: 'var(--sage)' }}>● Live · 14:32</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Sara — morning run</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>3 of 5 km complete</div>
      <div className="title" style={{ marginBottom: 14, fontSize: 18 }}>Easy zone 2 · 5 km</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Pace</div>
          <div className="numeric-display" style={{ fontSize: 22, color: 'var(--text-1)' }}>5:42<span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 3 }}>/km</span></div>
          <div style={{ fontSize: 10, color: 'var(--sage)', marginTop: 2 }}>↑ 8s faster than last week</div>
        </div>
        <div style={{ width: 1, background: 'var(--stroke-1)' }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Effort</div>
          <div className="numeric-display" style={{ fontSize: 22, color: 'var(--text-1)' }}>Easy</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>just right</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--stroke-1)', paddingTop: 12, display: 'flex', gap: 6 }}>
        {[1,1,1,0.6,0].map((v, idx) => (
          <div key={idx} style={{ flex: 1 }}>
            <div style={{ height: 3, background: 'var(--bg-3)', borderRadius: 2, marginBottom: 6, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${v*100}%`, background: v >= 1 ? 'var(--accent)' : 'var(--accent)', opacity: v >= 1 ? 0.9 : 0.5, borderRadius: 2 }}/>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.04em' }}>KM {idx+1}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── MARQUEE STRIP — accessible mix ──────────────────────────
const LandingMarquee = () => {
  const items = ['Walking', 'Running', 'Yoga', 'Strength', 'Mobility', 'Pilates', 'HIIT', 'Cycling', 'Recovery', 'Breathwork', 'Stretching', 'Endurance'];
  return (
    <div style={{
      borderTop: '1px solid var(--stroke-1)', borderBottom: '1px solid var(--stroke-1)',
      overflow: 'hidden', padding: '32px 0',
      background: 'var(--bg-1)',
    }}>
      <div style={{
        display: 'flex', gap: 56, fontFamily: 'var(--font-display)',
        fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em',
        color: 'var(--text-3)', whiteSpace: 'nowrap',
        animation: 'marquee 50s linear infinite',
      }}>
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 56 }}>
            <span>{t}</span>
            <span style={{ color: 'var(--accent)', fontSize: 8 }}>◆</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
    </div>
  );
};

// ── COACHES (Faculty grid — diverse mix) ────────────────────
const COACHES = [
  { name: 'Sara Lindqvist', discipline: 'Running · Marathon',     img: IMG.coachAri,    tag: 'Featured' },
  { name: 'Maya Sato',      discipline: 'Strength · Hypertrophy',  img: IMG.coachMaya,   tag: 'New course' },
  { name: 'Kai Bergman',    discipline: 'Yoga · Mobility',         img: IMG.coachKai,    tag: null },
  { name: 'Diane Whittaker',discipline: 'Pilates · Method',        img: IMG.coachLena,   tag: 'Live this week' },
  { name: 'Julien Marsh',   discipline: 'Trail · Endurance',       img: IMG.coachJulien, tag: null },
  { name: 'Elena Rossi',    discipline: 'Walking · Outdoor',       img: IMG.coachAlex,   tag: null },
];

const LandingCoaches = () => (
  <div style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--stroke-1)', borderBottom: '1px solid var(--stroke-1)' }}>
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
        <div style={{ maxWidth: 720 }}>
          <div className="eyebrow" style={{ marginBottom: 16, color: 'var(--accent-hot)' }}>The faculty</div>
          <h2 className="display-2" style={{ margin: 0 }}>
            Coaches who meet you<br/>
            <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>where you are.</span>
          </h2>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-2)', borderBottom: '1px solid var(--stroke-2)', paddingBottom: 4 }}>
          Browse all 180 coaches →
        </span>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
      }}>
        {COACHES.map((c, i) => (
          <div key={i} style={{
            position: 'relative', height: i === 0 ? 600 : i === 3 ? 600 : 400,
            gridRow: i === 0 || i === 3 ? 'span 2' : 'span 1',
            borderRadius: 'var(--r-md)', overflow: 'hidden',
            background: 'var(--bg-2)', cursor: 'pointer',
          }}>
            <img src={c.img} alt={c.name} style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: 'saturate(0.85) contrast(1.04) brightness(0.95)',
              transition: 'transform 1.2s cubic-bezier(.2,.8,.2,1)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 35%, rgba(11,9,7,0.65) 80%, rgba(11,9,7,0.92) 100%)',
              pointerEvents: 'none',
            }}/>
            {c.tag && (
              <div style={{
                position: 'absolute', top: 18, left: 18,
                padding: '5px 11px', borderRadius: 999,
                background: c.tag === 'Live this week' ? 'var(--accent)' : 'rgba(20,17,13,0.7)',
                backdropFilter: c.tag !== 'Live this week' ? 'blur(8px)' : 'none',
                fontSize: 10, fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: c.tag === 'Live this week' ? '#fff' : 'var(--text-1)',
                border: c.tag !== 'Live this week' ? '1px solid var(--stroke-2)' : 'none',
              }}>
                {c.tag === 'Live this week' && '● '}{c.tag}
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, padding: 26,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(245,237,224,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{c.discipline}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: i === 0 || i === 3 ? 38 : 24, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{c.name}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(245,237,224,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>↗</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── FEATURE GRID (Apple-Music modular) ──────────────────────
const LandingFeatureGrid = () => (
  <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 40px 100px' }}>
    <div style={{ marginBottom: 56 }}>
      <div className="eyebrow" style={{ marginBottom: 16, color: 'var(--accent-hot)' }}>What's inside</div>
      <h2 className="display-2" style={{ margin: 0, maxWidth: 760 }}>
        One membership.<br/>
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>Everything you need.</span>
      </h2>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, gridAutoRows: 240 }}>
      {/* AI Coach — 4-wide */}
      <Card padding={36} style={{
        gridColumn: 'span 4', gridRow: 'span 2',
        background: 'linear-gradient(145deg, #1a0d05 0%, var(--bg-card) 65%)',
        border: '1px solid rgba(232,93,44,0.18)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -120, top: -120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,93,44,0.32) 0%, transparent 65%)' }}/>
        <div style={{ position: 'relative' }}>
          <div className="eyebrow" style={{ color: 'var(--accent-hot)', marginBottom: 18 }}>◆ AI coach</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 52, lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 22, maxWidth: 540, color: 'var(--text-1)' }}>
            Personal training,<br/>
            <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 400 }}>at your pace.</span>
          </div>
          <p className="body" style={{ maxWidth: 480, fontSize: 15 }}>
            Real-time form correction. A plan that adapts to your sleep, soreness, and schedule. Encouragement that knows when to push and when to hold back.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Form check','Adaptive plan','Voice coaching','Auto-progression','Recovery sync'].map(t => (
              <span key={t} style={{ padding: '7px 14px', borderRadius: 999, background: 'rgba(232,93,44,0.10)', border: '1px solid rgba(232,93,44,0.25)', fontSize: 11, color: 'var(--accent-hot)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{t}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card padding={24} style={{ gridColumn: 'span 2', gridRow: 'span 1' }}>
        <div className="eyebrow">Calendar</div>
        <div className="title" style={{ fontSize: 22, marginTop: 8, marginBottom: 16 }}>Your year in blocks.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: 35 }).map((_, i) => {
            const intensity = [0, 0, 1, 2, 0, 3, 4, 1, 0, 2, 3, 4, 5, 0, 0, 2, 3, 1, 4, 5, 0, 1, 2, 3, 0, 4, 0, 0, 2, 3, 4, 1, 0, 0, 0][i];
            return <div key={i} style={{ aspectRatio: '1', borderRadius: 3, background: `var(--d-${Math.max(1, intensity)})`, opacity: intensity === 0 ? 0.4 : 1 }}/>;
          })}
        </div>
      </Card>

      {/* Metrics */}
      <Card padding={24} style={{ gridColumn: 'span 2', gridRow: 'span 1' }}>
        <div className="eyebrow">Progress</div>
        <div className="title" style={{ fontSize: 22, marginTop: 8, marginBottom: 16 }}>See yourself improve.</div>
        <Sparkline data={[12, 18, 14, 22, 19, 28, 24, 32, 30, 38, 34, 42]} width={220} height={60} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>12 weeks</span>
          <span style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 600 }}>↑ +248%</span>
        </div>
      </Card>

      {/* Live classes */}
      <Card padding={0} style={{ gridColumn: 'span 3', gridRow: 'span 1', overflow: 'hidden', position: 'relative', minHeight: 240 }}>
        <img src={IMG.actionYoga} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, filter: 'saturate(0.75)' }}/>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--bg-card) 0%, rgba(20,17,13,0.4) 100%)' }}/>
        <div style={{ position: 'relative', padding: 32, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--sage)', marginBottom: 12 }}>● Now in session</div>
            <div className="title" style={{ fontSize: 32, lineHeight: 1.08, maxWidth: 340 }}>
              Move with 40,000 others. <span style={{ color: 'var(--clay)', fontStyle: 'italic' }}>Right now.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" style={{ padding: '10px 18px', fontSize: 12 }}>▶ Join live</button>
            <button className="btn-outline" style={{ padding: '10px 18px', fontSize: 12 }}>See schedule</button>
          </div>
        </div>
      </Card>

      {/* Community */}
      <Card padding={24} style={{ gridColumn: 'span 3', gridRow: 'span 1' }}>
        <div className="eyebrow">Community</div>
        <div className="title" style={{ fontSize: 22, marginTop: 8, marginBottom: 18 }}>
          Train with friends. <span style={{ color: 'var(--clay)', fontStyle: 'italic' }}>Cheer each other on.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <AvatarStack avatars={[IMG.userAvi1, IMG.userAvi2, IMG.userAvi3, IMG.userAvi4, IMG.userAvi5, IMG.userAvi6]} size={36} max={5} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Squad rank</div>
            <div className="numeric-display" style={{ fontSize: 26, color: 'var(--text-1)' }}>3<span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 6 }}>of 1,420</span></div>
          </div>
          <Ring value={72} size={56} stroke={4} label="72%" sub="W4" />
        </div>
      </Card>
    </div>
  </div>
);

// ── METRICS BAR ─────────────────────────────────────────────
const LandingMetrics = () => (
  <div style={{ borderTop: '1px solid var(--stroke-1)', borderBottom: '1px solid var(--stroke-1)' }}>
    <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {[
        { v: '2.4M', label: 'Active members', sub: 'In 142 countries' },
        { v: '184M', label: 'Sessions completed', sub: 'And counting' },
        { v: '92%', label: 'Stay 90+ days', sub: 'Industry leading' },
        { v: '4.9', label: 'App Store', sub: '89,420 reviews' },
      ].map((m, i) => (
        <div key={i} style={{ padding: '64px 40px', borderRight: i < 3 ? '1px solid var(--stroke-1)' : 'none' }}>
          <div className="numeric-display" style={{ fontSize: 64, marginBottom: 14, color: 'var(--text-1)' }}>{m.v}</div>
          <div style={{ fontSize: 14, color: 'var(--text-1)', marginBottom: 4, fontWeight: 600 }}>{m.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.sub}</div>
        </div>
      ))}
    </div>
  </div>
);

// ── PRICING ─────────────────────────────────────────────────
const LandingPricing = () => (
  <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 40px' }}>
    <div style={{ textAlign: 'center', marginBottom: 64 }}>
      <div className="eyebrow" style={{ marginBottom: 16, color: 'var(--accent-hot)' }}>Membership</div>
      <h2 className="display-2" style={{ margin: '0 auto', maxWidth: 720 }}>
        Less than a single<br/>
        <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>personal training session.</span>
      </h2>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, maxWidth: 1140, margin: '0 auto' }}>
      {[
        { name: 'Free', price: '0', period: '14 days, no card', accent: false, perks: ['Full member access','Cancel anytime','No credit card','Welcome session with a coach'] },
        { name: 'Member', price: '14.99', period: 'per month', accent: true, perks: ['Unlimited training','All 180 coaches','AI form check','Adaptive plan','Live classes daily','Apple Health · Garmin · Whoop'] },
        { name: 'Family', price: '24.99', period: 'per month · up to 6', accent: false, perks: ['Everything in Member','Family management','Shared challenges','Family leaderboard','Priority coach replies'] },
      ].map((p, i) => (
        <Card key={i} padding={36} style={{
          background: p.accent ? 'linear-gradient(180deg, #1a0d05 0%, var(--bg-card) 70%)' : 'var(--bg-card)',
          border: p.accent ? '1px solid rgba(232,93,44,0.32)' : '1px solid var(--stroke-1)',
          position: 'relative', overflow: 'hidden',
        }}>
          {p.accent && (
            <div style={{
              position: 'absolute', top: 24, right: 24,
              padding: '4px 11px', borderRadius: 999,
              background: 'var(--accent)',
              fontSize: 10, color: '#fff', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Most popular
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0 6px' }}>
            <span className="numeric-display" style={{ fontSize: 64, color: 'var(--text-1)' }}>${p.price}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 32 }}>{p.period}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {p.perks.map((perk, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 14, color: 'var(--text-2)' }}>
                <span style={{ color: p.accent ? 'var(--accent)' : 'var(--sage)', fontSize: 11, transform: 'translateY(-1px)' }}>✓</span>
                {perk}
              </div>
            ))}
          </div>
          <button
            className={p.accent ? 'btn-primary' : 'btn-outline'}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 13 }}
          >
            {p.name === 'Free' ? 'Start free' : p.name === 'Member' ? 'Start 14-day trial' : 'Set up family'}
          </button>
        </Card>
      ))}
    </div>
  </div>
);

// ── FOOTER ──────────────────────────────────────────────────
const LandingFooter = () => (
  <div style={{ borderTop: '1px solid var(--stroke-1)', padding: '72px 40px 40px', background: 'var(--bg-1)' }}>
    <div style={{ maxWidth: 1440, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
        <div>
          <Logo size={22} />
          <p className="body" style={{ marginTop: 20, maxWidth: 320, fontSize: 14 }}>
            Coaching for every body, every level, every day. Welcome.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn-outline" style={{ padding: '10px 18px', fontSize: 12 }}> App Store</button>
            <button className="btn-outline" style={{ padding: '10px 18px', fontSize: 12 }}>▶ Google Play</button>
          </div>
        </div>
        {[
          { h: 'Train', items: ['Programs','Live classes','Coaches','AI Coach','Recovery'] },
          { h: 'Community', items: ['Feed','Squads','Challenges','Leaderboards'] },
          { h: 'Studio', items: ['About','Coaches','Press','Journal'] },
          { h: 'Support', items: ['Help center','Contact','Privacy','Terms'] },
        ].map((col, i) => (
          <div key={i}>
            <div className="eyebrow" style={{ marginBottom: 18 }}>{col.h}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {col.items.map(item => (
                <span key={item} style={{ fontSize: 13, color: 'var(--text-2)' }}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--stroke-1)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
        <span>© 2026 FIT_AI Studio. Built for everyone.</span>
        <span>v4.2 · build 28104</span>
      </div>
    </div>
  </div>
);

window.Landing = Landing;
