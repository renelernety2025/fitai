// FIT_AI — AI Coach chat + Progress + Nutrition + Profile
// Compact set of post-login screens.

// ── AI COACH CHAT ──────────────────────────────────────────
const AICoach = () => {
  const messages = [
    { role: 'coach', name: 'Maya', avatar: IMG.coachMaya, text: "Good morning Sara. I saw your run was a bit harder than usual yesterday — your HRV is down 12%. How are you feeling today?", time: '7:42 AM' },
    { role: 'user', text: "Bit tired honestly. Slept ok but legs feel heavy.", time: '7:45 AM' },
    { role: 'coach', name: 'Maya', avatar: IMG.coachMaya, text: "Got it. I'm swapping today's tempo run for an easy 30-min walk + 15 min yoga flow. Same training stress on paper, way kinder on your nervous system. Sound good?", time: '7:45 AM', card: { type: 'workout-swap' } },
    { role: 'user', text: "Yes please. Thank you 🙏", time: '7:46 AM' },
    { role: 'coach', name: 'Maya', avatar: IMG.coachMaya, text: "Updated. One more thing — try to get to bed 30 min earlier tonight. Your sleep score has been drifting. I'll send a wind-down reminder at 9:30 PM.", time: '7:46 AM' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', height: 816, background: 'var(--bg-0)' }}>
      {/* Sidebar — coaches */}
      <div style={{ borderRight: '1px solid var(--stroke-1)', padding: 24, overflow: 'auto' }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>Your coaches</div>
        {[
          { name: 'Maya Sato', role: 'Lead coach', img: IMG.coachMaya, active: true, unread: 2 },
          { name: 'Kai Bergman', role: 'Mobility', img: IMG.coachKai },
          { name: 'Sara Lindqvist', role: 'Running', img: IMG.coachAri },
        ].map((c, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 12,
            background: c.active ? 'var(--bg-card)' : 'transparent',
            borderRadius: 10, marginBottom: 6, cursor: 'pointer',
            border: c.active ? '1px solid var(--stroke-2)' : '1px solid transparent',
          }}>
            <Avatar src={c.img} size={40} online={c.active} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.role}</div>
            </div>
            {c.unread && <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</div>}
          </div>
        ))}
        <div className="eyebrow" style={{ marginTop: 32, marginBottom: 16 }}>Quick prompts</div>
        {['Plan my week', 'I'm sore today', 'What should I eat?', 'Show my progress'].map(p => (
          <div key={p} style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-2)', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-2)', marginBottom: 6 }}>{p}</div>
        ))}
      </div>

      {/* Chat */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 24, borderBottom: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar src={IMG.coachMaya} size={44} online />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Maya Sato</div>
            <div style={{ fontSize: 12, color: 'var(--sage)' }}>● Online · usually replies in minutes</div>
          </div>
          <button className="btn-outline" style={{ padding: '8px 14px', fontSize: 12 }}>Voice call</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
              {m.role === 'coach' && <Avatar src={m.avatar} size={32} />}
              <div style={{ maxWidth: '70%' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: 14,
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                  color: m.role === 'user' ? '#fff' : 'var(--text-1)',
                  border: m.role === 'coach' ? '1px solid var(--stroke-1)' : 'none',
                  fontSize: 14, lineHeight: 1.55,
                }}>{m.text}</div>
                {m.card && (
                  <div style={{ marginTop: 8, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--stroke-2)', borderRadius: 12 }}>
                    <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--accent-hot)' }}>Today's plan — updated</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, background: 'var(--bg-2)', borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', textDecoration: 'line-through' }}>Tempo run · 8 km</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, background: 'rgba(232,93,44,0.08)', borderRadius: 8, border: '1px solid rgba(232,93,44,0.2)' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Easy walk + yoga · 45 min</span>
                    </div>
                    <button className="btn-primary" style={{ marginTop: 10, padding: '8px 14px', fontSize: 12 }}>Accept change</button>
                  </div>
                )}
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, textAlign: m.role === 'user' ? 'right' : 'left' }}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: 20, borderTop: '1px solid var(--stroke-1)' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--stroke-2)', borderRadius: 12, padding: '8px 8px 8px 16px' }}>
            <input placeholder="Message Maya..." style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-1)', fontSize: 14, outline: 'none' }}/>
            <button className="btn-outline" style={{ padding: '8px 12px', fontSize: 12 }}>📎</button>
            <button className="btn-primary" style={{ padding: '8px 14px', fontSize: 12 }}>Send →</button>
          </div>
        </div>
      </div>

      {/* Right — context panel */}
      <div style={{ borderLeft: '1px solid var(--stroke-1)', padding: 24, overflow: 'auto' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>What Maya sees</div>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Recovery · today</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="numeric-display" style={{ fontSize: 32, color: 'var(--accent-hot)' }}>62</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>down 18 from yesterday</span>
          </div>
        </Card>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>Sleep · last 7 nights</div>
          <Sparkline data={[7.5, 7, 6.5, 8, 6, 5.5, 6.5]} width={240} height={40} />
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Avg 6h 42m · ↓ 22 min</div>
        </Card>
        <Card padding={16} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>This week</div>
          <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>3 runs · 1 yoga · 0 strength<br/>Total: 4h 12min</div>
        </Card>
        <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5, padding: '12px 4px' }}>
          Maya only sees data you share. <span style={{ color: 'var(--accent-hot)', fontWeight: 600 }}>Manage privacy →</span>
        </div>
      </div>
    </div>
  );
};

