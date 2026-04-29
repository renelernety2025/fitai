// FIT_AI — Dashboard
// Notion-density data + Apple-Music modular cards + Nike action

const Dashboard = () => {
  return (
    <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100%', display: 'flex' }}>
      <DashSidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <DashTopbar />
        <DashContent />
      </div>
    </div>
  );
};

// ── SIDEBAR ─────────────────────────────────────────────────
const DashSidebar = () => {
  const nav = [
    { i: 'home', l: 'Today', active: true },
    { i: 'calendar', l: 'Calendar' },
    { i: 'dumbbell', l: 'Programs' },
    { i: 'pulse', l: 'Stats' },
    { i: 'users', l: 'Community' },
    { i: 'trophy', l: 'Challenges' },
  ];
  const lib = [
    { i: 'compass', l: 'Discover' },
    { i: 'flame', l: 'Strength' },
    { i: 'bolt', l: 'HIIT' },
    { i: 'heart', l: 'Recovery' },
  ];
  return (
    <div style={{
      width: 240, flexShrink: 0, padding: '20px 14px',
      borderRight: '1px solid var(--stroke-1)',
      display: 'flex', flexDirection: 'column', gap: 28,
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      <div style={{ padding: '4px 10px' }}><Logo size={20} /></div>

      <div>
        <div className="eyebrow" style={{ padding: '0 10px', marginBottom: 8 }}>WORKSPACE</div>
        {nav.map(n => (
          <div key={n.l} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            height: 34, padding: '0 10px', borderRadius: 8,
            background: n.active ? 'var(--bg-2)' : 'transparent',
            color: n.active ? 'var(--text-1)' : 'var(--text-2)',
            fontSize: 14, fontWeight: n.active ? 500 : 400,
            cursor: 'pointer',
          }}>
            <Icon name={n.i} size={16} />
            <span>{n.l}</span>
            {n.l === 'Community' && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>}
          </div>
        ))}
      </div>

      <div>
        <div className="eyebrow" style={{ padding: '0 10px', marginBottom: 8 }}>LIBRARY</div>
        {lib.map(n => (
          <div key={n.l} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 34, padding: '0 10px', borderRadius: 8, color: 'var(--text-2)', fontSize: 14 }}>
            <Icon name={n.i} size={16} />
            <span>{n.l}</span>
          </div>
        ))}
      </div>

      <div>
        <div className="eyebrow" style={{ padding: '0 10px', marginBottom: 8 }}>SQUADS</div>
        {[
          { color: '#FF4B12', name: 'Morning Lifters' },
          { color: '#6BE3D2', name: 'Run Club Berlin' },
          { color: '#FFB547', name: 'Pull Day Crew' },
        ].map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 32, padding: '0 10px', borderRadius: 8, color: 'var(--text-2)', fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}/>
            <span>{s.name}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, background: 'var(--bg-2)' }}>
        <Avatar src={IMG.userAvi1} size={32} online/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Marcus K.</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Athlete · 142d streak</div>
        </div>
        <Icon name="settings" size={14} color="var(--text-3)" />
      </div>
    </div>
  );
};

// ── TOPBAR ──────────────────────────────────────────────────
const DashTopbar = () => (
  <div style={{
    height: 64, padding: '0 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid var(--stroke-1)',
    position: 'sticky', top: 0, zIndex: 10,
    background: 'rgba(7,7,10,0.85)', backdropFilter: 'blur(20px)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-3)' }}>
        <span>Workspace</span>
        <Icon name="chevron-r" size={12} />
        <span style={{ color: 'var(--text-1)' }}>Today</span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 480, marginLeft: 32 }}>
      <div style={{
        flex: 1, height: 36, borderRadius: 'var(--r-pill)',
        background: 'var(--bg-2)', border: '1px solid var(--stroke-1)',
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
      }}>
        <Icon name="search" size={14} color="var(--text-3)" />
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Search workouts, coaches, friends…</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'var(--bg-3)', color: 'var(--text-3)' }}>⌘</kbd>
          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 5px', borderRadius: 4, background: 'var(--bg-3)', color: 'var(--text-3)' }}>K</kbd>
        </span>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <IconButton icon="sparkles" variant="solid" size={36}/>
      <IconButton icon="bell" variant="solid" size={36} badge/>
      <Button size="sm" variant="accent" icon="plus">Log workout</Button>
    </div>
  </div>
);

