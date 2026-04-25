'use client';

import { useState, useEffect } from 'react';

interface BodySystemProps {
  recoveryScore: number;  // 0-100
  streak: number;
  avgFormScore: number;
  todayCheckedIn: boolean;
  lastWorkoutDaysAgo: number;
}

function getSystemStatus(recovery: number): {
  label: string; color: string; glow: string; bg: string;
} {
  if (recovery >= 80) return {
    label: 'Optimal', color: '#00FF88', glow: '#00FF8840',
    bg: 'radial-gradient(ellipse at 50% 30%, #00FF8808 0%, transparent 70%)',
  };
  if (recovery >= 50) return {
    label: 'Active', color: '#FFB800', glow: '#FFB80030',
    bg: 'radial-gradient(ellipse at 50% 30%, #FFB80006 0%, transparent 70%)',
  };
  return {
    label: 'Recovery', color: '#FF3B5C', glow: '#FF3B5C30',
    bg: 'radial-gradient(ellipse at 50% 30%, #FF3B5C06 0%, transparent 70%)',
  };
}

function MetricCard({ value, unit, label, color }: {
  value: string; unit: string; label: string; color: string;
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '16px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)',
        textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{
          fontSize: 28, fontWeight: 800, color,
          textShadow: `0 0 20px ${color}40`,
          letterSpacing: '-0.02em',
        }}>
          {value}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function BodySystemStatus({
  recoveryScore, streak, avgFormScore, todayCheckedIn, lastWorkoutDaysAgo,
}: BodySystemProps) {
  const sys = getSystemStatus(recoveryScore);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      background: sys.bg,
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 24, padding: '28px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle animated glow */}
      <div style={{
        position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
        width: 200, height: 200, borderRadius: '50%',
        background: sys.glow, filter: 'blur(60px)',
        opacity: pulse ? 0.6 : 0.3, transition: 'opacity 2s ease',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)',
          }}>
            System Status
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 10px',
            borderRadius: 20, color: sys.color,
            background: `${sys.color}15`, border: `1px solid ${sys.color}30`,
          }}>
            {todayCheckedIn ? 'Checked in' : 'Pending check-in'}
          </span>
        </div>

        {/* Big status */}
        <h2 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
          fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1,
          marginTop: 12, color: 'white',
        }}>
          System Status:{' '}
          <span style={{ color: sys.color, textShadow: `0 0 30px ${sys.glow}` }}>
            {sys.label}
          </span>
        </h2>

        {/* Recovery score big number */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 16,
        }}>
          <span style={{
            fontSize: 64, fontWeight: 900, color: sys.color,
            textShadow: `0 0 40px ${sys.glow}`,
            letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            {recoveryScore}
          </span>
          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            / 100 recovery
          </span>
        </div>

        {/* Metrics grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8, marginTop: 20,
        }}>
          <MetricCard
            value={String(streak)} unit="dní"
            label="Streak" color="#FF9F0A"
          />
          <MetricCard
            value={String(Math.round(avgFormScore))} unit="%"
            label="Avg Form" color="#00E5FF"
          />
          <MetricCard
            value={lastWorkoutDaysAgo === 0 ? 'Dnes' : String(lastWorkoutDaysAgo)}
            unit={lastWorkoutDaysAgo === 0 ? '' : 'd ago'}
            label="Poslední trénink" color="#A8FF00"
          />
        </div>

        {/* Motivational message */}
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6, marginTop: 16,
        }}>
          {recoveryScore >= 80
            ? 'Tvoje tělo je připravené na maximální výkon. Push it!'
            : recoveryScore >= 50
            ? 'Solidní stav. Trénuj normálně, poslouchej tělo.'
            : 'Tělo potřebuje regeneraci. Zaměř se na stretching a spánek.'}
        </p>
      </div>
    </div>
  );
}