// ── PROGRESS ──────────────────────────────────────────────
const Progress = () => (
  <div style={{ background: 'var(--bg-0)', padding: '40px 56px' }}>
    <div style={{ marginBottom: 32 }}>
      <div className="eyebrow" style={{ color: 'var(--accent-hot)', marginBottom: 12 }}>◆ Progress</div>
      <h1 className="display-2" style={{ margin: 0 }}>
        12 weeks of <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>becoming.</span>
      </h1>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
      {[
        { label: 'Total volume', value: '184k', unit: 'kg', delta: '+248%', sparkline: [12, 18, 14, 22, 19, 28, 24, 32, 30, 38, 34, 42] },
        { label: '5K time', value: '24:18', delta: '−2:14', sparkline: [28, 27, 27, 26.5, 26, 26, 25, 25, 24.8, 24.6, 24.3, 24.1] },
        { label: 'Sessions', value: '64', unit: 'completed', delta: '+12 streak', sparkline: [3, 4, 4, 5, 4, 5, 6, 5, 6, 5, 6, 6] },
        { label: 'Sleep avg', value: '7.2', unit: 'hrs', delta: '+44 min', sparkline: [6.4, 6.5, 6.7, 6.9, 6.8, 7.0, 7.1, 7.0, 7.1, 7.2, 7.3, 7.2] },
      ].map((m, i) => (
        <Card key={i} padding={20}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>{m.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span className="numeric-display" style={{ fontSize: 32, color: 'var(--text-1)' }}>{m.value}</span>
            {m.unit && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.unit}</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 600, marginBottom: 12 }}>↑ {m.delta}</div>
          <Sparkline data={m.sparkline} width={220} height={40} color="var(--sage)" />
        </Card>
      ))}
    </div>

    {/* Body photos */}
    <Card padding={28} style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Body photos · last 12 weeks</div>
          <div className="title" style={{ fontSize: 22 }}>You can see the work.</div>
        </div>
        <button className="btn-outline" style={{ padding: '8px 14px', fontSize: 12 }}>+ Add photo</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {[
          { date: 'Wk 1',  img: IMG.coachAri },
          { date: 'Wk 3',  img: IMG.coachAri },
          { date: 'Wk 5',  img: IMG.coachAri },
          { date: 'Wk 8',  img: IMG.coachAri },
          { date: 'Wk 10', img: IMG.coachAri },
          { date: 'Wk 12', img: IMG.coachAri, current: true },
        ].map((p, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-3)', border: p.current ? '2px solid var(--accent)' : '1px solid var(--stroke-1)' }}>
            <img src={p.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) brightness(0.95)' }}/>
            <div style={{ position: 'absolute', bottom: 8, left: 8, padding: '3px 8px', borderRadius: 6, background: 'rgba(11,9,7,0.7)', backdropFilter: 'blur(8px)', fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{p.date}</div>
          </div>
        ))}
      </div>
    </Card>

    {/* Records */}
    <Card padding={28}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Personal records</div>
      <div className="title" style={{ fontSize: 22, marginBottom: 20 }}>Your strongest, fastest, longest.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { lift: 'Back squat', value: '85 kg', when: '2 weeks ago', delta: '+15 kg' },
          { lift: 'Deadlift', value: '110 kg', when: '5 days ago', delta: '+20 kg' },
          { lift: 'Bench press', value: '52.5 kg', when: '3 weeks ago', delta: '+7.5 kg' },
          { lift: '5K run', value: '24:18', when: 'yesterday', delta: '−2:14' },
          { lift: 'Plank', value: '3:42', when: 'last week', delta: '+58s' },
          { lift: 'Pull-ups', value: '8 reps', when: 'this morning', delta: '+3 reps' },
        ].map((r, i) => (
          <div key={i} style={{ padding: 18, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--stroke-1)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6 }}>{r.lift}</div>
            <div className="numeric-display" style={{ fontSize: 28, color: 'var(--text-1)', marginBottom: 4 }}>{r.value}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: 'var(--text-3)' }}>{r.when}</span>
              <span style={{ color: 'var(--sage)', fontWeight: 600 }}>↑ {r.delta}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ── NUTRITION ──────────────────────────────────────────────