// ── CONTENT ─────────────────────────────────────────────────
const DashContent = () => (
  <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>
    <DashHeroBlock />
    <DashStatsRow />
    <DashTodayRow />
    <DashWeekTable />
    <DashCommunityRow />
  </div>
);

// ── HERO BLOCK ──────────────────────────────────────────────
const DashHeroBlock = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
    {/* Featured workout card */}
    <Card padding={0} style={{ position: 'relative', overflow: 'hidden', minHeight: 320 }}>
      <img src={IMG.actionLift} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, var(--bg-card) 0%, rgba(17,17,22,0.6) 50%, transparent 100%)' }}/>
      <div style={{ position: 'relative', padding: 36, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Tag color="var(--accent)">TODAY · WEEK 6 / 12</Tag>
            <span className="eyebrow">POWER · LOWER BODY</span>
          </div>
          <div className="display-2" style={{ marginBottom: 12, maxWidth: 460 }}>The Glute Hypertrophy Block.</div>
          <p className="body" style={{ maxWidth: 380, fontSize: 14 }}>52 minutes · 7 movements · with Coach Maya. AI-adapted from your last session — heavier squats, less volume on RDL.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button variant="primary" size="lg" icon="play">Start training</Button>
          <Button variant="glass" size="lg">Preview</Button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={IMG.coachMaya} size={36} ring="var(--accent)"/>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Maya Sato</div>
              <div className="caption">Hypertrophy Coach</div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    {/* Streak / readiness */}
    <Card padding={28} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span className="eyebrow">READINESS</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Synced 2m ago</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Ring value={87} size={120} stroke={6} label="87" sub="GO" />
        <div style={{ flex: 1 }}>
          <div className="title" style={{ marginBottom: 4 }}>Peak.</div>
          <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>Sleep 7h32m · HRV 68ms · Resting 52bpm. Push it today.</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--stroke-1)', paddingTop: 16, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Streak</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="flame" size={14} color="var(--accent)"/>
            <span className="metric" style={{ fontSize: 16, fontWeight: 600 }}>142</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>days</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 24, borderRadius: 3, background: i < 12 ? 'var(--accent)' : 'var(--bg-3)', opacity: i < 12 ? (0.4 + i * 0.05) : 1 }}/>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

