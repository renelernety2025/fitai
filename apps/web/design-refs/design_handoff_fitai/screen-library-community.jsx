// FIT_AI — Coach library (MasterClass-style) + Community feed combined module

const Library = () => (
  <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100%', display: 'flex' }}>
    <DashSidebar />
    <div style={{ flex: 1, minWidth: 0 }}>
      <DashTopbar />
      <LibHero />
      <LibFilters />
      <LibFeatured />
      <LibCategories />
      <LibAllCoaches />
    </div>
  </div>
);

const LibHero = () => (
  <div style={{ position: 'relative', height: 380, overflow: 'hidden', borderBottom: '1px solid var(--stroke-1)' }}>
    <div style={{ display: 'flex', position: 'absolute', inset: 0 }}>
      {[IMG.coachAlex, IMG.coachLena, IMG.coachOmar, IMG.coachJulien].map((src, i) => (
        <div key={i} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.7) contrast(1.1) brightness(0.5)' }}/>
        </div>
      ))}
    </div>
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,7,10,0.4) 0%, rgba(7,7,10,0.7) 60%, var(--bg-0) 100%)' }}/>
    <div style={{ position: 'relative', padding: '80px 32px', maxWidth: 1200 }}>
      <div className="eyebrow" style={{ marginBottom: 16, color: 'var(--accent-hot)' }}>◉ THE FACULTY · 184 COACHES</div>
      <div className="display-1" style={{ fontSize: 96, lineHeight: 0.92, marginBottom: 16 }}>
        World-class. <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--text-2)' }}>On demand.</span>
      </div>
      <p className="body" style={{ fontSize: 16, maxWidth: 540 }}>
        Olympians, world-record holders, sport scientists. Their programs, their voice, their corrections — adapted to your body in real time.
      </p>
    </div>
  </div>
);

const LibFilters = () => (
  <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--stroke-1)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
    {['All', 'Strength', 'Hypertrophy', 'Running', 'Mobility', 'Boxing', 'HIIT', 'Yoga', 'Pilates', 'Recovery'].map((c, i) => (
      <Chip key={c} active={i === 0}>{c}</Chip>
    ))}
    <div style={{ flex: 1 }}/>
    <Chip icon="filter">Filter</Chip>
    <Chip icon="sort">Trending</Chip>
  </div>
);

