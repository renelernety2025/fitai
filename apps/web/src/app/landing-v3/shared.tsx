'use client';

import React from 'react';

// -- Image URLs (from design handoff) --
export const IMG = {
  heroLift: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=2400&q=85&auto=format&fit=crop',
  coachAri: 'https://images.unsplash.com/photo-1508215302842-7d1899e85b71?w=900&q=80&auto=format&fit=crop',
  coachMaya: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80&auto=format&fit=crop',
  coachKai: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=900&q=80&auto=format&fit=crop',
  coachLena: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80&auto=format&fit=crop',
  coachJulien: 'https://images.unsplash.com/photo-1530021232320-687d8e3dba54?w=900&q=80&auto=format&fit=crop',
  coachAlex: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=900&q=80&auto=format&fit=crop',
  actionYoga: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1600&q=80&auto=format&fit=crop',
  userAvi1: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop&crop=face',
  userAvi2: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop&crop=face',
  userAvi3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop&crop=face',
  userAvi4: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop&crop=face',
  userAvi5: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&q=80&auto=format&fit=crop&crop=face',
};

export const AVATARS = [IMG.userAvi1, IMG.userAvi2, IMG.userAvi3, IMG.userAvi4, IMG.userAvi5];

export function AvatarStack({ avatars, size = 32 }: { avatars: string[]; size?: number }) {
  return (
    <div style={{ display: 'flex' }}>
      {avatars.map((src, i) => (
        <div key={i} style={{
          marginLeft: i ? -(size / 3) : 0,
          border: '2px solid var(--bg-1)',
          borderRadius: '50%',
        }}>
          <img
            src={src} alt="" width={size} height={size}
            style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      ))}
    </div>
  );
}

export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#fff' }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 28 28" fill="none">
        <path d="M5 5h18v3.5H9V13h12v3.5H9V23H5z" fill="#fff" />
        <circle cx="23" cy="20" r="3" fill="var(--accent)" />
      </svg>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: size * 0.72, letterSpacing: '-0.02em', lineHeight: 1,
      }}>
        FIT<span style={{ color: 'var(--accent)' }}>_</span>AI
      </span>
    </div>
  );
}

export function RingProgress({ value, size }: { value: number; size: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--bg-3)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--accent)" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600 }}>{value}%</div>
        <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>W4</div>
      </div>
    </div>
  );
}
