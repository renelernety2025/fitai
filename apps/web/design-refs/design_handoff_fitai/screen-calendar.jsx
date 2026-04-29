// FIT_AI — Calendar
// Notion-density training calendar with periodization blocks

const Calendar = () => (
  <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100%', display: 'flex' }}>
    <DashSidebar />
    <div style={{ flex: 1, minWidth: 0 }}>
      <DashTopbar />
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <CalHeader />
        <CalBlocks />
        <CalGrid />
        <CalSidebarRow />
      </div>
    </div>
  </div>
);

const CalHeader = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
    <div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>OCTOBER 2026 · MICROCYCLE 6 / 12</div>
      <div className="display-2">Hypertrophy Block</div>
      <p className="body" style={{ marginTop: 8, maxWidth: 540, fontSize: 14 }}>
        Adaptive 12-week plan · Coach Maya. Currently in week 6 — peak volume phase. Deload planned for week 8.
      </p>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      <Chip>Day</Chip>
      <Chip>Week</Chip>
      <Chip active>Month</Chip>
      <Chip>Block</Chip>
      <div style={{ width: 1, background: 'var(--stroke-2)', margin: '0 4px' }}/>
      <IconButton icon="chevron-d" variant="solid" />
      <Button size="sm" variant="glass" icon="filter">Filter</Button>
      <Button size="sm" variant="accent" icon="plus">Add session</Button>
    </div>
  </div>
);

// Periodization block bars (Notion timeline vibe)
const CalBlocks = () => {
  const phases = [
    { name: 'Anatomical Adaptation', weeks: 4, color: '#6BE3D2', start: 0, current: false },
    { name: 'Hypertrophy', weeks: 4, color: '#FF4B12', start: 4, current: true },
    { name: 'Strength', weeks: 3, color: '#FFB547', start: 8, current: false },
    { name: 'Peak / Test', weeks: 1, color: '#fff', start: 11, current: false },
  ];
  return (
    <Card padding={24}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="eyebrow">PROGRAM TIMELINE · 12 WEEKS</span>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Started Sep 2 · Ends Nov 24</span>
      </div>
      <div style={{ position: 'relative', height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-2)', borderRadius: 4 }}/>
          ))}
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 4 }}>
          {phases.map((p, i) => (
            <div key={i} style={{
              flex: p.weeks, marginLeft: i === 0 ? 0 : -4, padding: '0 12px',
              background: p.color, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              color: p.color === '#FF4B12' ? '#fff' : '#000',
              boxShadow: p.current ? '0 0 0 2px var(--bg-0), 0 0 0 3px var(--accent), 0 0 30px rgba(255,75,18,0.5)' : 'none',
            }}>
              <span>{p.name}</span>
              <span className="metric" style={{ fontSize: 11, opacity: 0.7 }}>{p.weeks}W</span>
            </div>
          ))}
        </div>
        {/* Current week marker */}
        <div style={{ position: 'absolute', top: -6, bottom: -6, left: `${(5.5 / 12) * 100}%`, width: 2, background: '#fff', boxShadow: '0 0 12px rgba(255,255,255,0.8)' }}>
          <div style={{ position: 'absolute', top: -22, left: -16, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#fff', whiteSpace: 'nowrap', background: 'var(--bg-0)', padding: '2px 6px', borderRadius: 4 }}>WEEK 6 · NOW</div>
        </div>
      </div>
    </Card>
  );
};