const LibFeatured = () => (
  <div style={{ padding: '40px 32px' }}>
    <SectionHeader eyebrow="EDITOR'S PICK" title="This week's feature." />
    <Card padding={0} style={{ overflow: 'hidden', position: 'relative', minHeight: 420 }}>
      <img src={IMG.coachAlex} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', filter: 'saturate(0.85) contrast(1.1)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(7,7,10,0.95) 0%, rgba(7,7,10,0.6) 50%, transparent 80%)' }}/>
      <div style={{ position: 'relative', padding: 56, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 640 }}>
        <Tag color="var(--accent)" style={{ marginBottom: 20, alignSelf: 'flex-start' }}>NEW SERIES · 8 EPISODES</Tag>
        <div className="display-1" style={{ fontSize: 72, lineHeight: 0.92, marginBottom: 20 }}>
          The Olympic<br/>
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Squat.</span>
        </div>
        <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 28, maxWidth: 480 }}>
          Alex Reyes — 3× world champion, 4× Olympian — breaks down his exact warm-up, lift, and cooldown over 8 episodes. The first masterclass that adapts the cues to your form, in real time.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button variant="accent" size="lg" icon="play">Watch episode 1</Button>
          <Button variant="glass" size="lg">Add to plan</Button>
          <div style={{ marginLeft: 16, fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>● 12,420 NOW WATCHING</div>
        </div>
      </div>
    </Card>
  </div>
);

const LibCategories = () => {
  const cats = [
    { title: 'Pure strength', items: [
      { name: 'Pull · Volume', coach: 'Lena V.', img: IMG.actionDeadlift, dur: '46m', tag: 'Hypertrophy' },
      { name: 'Push · Heavy', coach: 'Alex R.', img: IMG.actionLift, dur: '52m', tag: 'Strength' },
      { name: 'Lower · Power', coach: 'Maya S.', img: IMG.actionGym, dur: '54m', tag: 'Strength', current: true },
      { name: 'Full-body fundamentals', coach: 'Julien M.', img: IMG.actionKettle, dur: '38m', tag: 'Strength' },
    ]},
    { title: 'Cardio · Running', items: [
      { name: 'Track intervals', coach: 'Ari O.', img: IMG.actionTrack, dur: '32m', tag: 'Speed' },
      { name: 'Long zone-2', coach: 'Julien M.', img: IMG.actionRun, dur: '64m', tag: 'Endurance' },
      { name: 'Hill repeats', coach: 'Ari O.', img: IMG.actionRun, dur: '28m', tag: 'Power' },
      { name: 'Recovery jog', coach: 'Ari O.', img: IMG.actionRun, dur: '20m', tag: 'Easy' },
    ]},
  ];
  return (
    <div style={{ padding: '32px 32px 0' }}>
      {cats.map((cat, ci) => (
        <div key={ci} style={{ marginBottom: 48 }}>
          <SectionHeader eyebrow={`COLLECTION ${String(ci + 1).padStart(2, '0')}`} title={cat.title} action="See all" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {cat.items.map((it, i) => (
              <Card key={i} padding={0} hover style={{ overflow: 'hidden', minHeight: 280, position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                  <img src={it.img} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}/>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)' }}/>
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                    {it.current && <Tag color="var(--accent)">IN PLAN</Tag>}
                    <Tag>{it.tag}</Tag>
                  </div>
                  <div style={{ position: 'absolute', bottom: 12, right: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4 }}>{it.dur}</div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{it.name}</div>
                  <div className="caption">with {it.coach}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const LibAllCoaches = () => (
  <div style={{ padding: '0 32px 64px' }}>
    <SectionHeader eyebrow="ALL COACHES" title="The roster." action="Browse 184" />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
      {[
        { n: 'Alex Reyes', d: 'Strength', img: IMG.coachAlex, count: 42 },
        { n: 'Maya Sato', d: 'Hypertrophy', img: IMG.coachMaya, count: 38 },
        { n: 'Kai Bergman', d: 'Mobility', img: IMG.coachKai, count: 28 },
        { n: 'Lena Volkov', d: 'Powerlifting', img: IMG.coachLena, count: 24 },
        { n: 'Julien Marsh', d: 'Endurance', img: IMG.coachJulien, count: 36 },
        { n: 'Ari Okafor', d: 'Running', img: IMG.coachAri, count: 22 },
      ].map((c, i) => (
        <div key={i} style={{ position: 'relative', aspectRatio: '3/4', borderRadius: 'var(--r-md)', overflow: 'hidden', cursor: 'pointer' }}>
          <img src={c.img} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9)' }}/>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)' }}/>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
            <div className="caption" style={{ marginBottom: 4 }}>{c.d} · {c.count} programs</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.015em' }}>{c.n}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

window.Library = Library;

// ─── Community feed ──────────────────────────────────────────
const Community = () => (
  <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100%', display: 'flex' }}>
    <DashSidebar />
    <div style={{ flex: 1, minWidth: 0 }}>
      <DashTopbar />
      <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, maxWidth: 1280, margin: '0 auto' }}>
        <CommFeed />
        <CommSide />
      </div>
    </div>
  </div>
);

const FEED = [
  { name: 'Lena Volkov', avi: IMG.userAvi8, time: '12 min ago', squad: 'Morning Lifters', kind: 'pr', text: 'New back-squat PR. 3-year goal, finally crossed.', stats: { mv: 'Back Squat', val: '155kg', delta: '+5kg' }, img: IMG.feedMirror, likes: 142, comments: 28 },
  { name: 'Tomás Reyes', avi: IMG.userAvi4, time: '1h ago', squad: 'Run Club Berlin', kind: 'workout', text: 'Long run logged. Legs are jelly. Worth it.', stats: { mv: '21.4km · 1:48:32', val: '5:04 /km', delta: '142 BPM avg' }, likes: 84, comments: 12 },
  { name: 'Saoirse Kelly', avi: IMG.userAvi6, time: '3h ago', squad: 'Pull Day Crew', kind: 'streak', text: 'Day 100 done. Started this on a whim in July. Still here. Still going.', img: IMG.feedSweat, likes: 421, comments: 67 },
];

const CommFeed = () => (
  <div>
    <div style={{ marginBottom: 24 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>COMMUNITY · WORLDWIDE</div>
      <div className="display-2">The feed.</div>
    </div>

    {/* Composer */}
    <Card padding={20} style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar src={IMG.userAvi1} size={36} />
        <div style={{ flex: 1, fontSize: 14, color: 'var(--text-3)' }}>Share your session, your PR, your wins…</div>
        <Button size="sm" variant="glass" icon="dumbbell">Workout</Button>
        <Button size="sm" variant="glass" icon="trophy">PR</Button>
        <Button size="sm" variant="accent">Post</Button>
      </div>
    </Card>

    {/* Tabs */}
    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
      <Chip active>Following</Chip>
      <Chip>Squads</Chip>
      <Chip>Worldwide</Chip>
      <Chip>Coaches</Chip>
    </div>

    {/* Feed posts */}
    {FEED.map((p, i) => (
      <Card key={i} padding={0} style={{ marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={p.avi} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</span>
              {p.kind === 'pr' && <Tag color="var(--accent)">NEW PR</Tag>}
              {p.kind === 'streak' && <Tag color="#FFB547">100-DAY</Tag>}
            </div>
            <div className="caption">in {p.squad} · {p.time}</div>
          </div>
          <IconButton icon="more" size={32} variant="plain"/>
        </div>

        <div style={{ padding: '0 24px 16px' }}>
          <p style={{ fontSize: 15, color: 'var(--text-1)', margin: 0, lineHeight: 1.5 }}>{p.text}</p>
        </div>

        {p.stats && (
          <div style={{ margin: '0 24px 16px', padding: 16, background: 'var(--bg-2)', borderRadius: 'var(--r-md)', display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{p.kind === 'pr' ? 'LIFT' : 'DISTANCE · TIME'}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.stats.mv}</div>
            </div>
            <div style={{ width: 1, background: 'var(--stroke-1)' }}/>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>RESULT</div>
              <div className="metric" style={{ fontSize: 22, fontWeight: 600 }}>{p.stats.val}</div>
            </div>
            <div style={{ width: 1, background: 'var(--stroke-1)' }}/>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>DELTA</div>
              <div className="metric" style={{ fontSize: 14, color: 'var(--positive)', fontWeight: 600 }}>{p.stats.delta}</div>
            </div>
          </div>
        )}

        {p.img && (
          <div style={{ position: 'relative', maxHeight: 480, overflow: 'hidden' }}>
            <img src={p.img} style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }}/>
          </div>
        )}

        <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 20, borderTop: '1px solid var(--stroke-1)' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
            <Icon name="heart" size={16}/>
            <span className="metric">{p.likes}</span>
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
            <Icon name="message" size={16}/>
            <span className="metric">{p.comments}</span>
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', marginLeft: 'auto' }}>
            <Icon name="bolt" size={16}/>
            <span>High-five</span>
          </button>
        </div>
      </Card>
    ))}
  </div>
);

const CommSide = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <Card padding={20}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>WEEKLY CHALLENGE</div>
      <div className="title" style={{ marginBottom: 8 }}>10,000 squats, worldwide.</div>
      <p className="caption" style={{ marginBottom: 16, lineHeight: 1.5 }}>Add yours. We're at 84,210 of 100,000 by Sunday 23:59 UTC.</p>
      <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ width: '84%', height: '100%', background: 'var(--accent)', borderRadius: 3 }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>
        <span>84,210</span><span>of 100,000</span>
      </div>
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--stroke-1)' }}>
        <Button size="sm" variant="accent" full>Join challenge</Button>
      </div>
    </Card>

    <Card padding={20}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>TRENDING SQUADS</div>
      {[
        { name: 'Morning Lifters', members: 1420, growth: '+24%' },
        { name: 'Run Club Berlin', members: 892, growth: '+18%' },
        { name: 'Pull Day Crew', members: 640, growth: '+12%' },
        { name: 'Yoga · Sunrise', members: 412, growth: '+8%' },
      ].map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: i ? '1px solid var(--stroke-1)' : 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="users" size={14} color="var(--text-2)"/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{s.name}</div>
            <div className="caption">{s.members.toLocaleString()} members</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--positive)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{s.growth}</span>
        </div>
      ))}
    </Card>

    <Card padding={20}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>ACTIVE NOW</div>
      <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 12px' }}>
        <span className="metric" style={{ color: 'var(--text-1)', fontWeight: 600 }}>184,302</span> athletes are training right now.
      </p>
      <AvatarStack avatars={[IMG.userAvi1, IMG.userAvi2, IMG.userAvi3, IMG.userAvi4, IMG.userAvi5, IMG.userAvi6, IMG.userAvi7]} size={28} max={6}/>
    </Card>
  </div>
);

window.Community = Community;
