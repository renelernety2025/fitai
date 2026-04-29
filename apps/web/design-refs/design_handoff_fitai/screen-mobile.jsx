// FIT_AI — Mobile (iOS) screens
// Today + Workout-active. Embedded in iOS device frame.

const MobileToday = () => (
  <div style={{ background: '#000', minHeight: '100%', color: '#fff', padding: '0 0 100px' }}>
    {/* Top status / nav */}
    <div style={{ padding: '70px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>TUE 14 OCT</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Good morning, Marcus.</div>
      </div>
      <Avatar src={IMG.userAvi1} size={36} ring="var(--accent)"/>
    </div>

    {/* Readiness ring */}
    <div style={{ margin: '0 16px 16px', padding: 20, borderRadius: 20, background: 'linear-gradient(135deg, #1a0a05 0%, #0c0c10 100%)', border: '1px solid rgba(255,75,18,0.2)', display: 'flex', alignItems: 'center', gap: 16 }}>
      <Ring value={87} size={72} stroke={5} label="87" sub="GO"/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-hot)', letterSpacing: '0.08em', marginBottom: 4 }}>READINESS · PEAK</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Push it today.</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Sleep 7h32 · HRV 68 · RHR 52</div>
      </div>
    </div>

    {/* Today's workout — big card */}
    <div style={{ margin: '0 16px 24px', borderRadius: 20, overflow: 'hidden', position: 'relative', height: 320, background: '#1a1a20' }}>
      <img src={IMG.actionLift} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)' }}/>
      <div style={{ position: 'relative', padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color="var(--accent)">TODAY · NOW</Tag>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)' }}>POWER · LOWER</span>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 8 }}>The Glute<br/>Hypertrophy Block.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Avatar src={IMG.coachMaya} size={24}/>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>with Maya · 52 min · 7 mvts</span>
          </div>
          <button style={{
            width: '100%', height: 52, borderRadius: 26,
            background: 'var(--accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
            border: 'none',
          }}>
            <Icon name="play" size={16}/> Start training
          </button>
        </div>
      </div>
    </div>

    {/* Stats grid */}
    <div style={{ padding: '0 16px', marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 12, padding: '0 4px' }}>THIS WEEK</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { l: 'VOLUME', v: '38.4k', u: 'kg', d: '+12%', spark: [22,28,24,32,30,38] },
          { l: 'SESSIONS', v: '5', u: '/ 6', d: '+1', spark: [3,4,5,4,5,5] },
          { l: 'STREAK', v: '142', u: 'd', d: '+7', spark: [120,128,134,138,140,142] },
          { l: 'AVG HR', v: '142', u: 'bpm', d: '-2%', spark: [144,140,148,142,138,142] },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 14, border: '1px solid var(--stroke-1)' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>{s.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
              <span className="metric" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>{s.v}</span>
              <span className="metric" style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.u}</span>
              <span className="metric" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--positive)' }}>{s.d}</span>
            </div>
            <Sparkline data={s.spark} width={130} height={20} color="var(--accent)" />
          </div>
        ))}
      </div>
    </div>

    {/* Up next list */}
    <div style={{ padding: '0 16px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, padding: '0 4px' }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em' }}>UP NEXT</span>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>3 stacked</span>
      </div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--stroke-1)' }}>
        {[
          { t: '13:00', d: '8m', n: 'Mid-day breathwork', c: 'Recovery · Lena' },
          { t: '19:00', d: '24m', n: 'Easy zone-2 run', c: 'Cardio · Ari' },
          { t: '21:30', d: '12m', n: 'Mobility cooldown', c: 'Recovery · Kai' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
            <div style={{ width: 40, textAlign: 'center' }}>
              <div className="metric" style={{ fontSize: 13, fontWeight: 600 }}>{s.t}</div>
              <div className="caption" style={{ fontSize: 10 }}>{s.d}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{s.n}</div>
              <div className="caption">{s.c}</div>
            </div>
            <Icon name="chevron-r" size={14} color="var(--text-3)"/>
          </div>
        ))}
      </div>
    </div>

    {/* Squad activity */}
    <div style={{ padding: '0 16px' }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 12, padding: '0 4px' }}>SQUAD · ACTIVE NOW</div>
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 16, border: '1px solid var(--stroke-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Avatar src={IMG.userAvi8} size={32} online/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Lena V. is lifting</div>
            <div className="caption">Set 4 of 5 · Squat · 92kg</div>
          </div>
          <Icon name="bolt" size={16} color="var(--accent)"/>
        </div>
        <button style={{ width: '100%', height: 38, borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', color: 'var(--text-1)', border: '1px solid var(--stroke-2)', fontSize: 13, fontWeight: 500 }}>Send high-five</button>
      </div>
    </div>

    {/* Tab bar */}
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 28px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--stroke-1)', display: 'flex', justifyContent: 'space-around' }}>
      {[
        { i: 'home', l: 'Today', a: true },
        { i: 'calendar', l: 'Plan' },
        { i: 'play', l: 'Train', big: true },
        { i: 'users', l: 'Squad' },
        { i: 'user', l: 'Profile' },
      ].map((t, i) => (
        <button key={i} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: t.a ? '#fff' : 'rgba(255,255,255,0.4)',
        }}>
          {t.big ? (
            <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(255,75,18,0.5)' }}>
              <Icon name="play" size={18} color="#fff"/>
            </div>
          ) : <Icon name={t.i} size={20}/>}
          <span style={{ fontSize: 10, fontWeight: 500 }}>{t.l}</span>
        </button>
      ))}
    </div>
  </div>
);

