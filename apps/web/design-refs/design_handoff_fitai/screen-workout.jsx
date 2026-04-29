// FIT_AI — Workout detail (Nike Training Club vibe + Notion data)

const Workout = () => (
  <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100%', display: 'flex' }}>
    <DashSidebar />
    <div style={{ flex: 1, minWidth: 0 }}>
      <DashTopbar />
      <WorkoutHero />
      <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
        <WorkoutBlocks />
        <WorkoutSidePanel />
      </div>
    </div>
  </div>
);

const WorkoutHero = () => (
  <div style={{ position: 'relative', height: 460, overflow: 'hidden', borderBottom: '1px solid var(--stroke-1)' }}>
    <img src={IMG.actionLift} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.85) contrast(1.1)' }}/>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,7,10,0.4) 0%, rgba(7,7,10,0.1) 50%, var(--bg-0) 100%)' }}/>
    <div style={{ position: 'relative', padding: '48px 32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
        <span>Programs</span>
        <Icon name="chevron-r" size={12} />
        <span>Hypertrophy Block</span>
        <Icon name="chevron-r" size={12} />
        <span style={{ color: '#fff' }}>Week 6 · Day 2</span>
      </div>
      <div style={{ maxWidth: 720 }}>
        <Tag color="var(--accent)" style={{ marginBottom: 16 }}>POWER · LOWER BODY</Tag>
        <div className="display-1" style={{ fontSize: 88, marginBottom: 16, lineHeight: 0.9 }}>The Glute<br/>Hypertrophy Block.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar src={IMG.coachMaya} size={40} ring="var(--accent)"/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Maya Sato</div>
              <div className="caption">Hypertrophy Coach · 1.2M trained</div>
            </div>
          </div>
          <div style={{ height: 32, width: 1, background: 'var(--stroke-2)' }}/>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <span><span className="metric" style={{ fontSize: 16, fontWeight: 600, marginRight: 4 }}>52</span><span style={{ color: 'var(--text-3)' }}>min</span></span>
            <span><span className="metric" style={{ fontSize: 16, fontWeight: 600, marginRight: 4 }}>7</span><span style={{ color: 'var(--text-3)' }}>movements</span></span>
            <span><span className="metric" style={{ fontSize: 16, fontWeight: 600, marginRight: 4 }}>22</span><span style={{ color: 'var(--text-3)' }}>sets</span></span>
            <span><span className="metric" style={{ fontSize: 16, fontWeight: 600, marginRight: 4 }}>RPE 8</span><span style={{ color: 'var(--text-3)' }}>target</span></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="accent" size="lg" icon="play">Start now</Button>
          <Button variant="glass" size="lg">Preview movements</Button>
          <IconButton icon="heart" size={56} variant="glass"/>
          <IconButton icon="more" size={56} variant="glass"/>
        </div>
      </div>
    </div>
  </div>
);

const BLOCKS = [
  { name: 'Warm-up · Activation', time: '6 min', items: [
    { mv: 'Banded glute walks', sets: '2 × 12', tempo: 'Steady', rest: '30s' },
    { mv: 'Bodyweight squat', sets: '2 × 10', tempo: '2-1-2', rest: '30s' },
    { mv: 'Hip airplane', sets: '1 × 8/side', tempo: 'Slow', rest: '—' },
  ]},
  { name: 'Main · Heavy', time: '24 min', items: [
    { mv: 'Back squat', sets: '4 × 5 @ 82%', tempo: '2-1-X', rest: '3m', heavy: true },
    { mv: 'Romanian deadlift', sets: '4 × 6', tempo: '3-1-1', rest: '2m', heavy: true },
  ]},
  { name: 'Accessory · Hypertrophy', time: '16 min', items: [
    { mv: 'Walking lunge', sets: '3 × 10/leg', tempo: 'Steady', rest: '90s' },
    { mv: 'Hip thrust', sets: '3 × 12', tempo: '2-1-1', rest: '90s' },
    { mv: 'Calf raise (loaded)', sets: '4 × 15', tempo: 'Slow ecc.', rest: '60s' },
  ]},
  { name: 'Finisher · Cooldown', time: '6 min', items: [
    { mv: 'Couch stretch', sets: '2 × 60s/side', tempo: '—', rest: '—' },
    { mv: 'Box breathing', sets: '5 cycles', tempo: '4-4-4-4', rest: '—' },
  ]},
];

const WorkoutBlocks = () => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>BREAKDOWN</div>
        <div className="display-3">Movement plan</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Chip active>List</Chip>
        <Chip>Video</Chip>
        <Chip>3D</Chip>
      </div>
    </div>

    {BLOCKS.map((b, bi) => (
      <Card key={bi} padding={0} style={{ marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--stroke-1)',
          background: 'var(--bg-2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="metric" style={{ fontSize: 12, color: 'var(--text-3)' }}>0{bi + 1}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{b.time}</span>
          </div>
          <Icon name="chevron-d" size={14} color="var(--text-3)"/>
        </div>
        <div>
          {b.items.map((it, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '40px 60px 1fr 120px 100px 80px 24px',
              alignItems: 'center', padding: '14px 20px',
              borderBottom: i < b.items.length - 1 ? '1px solid var(--stroke-1)' : 'none',
              gap: 12,
            }}>
              <div className="metric" style={{ fontSize: 11, color: 'var(--text-3)' }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="dumbbell" size={18} color="var(--text-2)"/>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{it.mv}</div>
                <div className="caption">{it.tempo === '—' ? 'No tempo' : `Tempo ${it.tempo}`}</div>
              </div>
              <div className="metric" style={{ fontSize: 13, color: it.heavy ? 'var(--accent-hot)' : 'var(--text-1)', fontWeight: it.heavy ? 600 : 500 }}>{it.sets}</div>
              <div className="metric" style={{ fontSize: 12, color: 'var(--text-3)' }}>rest {it.rest}</div>
              <div style={{ textAlign: 'right' }}>
                {it.heavy && <Tag color="var(--accent)">PR</Tag>}
              </div>
              <Icon name="chevron-r" size={14} color="var(--text-3)"/>
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

const WorkoutSidePanel = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {/* Last time you did this */}
    <Card padding={20}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>LAST TIME · 6 DAYS AGO</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Ring value={92} size={64} stroke={4} label="92" sub="EFF"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Crushed it.</div>
          <p className="caption" style={{ margin: 0 }}>14,200kg · avg HR 142bpm · 51 min total</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 12, borderTop: '1px solid var(--stroke-1)' }}>
        <Metric label="VOLUME" value="14,200" unit="kg" delta="8%" deltaPositive />
        <Metric label="AVG RPE" value="7.8" sub="Target 8.0" />
      </div>
    </Card>

    {/* Progressive overload */}
    <Card padding={20}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>SQUAT · 12-WEEK TRAJECTORY</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span className="metric" style={{ fontSize: 36, fontWeight: 600 }}>140</span>
        <span style={{ fontSize: 14, color: 'var(--text-3)' }}>kg working</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--positive)', fontFamily: 'var(--font-mono)' }}>↑ 18kg</span>
      </div>
      <Sparkline data={[100, 105, 105, 110, 115, 120, 122, 128, 130, 134, 138, 140]} width={280} height={70} color="var(--accent)" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
        <span>W1</span><span>W6 (now)</span><span>W12</span>
      </div>
    </Card>

    {/* Equipment */}
    <Card padding={20}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>YOU'LL NEED</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {['Squat rack & barbell', 'Plates · 100kg total', 'Resistance band (medium)', 'Bench (optional)'].map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-2)' }}>
            <Icon name="check" size={14} color="var(--positive)"/>
            <span>{e}</span>
          </div>
        ))}
      </div>
    </Card>

    {/* Squad doing this */}
    <Card padding={20}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span className="eyebrow">SQUAD · TODAY</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>4 of 6</span>
      </div>
      {[
        { n: 'Lena V.', avi: IMG.userAvi8, status: 'done', vol: '15.2k' },
        { n: 'Tomás R.', avi: IMG.userAvi4, status: 'now', vol: 'set 3/4' },
        { n: 'Saoirse K.', avi: IMG.userAvi6, status: 'queued', vol: '—' },
        { n: 'Felix B.', avi: IMG.userAvi5, status: 'queued', vol: '—' },
      ].map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
          <Avatar src={p.avi} size={28} online={p.status === 'now'}/>
          <span style={{ flex: 1, fontSize: 13 }}>{p.n}</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: p.status === 'done' ? 'var(--positive)' : p.status === 'now' ? 'var(--accent)' : 'var(--text-3)' }}>
            {p.status === 'done' ? `✓ ${p.vol}` : p.status === 'now' ? `● ${p.vol}` : 'QUEUED'}
          </span>
        </div>
      ))}
    </Card>
  </div>
);

window.Workout = Workout;
