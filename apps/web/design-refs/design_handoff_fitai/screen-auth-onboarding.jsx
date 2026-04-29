// FIT_AI — Auth + Onboarding flows
// Login · Register · Onboarding (5 steps)

// ── LOGIN ──────────────────────────────────────────────────
const Login = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100%', background: 'var(--bg-0)' }}>
    {/* Left — image */}
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <img src={IMG.heroLift} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) brightness(0.9)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,9,7,0.3) 0%, rgba(11,9,7,0.7) 100%)' }}/>
      <div style={{ position: 'absolute', inset: 0, padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Logo size={22} />
        <div>
          <div className="eyebrow" style={{ marginBottom: 16, color: 'var(--accent-hot)' }}>◆ Welcome back</div>
          <div className="display-2" style={{ maxWidth: 480 }}>
            Today's training<br/>
            <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>is waiting for you.</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Photo · Sara, member since 2024</div>
      </div>
    </div>

    {/* Right — form */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 56 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1 className="display-3" style={{ marginBottom: 8 }}>Sign in</h1>
        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 36 }}>New here? <span style={{ color: 'var(--accent-hot)', fontWeight: 600 }}>Start free →</span></p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <Input label="Email" placeholder="sara@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, fontSize: 12 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-2)' }}>
            <span style={{ width: 16, height: 16, border: '1px solid var(--stroke-3)', borderRadius: 4, background: 'var(--bg-2)' }}/>
            Remember me
          </label>
          <span style={{ color: 'var(--text-2)' }}>Forgot password?</span>
        </div>

        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 14 }}>
          Sign in →
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--stroke-1)' }}/>
          <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--stroke-1)' }}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 13 }}> Continue with Apple</button>
          <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '12px 0', fontSize: 13 }}>G Continue with Google</button>
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
          By signing in you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  </div>
);

const Input = ({ label, type = 'text', placeholder }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{label}</label>
    <input type={type} placeholder={placeholder} style={{
      width: '100%', height: 48, padding: '0 16px',
      background: 'var(--bg-2)', border: '1px solid var(--stroke-2)',
      borderRadius: 10, color: 'var(--text-1)', fontSize: 14,
      fontFamily: 'inherit', outline: 'none',
    }}/>
  </div>
);

// ── ONBOARDING — full flow on one canvas ────────────────────
const Onboarding = () => {
  const steps = [
    { n: 1, label: 'Welcome', current: true, done: false },
    { n: 2, label: 'Your goal', current: false, done: false },
    { n: 3, label: 'Experience', current: false, done: false },
    { n: 4, label: 'Schedule', current: false, done: false },
    { n: 5, label: 'Profile', current: false, done: false },
  ];

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100%', padding: 0 }}>
      {/* Top progress bar */}
      <div style={{ padding: '24px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--stroke-1)' }}>
        <Logo size={20} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: s.current ? 'var(--accent)' : s.done ? 'var(--sage)' : 'var(--bg-3)',
                color: s.current || s.done ? '#fff' : 'var(--text-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)',
              }}>{s.done ? '✓' : s.n}</div>
              {i < steps.length - 1 && <div style={{ width: 32, height: 1, background: 'var(--stroke-2)' }}/>}
            </React.Fragment>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Step 2 of 5 · Skip</span>
      </div>

      {/* Step content — Goal selection */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '80px 40px' }}>
        <div className="eyebrow" style={{ color: 'var(--accent-hot)', marginBottom: 16, textAlign: 'center' }}>◆ Step 2 — Your goal</div>
        <h1 className="display-2" style={{ textAlign: 'center', marginBottom: 16 }}>
          What brings you<br/>
          <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>here today?</span>
        </h1>
        <p style={{ textAlign: 'center', fontSize: 16, color: 'var(--text-2)', marginBottom: 56, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          We'll tailor your plan, your coach, and your home screen around this. You can always change it.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            { icon: '🌅', title: 'Move every day', sub: 'Walks, stretches, light cardio. Show up.', selected: true },
            { icon: '💪', title: 'Build strength', sub: 'Get stronger, lift more, feel capable.' },
            { icon: '🏃', title: 'Run further', sub: '5K, 10K, half-marathon, marathon.' },
            { icon: '🧘', title: 'Mind & body', sub: 'Yoga, mobility, breathwork, sleep.' },
            { icon: '⚖️', title: 'Lose weight', sub: 'Sustainable, no crash diets.' },
            { icon: '🎯', title: 'Specific event', sub: 'Race, photoshoot, vacation, recovery.' },
          ].map((g, i) => (
            <button key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 16, padding: 24, textAlign: 'left',
              background: g.selected ? 'linear-gradient(135deg, rgba(232,93,44,0.08) 0%, var(--bg-card) 70%)' : 'var(--bg-card)',
              border: g.selected ? '1px solid var(--accent)' : '1px solid var(--stroke-1)',
              borderRadius: 14, cursor: 'pointer', transition: 'all .2s',
            }}>
              <div style={{ fontSize: 32, lineHeight: 1 }}>{g.icon}</div>
              <div style={{ flex: 1 }}>
                <div className="title" style={{ fontSize: 18, marginBottom: 4 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{g.sub}</div>
              </div>
              {g.selected && <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>✓</div>}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 40, justifyContent: 'center' }}>
          <button className="btn-outline" style={{ padding: '14px 28px', fontSize: 13 }}>← Back</button>
          <button className="btn-primary" style={{ padding: '14px 32px', fontSize: 13 }}>Continue →</button>
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
window.Onboarding = Onboarding;
