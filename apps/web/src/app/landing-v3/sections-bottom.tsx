'use client';

import React from 'react';
import { IMG, AVATARS, AvatarStack, LogoMark, RingProgress } from './shared';

// -- FEATURE GRID --

export function FeatureGrid() {
  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 40px 100px' }}>
      <div style={{ marginBottom: 56 }}>
        <div className="lv3-eyebrow" style={{ marginBottom: 16, color: 'var(--accent-hot)' }}>
          What&apos;s inside
        </div>
        <h2 className="lv3-display-2" style={{ margin: 0, maxWidth: 760 }}>
          One membership.<br />
          <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>Everything you need.</span>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, gridAutoRows: 240 }}>
        <AICoachCard />
        <CalendarCard />
        <ProgressCard />
        <LiveClassesCard />
        <CommunityCard />
      </div>
    </div>
  );
}

function AICoachCard() {
  const tags = ['Form check', 'Adaptive plan', 'Voice coaching', 'Auto-progression', 'Recovery sync'];
  return (
    <div className="lv3-card" style={{
      gridColumn: 'span 4', gridRow: 'span 2',
      background: 'linear-gradient(145deg, #1a0d05 0%, var(--bg-card) 65%)',
      border: '1px solid rgba(232,93,44,0.18)',
      position: 'relative', overflow: 'hidden', padding: 36,
    }}>
      <div style={{
        position: 'absolute', right: -120, top: -120,
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,93,44,0.32) 0%, transparent 65%)',
      }} />
      <div style={{ position: 'relative' }}>
        <div className="lv3-eyebrow" style={{ color: 'var(--accent-hot)', marginBottom: 18 }}>&#9670; AI coach</div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 52,
          lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 22,
          maxWidth: 540, color: 'var(--text-1)',
        }}>
          Personal training,<br />
          <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 400 }}>at your pace.</span>
        </div>
        <p style={{ maxWidth: 480, fontSize: 15, lineHeight: 1.6, color: 'var(--text-2)' }}>
          Real-time form correction. A plan that adapts to your sleep, soreness, and schedule.
          Encouragement that knows when to push and when to hold back.
        </p>
        <div style={{ marginTop: 28, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tags.map(t => (
            <span key={t} style={{
              padding: '7px 14px', borderRadius: 999,
              background: 'rgba(232,93,44,0.10)', border: '1px solid rgba(232,93,44,0.25)',
              fontSize: 11, color: 'var(--accent-hot)',
              letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarCard() {
  const intensity = [0, 0, 1, 2, 0, 3, 4, 1, 0, 2, 3, 4, 5, 0, 0, 2, 3, 1, 4, 5, 0, 1, 2, 3, 0, 4, 0, 0, 2, 3, 4, 1, 0, 0, 0];
  return (
    <div className="lv3-card" style={{ gridColumn: 'span 2', gridRow: 'span 1', padding: 24 }}>
      <div className="lv3-eyebrow">Calendar</div>
      <div style={{ fontFamily: 'var(--font-display-alt)', fontWeight: 500, fontSize: 22, marginTop: 8, marginBottom: 16 }}>
        Your year in blocks.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {intensity.map((v, i) => (
          <div key={i} style={{
            aspectRatio: '1', borderRadius: 3,
            background: `var(--d-${Math.max(1, v)})`,
            opacity: v === 0 ? 0.4 : 1,
          }} />
        ))}
      </div>
    </div>
  );
}

function ProgressCard() {
  const data = [12, 18, 14, 22, 19, 28, 24, 32, 30, 38, 34, 42];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 220;
  const h = 60;
  const pts = data.map((v, i) => [
    i / (data.length - 1) * w, h - ((v - min) / range) * (h - 4) - 2,
  ]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  return (
    <div className="lv3-card" style={{ gridColumn: 'span 2', gridRow: 'span 1', padding: 24 }}>
      <div className="lv3-eyebrow">Progress</div>
      <div style={{ fontFamily: 'var(--font-display-alt)', fontWeight: 500, fontSize: 22, marginTop: 8, marginBottom: 16 }}>
        See yourself improve.
      </div>
      <svg width={w} height={h} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="lv3-spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#lv3-spark)" />
        <path d={d} stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span className="lv3-meta">12 weeks</span>
        <span style={{ fontSize: 11, color: 'var(--sage)', fontWeight: 600 }}>&#8593; +248%</span>
      </div>
    </div>
  );
}

function LiveClassesCard() {
  return (
    <div className="lv3-card" style={{
      gridColumn: 'span 3', gridRow: 'span 1', padding: 0,
      overflow: 'hidden', position: 'relative', minHeight: 240,
    }}>
      <img src={IMG.actionYoga} alt="" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', opacity: 0.5, filter: 'saturate(0.75)',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--bg-card) 0%, rgba(20,17,13,0.4) 100%)' }} />
      <div style={{ position: 'relative', padding: 32, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="lv3-eyebrow" style={{ color: 'var(--sage)', marginBottom: 12 }}>&#9679; Now in session</div>
          <div style={{ fontFamily: 'var(--font-display-alt)', fontWeight: 500, fontSize: 32, lineHeight: 1.08, maxWidth: 340 }}>
            Move with 40,000 others. <span style={{ color: 'var(--clay)', fontStyle: 'italic' }}>Right now.</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="lv3-btn-primary" style={{ padding: '10px 18px', fontSize: 12 }}>&#9654; Join live</button>
          <button className="lv3-btn-outline" style={{ padding: '10px 18px', fontSize: 12 }}>See schedule</button>
        </div>
      </div>
    </div>
  );
}

function CommunityCard() {
  return (
    <div className="lv3-card" style={{ gridColumn: 'span 3', gridRow: 'span 1', padding: 24 }}>
      <div className="lv3-eyebrow">Community</div>
      <div style={{ fontFamily: 'var(--font-display-alt)', fontWeight: 500, fontSize: 22, marginTop: 8, marginBottom: 18 }}>
        Train with friends. <span style={{ color: 'var(--clay)', fontStyle: 'italic' }}>Cheer each other on.</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <AvatarStack avatars={AVATARS} size={36} />
        <div style={{ flex: 1 }}>
          <div className="lv3-meta">Squad rank</div>
          <div className="lv3-numeric" style={{ fontSize: 26 }}>
            3<span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 6 }}>of 1,420</span>
          </div>
        </div>
        <RingProgress value={72} size={56} />
      </div>
    </div>
  );
}

// -- METRICS BAR --

export function MetricsBar() {
  const metrics = [
    { v: '2.4M', label: 'Active members', sub: 'In 142 countries' },
    { v: '184M', label: 'Sessions completed', sub: 'And counting' },
    { v: '92%', label: 'Stay 90+ days', sub: 'Industry leading' },
    { v: '4.9', label: 'App Store', sub: '89,420 reviews' },
  ];
  return (
    <div style={{ borderTop: '1px solid var(--stroke-1)', borderBottom: '1px solid var(--stroke-1)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ padding: '64px 40px', borderRight: i < 3 ? '1px solid var(--stroke-1)' : 'none' }}>
            <div className="lv3-numeric" style={{ fontSize: 64, marginBottom: 14 }}>{m.v}</div>
            <div style={{ fontSize: 14, color: 'var(--text-1)', marginBottom: 4, fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -- PRICING --

const PLANS = [
  { name: 'Free', price: '0', period: '14 days, no card', accent: false, perks: ['Full member access', 'Cancel anytime', 'No credit card', 'Welcome session with a coach'] },
  { name: 'Member', price: '14.99', period: 'per month', accent: true, perks: ['Unlimited training', 'All 180 coaches', 'AI form check', 'Adaptive plan', 'Live classes daily', 'Apple Health \u00b7 Garmin \u00b7 Whoop'] },
  { name: 'Family', price: '24.99', period: 'per month \u00b7 up to 6', accent: false, perks: ['Everything in Member', 'Family management', 'Shared challenges', 'Family leaderboard', 'Priority coach replies'] },
];

export function Pricing() {
  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <div className="lv3-eyebrow" style={{ marginBottom: 16, color: 'var(--accent-hot)' }}>Membership</div>
        <h2 className="lv3-display-2" style={{ margin: '0 auto', maxWidth: 720 }}>
          Less than a single<br />
          <span style={{ color: 'var(--clay)', fontStyle: 'italic', fontWeight: 300 }}>personal training session.</span>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, maxWidth: 1140, margin: '0 auto' }}>
        {PLANS.map((p) => <PricingCard key={p.name} plan={p} />)}
      </div>
    </div>
  );
}

function PricingCard({ plan }: { plan: typeof PLANS[number] }) {
  const ctaLabel = plan.name === 'Free' ? 'Start free' : plan.name === 'Member' ? 'Start 14-day trial' : 'Set up family';
  return (
    <div className="lv3-card" style={{
      padding: 36,
      background: plan.accent ? 'linear-gradient(180deg, #1a0d05 0%, var(--bg-card) 70%)' : 'var(--bg-card)',
      border: plan.accent ? '1px solid rgba(232,93,44,0.32)' : '1px solid var(--stroke-1)',
      position: 'relative', overflow: 'hidden',
    }}>
      {plan.accent && (
        <div style={{
          position: 'absolute', top: 24, right: 24, padding: '4px 11px', borderRadius: 999,
          background: 'var(--accent)', fontSize: 10, color: '#fff',
          fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>Most popular</div>
      )}
      <div style={{ fontSize: 13, color: 'var(--text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>{plan.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0 6px' }}>
        <span className="lv3-numeric" style={{ fontSize: 64 }}>${plan.price}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 32 }}>{plan.period}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {plan.perks.map((perk) => (
          <div key={perk} style={{ display: 'flex', alignItems: 'baseline', gap: 12, fontSize: 14, color: 'var(--text-2)' }}>
            <span style={{ color: plan.accent ? 'var(--accent)' : 'var(--sage)', fontSize: 11 }}>&#10003;</span>
            {perk}
          </div>
        ))}
      </div>
      <button
        className={plan.accent ? 'lv3-btn-primary' : 'lv3-btn-outline'}
        style={{ width: '100%', justifyContent: 'center', padding: '14px 0', fontSize: 13 }}
      >{ctaLabel}</button>
    </div>
  );
}

// -- FOOTER --

const FOOTER_COLS = [
  { h: 'Train', items: ['Programs', 'Live classes', 'Coaches', 'AI Coach', 'Recovery'] },
  { h: 'Community', items: ['Feed', 'Squads', 'Challenges', 'Leaderboards'] },
  { h: 'Studio', items: ['About', 'Coaches', 'Press', 'Journal'] },
  { h: 'Support', items: ['Help center', 'Contact', 'Privacy', 'Terms'] },
];

export function Footer() {
  return (
    <div style={{ borderTop: '1px solid var(--stroke-1)', padding: '72px 40px 40px', background: 'var(--bg-1)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
          <div>
            <LogoMark size={22} />
            <p style={{ marginTop: 20, maxWidth: 320, fontSize: 14, lineHeight: 1.6, color: 'var(--text-2)' }}>
              Coaching for every body, every level, every day. Welcome.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button className="lv3-btn-outline" style={{ padding: '10px 18px', fontSize: 12 }}>App Store</button>
              <button className="lv3-btn-outline" style={{ padding: '10px 18px', fontSize: 12 }}>&#9654; Google Play</button>
            </div>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.h}>
              <div className="lv3-eyebrow" style={{ marginBottom: 18 }}>{col.h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.items.map(item => (
                  <span key={item} style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          borderTop: '1px solid var(--stroke-1)', paddingTop: 28,
          display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)',
        }}>
          <span>&copy; 2026 FIT_AI Studio. Built for everyone.</span>
          <span>v4.2 &middot; build 28104</span>
        </div>
      </div>
    </div>
  );
}