window.MobileToday = MobileToday;

// ─── Mobile workout active ────────────────────────────────
const MobileWorkoutActive = () => (
  <div style={{ background: '#000', minHeight: '100%', color: '#fff', position: 'relative', overflow: 'hidden' }}>
    {/* Background image of exercise */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360 }}>
      <img src={IMG.actionLift} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8) brightness(0.6)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, #000 100%)' }}/>
    </div>

    {/* Top header */}
    <div style={{ position: 'relative', padding: '60px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="close" size={18}/>
      </button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', marginBottom: 2 }}>04 / 22 SETS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>14:32</div>
      </div>
      <button style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="more" size={18}/>
      </button>
    </div>

    {/* Movement title */}
    <div style={{ position: 'relative', padding: '120px 24px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-hot)', letterSpacing: '0.1em', marginBottom: 8 }}>BLOCK 02 · MAIN · HEAVY</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>Back Squat</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Set 3 of 4 · Tempo 2-1-X</div>
    </div>

    {/* Big rep / weight display */}
    <div style={{ position: 'relative', padding: '0 16px', marginBottom: 24 }}>
      <div style={{ background: 'linear-gradient(180deg, rgba(255,75,18,0.15) 0%, rgba(255,75,18,0.04) 100%)', border: '1px solid rgba(255,75,18,0.3)', borderRadius: 24, padding: 24, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>WEIGHT</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span className="metric" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>115</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>kg</span>
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }}/>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>REPS</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span className="metric" style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>5</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>× 4</span>
            </div>
          </div>
        </div>
        <button style={{ width: '100%', height: 52, borderRadius: 26, background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="check" size={16}/> Set complete
        </button>
      </div>
    </div>

    {/* Live metrics */}
    <div style={{ padding: '0 16px', marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { l: 'BPM', v: '142', c: 'var(--accent)' },
          { l: 'BAR SPD', v: '0.62', u: 'm/s', c: 'var(--positive)' },
          { l: 'RPE', v: '8', u: '/ 10', c: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, border: '1px solid var(--stroke-1)' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 4 }}>{s.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span className="metric" style={{ fontSize: 18, fontWeight: 600, color: s.c }}>{s.v}</span>
              {s.u && <span className="metric" style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.u}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* AI cue */}
    <div style={{ margin: '0 16px 16px', padding: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 14, border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: 16, background: 'rgba(255,75,18,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="sparkles" size={14} color="var(--accent-hot)"/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-hot)', letterSpacing: '0.08em', marginBottom: 2 }}>COACH MAYA · LIVE CUE</div>
        <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.4 }}>"Bar speed dropped 8%. Rest 30s longer this round."</div>
      </div>
    </div>

    {/* Rest timer */}
    <div style={{ position: 'absolute', bottom: 24, left: 16, right: 16, padding: 16, borderRadius: 18, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', border: '1px solid var(--stroke-2)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Ring value={62} size={48} stroke={3} label="1:48" color="var(--accent)"/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 2 }}>REST · 3 MIN TARGET</div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>Up next: Set 4 · same load</div>
      </div>
      <button style={{ height: 36, padding: '0 14px', borderRadius: 18, background: '#fff', color: '#000', fontWeight: 600, fontSize: 13 }}>Skip rest</button>
    </div>
  </div>
);

window.MobileWorkoutActive = MobileWorkoutActive;