const Nutrition = () => (
  <div style={{ background: 'var(--bg-0)', padding: '40px 56px' }}>
    <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <div>
        <div className="eyebrow" style={{ color: 'var(--accent-hot)', marginBottom: 12 }}>◆ Nutrition · today</div>
        <h1 className="display-2" style={{ margin: 0 }}>
          Eat for <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>energy.</span>
        </h1>
      </div>
      <button className="btn-primary" style={{ padding: '12px 22px', fontSize: 13 }}>+ Log a meal</button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginBottom: 24 }}>
      <Card padding={28}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'center' }}>
          <Ring value={68} size={140} stroke={10} label="1,420" sub="of 2,080 kcal" />
          <div>
            <div className="title" style={{ fontSize: 22, marginBottom: 16 }}>660 kcal to go.</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { name: 'Protein', value: 92, target: 130, color: 'var(--accent)' },
                { name: 'Carbs', value: 168, target: 240, color: 'var(--sage)' },
                { name: 'Fat', value: 48, target: 70, color: '#D4A88C' },
              ].map(m => (
                <div key={m.name}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, fontWeight: 600 }}>{m.name}</div>
                  <div className="numeric-display" style={{ fontSize: 18, color: 'var(--text-1)' }}>{m.value}<span style={{ fontSize: 11, color: 'var(--text-3)' }}>/{m.target}g</span></div>
                  <div style={{ marginTop: 6, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(m.value/m.target)*100}%`, background: m.color, borderRadius: 2 }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <Card padding={20}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Hydration</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
          <span className="numeric-display" style={{ fontSize: 28 }}>1.4</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>of 2.5 L</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
          {Array.from({length: 10}).map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: i < 6 ? 'var(--sage)' : 'var(--bg-3)', opacity: i < 6 ? 1 : 0.4 }}/>
          ))}
        </div>
        <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '8px 0', fontSize: 12, marginTop: 14 }}>+ 250ml glass</button>
      </Card>
    </div>

    <Card padding={28}>
      <div className="eyebrow" style={{ marginBottom: 16 }}>Today's meals</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { time: '07:30', name: 'Greek yogurt + berries + granola', kcal: 320, p: 22, c: 38, f: 9, img: IMG.feedFood },
          { time: '12:15', name: 'Grain bowl · quinoa, salmon, avocado', kcal: 580, p: 38, c: 52, f: 24, img: IMG.feedFood },
          { time: '15:45', name: 'Apple + almond butter', kcal: 280, p: 8, c: 28, f: 16, img: IMG.feedFood },
          { time: '19:00', name: 'Dinner — not logged yet', kcal: null, placeholder: true },
        ].map((m, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: 14,
            background: m.placeholder ? 'transparent' : 'var(--bg-2)',
            border: m.placeholder ? '1px dashed var(--stroke-2)' : '1px solid var(--stroke-1)',
            borderRadius: 12,
          }}>
            <span className="numeric-display" style={{ fontSize: 12, color: 'var(--text-3)', width: 48 }}>{m.time}</span>
            {m.img && !m.placeholder ? <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-3)' }}><img src={m.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/></div>
              : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-3)' }}>+</div>
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: m.placeholder ? 'var(--text-3)' : 'var(--text-1)' }}>{m.name}</div>
              {!m.placeholder && (
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>P {m.p}g · C {m.c}g · F {m.f}g</div>
              )}
            </div>
            {!m.placeholder && <div className="numeric-display" style={{ fontSize: 18, color: 'var(--text-1)' }}>{m.kcal}<span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 2 }}>kcal</span></div>}
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ── PROFILE ────────────────────────────────────────────────
const Profile = () => (
  <div style={{ background: 'var(--bg-0)' }}>
    <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
      <img src={IMG.heroLift} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) brightness(0.7)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, var(--bg-0) 100%)' }}/>
    </div>
    <div style={{ padding: '0 56px', marginTop: -88, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32 }}>
        <Avatar src={IMG.userAvi3} size={144} ring="var(--bg-0)" style={{ border: '4px solid var(--bg-0)' }} />
        <div style={{ flex: 1, paddingBottom: 12 }}>
          <div className="eyebrow" style={{ color: 'var(--accent-hot)', marginBottom: 8 }}>◆ Member since 2024 · Level 12</div>
          <h1 className="display-2" style={{ margin: 0 }}>Sara Lindqvist</h1>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>Stockholm · Running, yoga, getting stronger</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" style={{ padding: '10px 18px', fontSize: 13 }}>Share profile</button>
          <button className="btn-outline" style={{ padding: '10px 18px', fontSize: 13 }}>⚙ Settings</button>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Streak', value: '64', unit: 'days' },
          { label: 'Sessions', value: '184', unit: 'all-time' },
          { label: 'Squad rank', value: '#3', unit: 'of 1,420' },
          { label: 'XP', value: '24,820' },
          { label: 'Achievements', value: '32', unit: 'of 78' },
        ].map((s, i) => (
          <Card key={i} padding={18}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="numeric-display" style={{ fontSize: 28 }}>{s.value}</span>
              {s.unit && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.unit}</span>}
            </div>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <Card padding={24} style={{ marginBottom: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>Recent achievements</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {['🏃 First 5K', '🔥 30-day streak', '💪 Bodyweight squat', '🌅 Early bird', '🎯 Goal crushed', '⚡ Speed demon'].map((a, i) => (
            <div key={i} style={{ padding: 16, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--stroke-1)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{a.split(' ')[0]}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{a.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

window.AICoach = AICoach;
window.Progress = Progress;
window.Nutrition = Nutrition;
window.Profile = Profile;