// ── STATS ROW (Notion data block) ───────────────────────────
const DashStatsRow = () => (
  <div>
    <SectionHeader eyebrow="THIS WEEK" title="By the numbers." action="Open stats" />
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
        {[
          { label: 'VOLUME', value: '38,420', unit: 'kg', delta: '12%', deltaPositive: true, spark: [22,28,24,32,30,38] },
          { label: 'SESSIONS', value: '5', unit: '/ 6', delta: '83%', deltaPositive: true, spark: [3,4,5,4,6,5] },
          { label: 'CALORIES', value: '12,840', unit: 'kcal', delta: '4%', deltaPositive: true, spark: [1800,2100,1950,2400,2200,2400] },
          { label: 'AVG HR', value: '142', unit: 'bpm', delta: '2%', deltaPositive: false, spark: [144,140,148,142,138,142] },
          { label: 'SLEEP', value: '7.4', unit: 'h', delta: '0.3h', deltaPositive: true, spark: [7,7.2,6.8,7.5,7.4,7.6] },
          { label: 'STREAK', value: '142', unit: 'd', delta: '+7', deltaPositive: true, spark: [120,128,134,138,140,142] },
        ].map((s, i) => (
          <div key={i} style={{
            padding: 24, borderRight: i < 5 ? '1px solid var(--stroke-1)' : 'none',
          }}>
            <Metric {...s} />
            <div style={{ marginTop: 12 }}><Sparkline data={s.spark} width={140} height={28} color={s.deltaPositive ? 'var(--positive)' : 'var(--accent)'} /></div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ── TODAY ROW ───────────────────────────────────────────────
const TODAY_ITEMS = [
  { time: '06:30', dur: '12 min', name: 'Mobility wake-up', coach: 'Kai', img: IMG.actionStretch, type: 'Mobility', done: true },
  { time: '08:00', dur: '52 min', name: 'Glute Hypertrophy', coach: 'Maya', img: IMG.actionLift, type: 'Strength', done: false, current: true },
  { time: '13:00', dur: '8 min', name: 'Mid-day breathwork', coach: 'Lena', img: IMG.actionYoga, type: 'Recovery', done: false },
  { time: '19:00', dur: '24 min', name: 'Easy zone-2 run', coach: 'Ari', img: IMG.actionRun, type: 'Cardio', done: false },
];

const DashTodayRow = () => (
  <div>
    <SectionHeader eyebrow="TODAY · TUE 14 OCT" title="Your stack." action="Edit plan" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {TODAY_ITEMS.map((t, i) => (
        <Card key={i} padding={0} hover style={{
          position: 'relative', overflow: 'hidden', minHeight: 220,
          border: t.current ? '1px solid var(--accent)' : '1px solid var(--stroke-1)',
        }}>
          <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
            <img src={t.img} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: t.done ? 'grayscale(0.8) brightness(0.5)' : 'none' }}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(17,17,22,0.9) 100%)' }}/>
            {t.done && <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}><Icon name="check" size={12}/></div>}
            {t.current && <div style={{ position: 'absolute', top: 12, left: 12 }}><Tag color="var(--accent)">NOW</Tag></div>}
            <div style={{ position: 'absolute', bottom: 10, left: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff' }}>{t.time} · {t.dur}</div>
          </div>
          <div style={{ padding: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 6, color: t.done ? 'var(--text-3)' : 'var(--accent-hot)' }}>{t.type}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: t.done ? 'var(--text-3)' : 'var(--text-1)' }}>{t.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>with {t.coach}</div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ── WEEK TABLE (Notion-density) ─────────────────────────────
const DashWeekTable = () => {
  const rows = [
    { day: 'Mon', date: '13', focus: 'Push · Upper', vol: '4,820', sets: 18, time: '48m', rpe: 7.2, hr: 138, status: 'done' },
    { day: 'Tue', date: '14', focus: 'Lower · Power', vol: '6,140', sets: 22, time: '52m', rpe: 8.4, hr: 142, status: 'now' },
    { day: 'Wed', date: '15', focus: 'Run · Z2', vol: '—', sets: 0, time: '36m', rpe: 5.0, hr: 128, status: 'upcoming' },
    { day: 'Thu', date: '16', focus: 'Pull · Volume', vol: '5,640', sets: 24, time: '54m', rpe: 7.8, hr: 140, status: 'upcoming' },
    { day: 'Fri', date: '17', focus: 'Recovery', vol: '—', sets: 0, time: '24m', rpe: 3.0, hr: 96, status: 'upcoming' },
    { day: 'Sat', date: '18', focus: 'Lower · Hypertrophy', vol: '6,800', sets: 26, time: '62m', rpe: 8.0, hr: 144, status: 'upcoming' },
    { day: 'Sun', date: '19', focus: 'Off', vol: '—', sets: 0, time: '—', rpe: 0, hr: 0, status: 'rest' },
  ];
  return (
    <div>
      <SectionHeader eyebrow="WEEK 41 · MICROCYCLE 6 / 12" title="Plan & actuals." action="Full calendar" />
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 80px 1fr 100px 80px 80px 80px 80px 100px',
          padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)',
          borderBottom: '1px solid var(--stroke-1)',
        }}>
          <div>DAY</div><div>DATE</div><div>FOCUS</div>
          <div style={{ textAlign: 'right' }}>VOL · KG</div>
          <div style={{ textAlign: 'right' }}>SETS</div>
          <div style={{ textAlign: 'right' }}>TIME</div>
          <div style={{ textAlign: 'right' }}>RPE</div>
          <div style={{ textAlign: 'right' }}>BPM</div>
          <div style={{ textAlign: 'right' }}>STATUS</div>
        </div>
        {rows.map((r, i) => {
          const isNow = r.status === 'now';
          const isDone = r.status === 'done';
          const isRest = r.status === 'rest';
          return (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '60px 80px 1fr 100px 80px 80px 80px 80px 100px',
              padding: '14px 20px', fontSize: 13, alignItems: 'center',
              background: isNow ? 'rgba(255,75,18,0.05)' : 'transparent',
              borderBottom: i < rows.length - 1 ? '1px solid var(--stroke-1)' : 'none',
              color: isRest ? 'var(--text-3)' : 'var(--text-1)',
            }}>
              <div style={{ fontSize: 12, color: isNow ? 'var(--accent)' : 'var(--text-3)', fontWeight: isNow ? 600 : 400 }}>{r.day}</div>
              <div className="metric" style={{ fontSize: 14, fontWeight: 500 }}>{r.date}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDone ? 'var(--positive)' : isNow ? 'var(--accent)' : isRest ? 'var(--text-4)' : 'var(--bg-4)' }}/>
                <span>{r.focus}</span>
              </div>
              <div className="metric" style={{ textAlign: 'right', color: r.vol === '—' ? 'var(--text-3)' : 'var(--text-1)' }}>{r.vol}</div>
              <div className="metric" style={{ textAlign: 'right', color: r.sets === 0 ? 'var(--text-3)' : 'var(--text-1)' }}>{r.sets || '—'}</div>
              <div className="metric" style={{ textAlign: 'right' }}>{r.time}</div>
              <div className="metric" style={{ textAlign: 'right', color: r.rpe >= 8 ? 'var(--accent-hot)' : r.rpe === 0 ? 'var(--text-3)' : 'var(--text-2)' }}>{r.rpe ? r.rpe.toFixed(1) : '—'}</div>
              <div className="metric" style={{ textAlign: 'right', color: 'var(--text-2)' }}>{r.hr || '—'}</div>
              <div style={{ textAlign: 'right' }}>
                {isDone && <span style={{ color: 'var(--positive)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>✓ DONE</span>}
                {isNow && <Tag color="var(--accent)">NOW</Tag>}
                {r.status === 'upcoming' && <span style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>QUEUED</span>}
                {isRest && <span style={{ color: 'var(--text-4)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>REST</span>}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

// ── COMMUNITY ROW ───────────────────────────────────────────
const DashCommunityRow = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    {/* Squad leaderboard */}
    <Card padding={24}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>SQUAD · MORNING LIFTERS</div>
          <div className="title">Week 41 leaderboard</div>
        </div>
        <Tag>VOLUME · KG</Tag>
      </div>
      {[
        { name: 'Lena V.', avi: IMG.userAvi8, vol: 8420, you: false, rank: 1 },
        { name: 'You', avi: IMG.userAvi1, vol: 6140, you: true, rank: 2 },
        { name: 'Tomás R.', avi: IMG.userAvi4, vol: 5980, you: false, rank: 3 },
        { name: 'Saoirse K.', avi: IMG.userAvi6, vol: 4820, you: false, rank: 4 },
        { name: 'Felix B.', avi: IMG.userAvi5, vol: 3940, you: false, rank: 5 },
      ].map((p, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '24px 32px 1fr 60px 80px',
          alignItems: 'center', padding: '10px 0',
          borderTop: i ? '1px solid var(--stroke-1)' : 'none',
        }}>
          <div className="metric" style={{ fontSize: 13, color: p.rank === 1 ? 'var(--accent-hot)' : 'var(--text-3)', fontWeight: 600 }}>{p.rank}</div>
          <Avatar src={p.avi} size={24} />
          <div style={{ fontSize: 13, fontWeight: p.you ? 600 : 400, color: p.you ? 'var(--accent-hot)' : 'var(--text-1)', paddingLeft: 8 }}>
            {p.name} {p.you && <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 4 }}>YOU</span>}
          </div>
          <div className="metric" style={{ fontSize: 13, textAlign: 'right' }}>{p.vol.toLocaleString()}</div>
          <div style={{ paddingLeft: 12 }}>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-3)', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${(p.vol / 8420) * 100}%`, background: p.you ? 'var(--accent)' : 'var(--text-2)', borderRadius: 2 }}/>
            </div>
          </div>
        </div>
      ))}
    </Card>

    {/* AI insight card */}
    <Card padding={28} style={{ background: 'linear-gradient(160deg, #1a0a05 0%, var(--bg-card) 60%)', border: '1px solid rgba(255,75,18,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Icon name="sparkles" size={16} color="var(--accent-hot)" />
        <span className="eyebrow" style={{ color: 'var(--accent-hot)' }}>AI COACH · INSIGHT</span>
      </div>
      <div className="display-3" style={{ fontSize: 26, marginBottom: 16 }}>
        Your squat hit a 12-week PR — but bar speed dropped 18% on set 3.
      </div>
      <p className="body" style={{ fontSize: 14, marginBottom: 24 }}>
        I'm queuing a deload on Wednesday's lower session, then re-testing 1RM on Saturday with a wider stance variation. You're running hot — this is the smart call.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="sm" variant="accent">Apply to plan</Button>
        <Button size="sm" variant="glass">Explain why</Button>
        <Button size="sm" variant="plain" iconRight="chevron-r">Dismiss</Button>
      </div>
    </Card>
  </div>
);

window.Dashboard = Dashboard;