// Month grid
const CalGrid = () => {
  // 5 weeks × 7 days, October 2026 starts Thu
  const startOffset = 3; // Thu = index 3
  const days = Array.from({ length: 35 }).map((_, i) => {
    const date = i - startOffset + 1;
    return {
      date: date > 0 && date <= 31 ? date : null,
      offMonth: date <= 0 || date > 31,
      isToday: date === 14,
      isPast: date > 0 && date < 14,
    };
  });

  // Sample sessions per day
  const sessions = {
    1: [{t:'Push',c:'#FF4B12',vol:'4.8k'}],
    2: [{t:'Pull',c:'#FF4B12',vol:'5.2k'}],
    3: [{t:'Run · Z2',c:'#6BE3D2'}],
    5: [{t:'Lower',c:'#FF4B12',vol:'6.1k'}],
    6: [{t:'Mobility',c:'#6BE3D2'}],
    8: [{t:'Push',c:'#FF4B12',vol:'5.0k'}],
    9: [{t:'Run · Tempo',c:'#FFB547'}],
    10: [{t:'Lower',c:'#FF4B12',vol:'6.4k'},{t:'Yoga',c:'#6BE3D2'}],
    12: [{t:'Pull',c:'#FF4B12',vol:'5.6k'}],
    13: [{t:'Push · Upper',c:'#FF4B12',vol:'4.8k'}],
    14: [{t:'Lower · Power',c:'#FF4B12',vol:'6.1k', current: true}, {t:'Breathwork',c:'#6BE3D2'}],
    15: [{t:'Run · Z2',c:'#6BE3D2'}],
    16: [{t:'Pull · Volume',c:'#FF4B12',vol:'5.6k'}],
    17: [{t:'Recovery',c:'#6BE3D2'}],
    18: [{t:'Lower · Hyper',c:'#FF4B12',vol:'6.8k'}],
    20: [{t:'Push',c:'#FF4B12',vol:'5.2k'}],
    21: [{t:'Run',c:'#FFB547'}],
    22: [{t:'Pull',c:'#FF4B12',vol:'5.8k'}],
    23: [{t:'Recovery',c:'#6BE3D2'}],
    24: [{t:'Lower',c:'#FF4B12',vol:'6.6k'}],
    27: [{t:'Push',c:'#FF4B12',vol:'5.0k'}],
    28: [{t:'Run · Long',c:'#FFB547'}],
    29: [{t:'Pull',c:'#FF4B12',vol:'5.4k'}],
    30: [{t:'Lower',c:'#FF4B12',vol:'6.4k'}],
    31: [{t:'Test 1RM',c:'#fff'}],
  };

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--stroke-1)' }}>
        {['MON','TUE','WED','THU','FRI','SAT','SUN'].map((d, i) => (
          <div key={d} style={{
            padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
            letterSpacing: '0.08em', color: 'var(--text-3)',
            borderRight: i < 6 ? '1px solid var(--stroke-1)' : 'none',
          }}>{d}</div>
        ))}
      </div>
      {/* Cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(5, 132px)' }}>
        {days.map((d, i) => {
          const sess = d.date ? (sessions[d.date] || []) : [];
          return (
            <div key={i} style={{
              borderRight: (i % 7 < 6) ? '1px solid var(--stroke-1)' : 'none',
              borderBottom: i < 28 ? '1px solid var(--stroke-1)' : 'none',
              padding: 10,
              background: d.isToday ? 'rgba(255,75,18,0.04)' : 'transparent',
              opacity: d.offMonth ? 0.3 : 1,
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="metric" style={{
                  fontSize: 13, fontWeight: d.isToday ? 700 : 500,
                  color: d.isToday ? 'var(--accent)' : d.isPast ? 'var(--text-3)' : 'var(--text-1)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%',
                  background: d.isToday ? 'rgba(255,75,18,0.15)' : 'transparent',
                }}>{d.date || ''}</span>
                {sess.length > 1 && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{sess.length}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {sess.map((s, j) => (
                  <div key={j} style={{
                    padding: '4px 8px', borderRadius: 4,
                    background: s.current ? s.c : `${s.c}1a`,
                    borderLeft: `2px solid ${s.c}`,
                    fontSize: 11, color: s.current ? '#fff' : 'var(--text-1)',
                    fontWeight: s.current ? 600 : 500,
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.t}</span>
                    {s.vol && <span className="metric" style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>{s.vol}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Bottom rows: heatmap + upcoming
const CalSidebarRow = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
    <Card padding={24}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>CONSISTENCY</div>
          <div className="title">52-week training heatmap</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
          <span>LESS</span>
          {[1,2,3,4,5].map(i => <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `var(--d-${i})` }}/>)}
          <span>MORE</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gap: 2 }}>
        {Array.from({ length: 52 * 7 }).map((_, i) => {
          const intensity = Math.floor(Math.random() * 5) + 1;
          const isEmpty = Math.random() < 0.18;
          return (
            <div key={i} style={{
              aspectRatio: '1',
              background: isEmpty ? 'var(--bg-2)' : `var(--d-${intensity})`,
              borderRadius: 2,
            }}/>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
        <span>OCT 2025</span>
        <span>JAN</span>
        <span>APR</span>
        <span>JUL</span>
        <span>OCT 2026</span>
      </div>
    </Card>

    <Card padding={24}>
      <div className="eyebrow" style={{ marginBottom: 16 }}>UPCOMING · LIVE</div>
      {[
        { name: 'HIIT Friday', coach: 'Coach Maya', time: 'Today · 19:00', pp: '1,240' },
        { name: 'Long-run group', coach: 'Coach Ari', time: 'Sat · 08:00', pp: '892' },
        { name: 'Mobility flow', coach: 'Coach Kai', time: 'Sun · 09:00', pp: '410' },
      ].map((s, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 0',
          borderTop: i ? '1px solid var(--stroke-1)' : 'none',
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="play" size={14} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{s.name}</div>
            <div className="caption">{s.coach} · {s.time}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="metric" style={{ fontSize: 12 }}>{s.pp}</div>
            <div className="caption">joining</div>
          </div>
        </div>
      ))}
    </Card>
  </div>
);

window.Calendar = Calendar;
