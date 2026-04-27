'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Tag, Avatar } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { useAuth } from '@/lib/auth-context';
import {
  getFitnessProfile,
  getMyStats,
  type FitnessProfileData,
  type StatsData,
} from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FitnessProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => { document.title = 'FitAI — Profile'; }, []);

  useEffect(() => {
    getFitnessProfile().then(setProfile).catch(console.error);
    getMyStats().then(setStats).catch(console.error);
  }, []);

  const name = user?.name || 'Athlete';

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh' }}>
      <HeroBanner />
      <div style={{ padding: '0 56px', marginTop: -88, position: 'relative' }}>
        <ProfileIdentity name={name} email={user?.email} stats={stats} />
        <StatsStrip stats={stats} />
        <AchievementsRow />
        <ProfileInfo profile={profile} />
      </div>
    </div>
  );
}

function HeroBanner() {
  return (
    <div style={{
      position: 'relative', height: 280, overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--bg-1), var(--bg-3))',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 30% 40%, rgba(232,93,44,0.15), transparent 60%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 40%, var(--bg-0) 100%)',
      }} />
    </div>
  );
}

function ProfileIdentity({ name, email, stats }: { name: string; email?: string; stats: StatsData | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 32 }}>
      {/* Avatar with accent ring */}
      <div style={{ position: 'relative', width: 144, height: 144, flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          background: 'conic-gradient(var(--accent), var(--clay), var(--accent))',
        }} />
        <Avatar name={name} size={144} ring="var(--bg-0)" />
      </div>
      <div style={{ flex: 1, paddingBottom: 12 }}>
        <div className="v3-eyebrow" style={{ color: 'var(--accent)', marginBottom: 8 }}>
          Level {stats?.levelNumber ?? 1} · {stats?.totalXP ?? 0} XP
        </div>
        <h1 className="v3-display-2" style={{ margin: 0 }}>{name}</h1>
        {email && <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>{email}</div>}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost">
          <FitIcon name="users" size={14} /><span>Share profile</span>
        </Button>
        <Link href="/settings">
          <Button variant="ghost">
            <FitIcon name="settings" size={14} /><span>Settings</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

function StatsStrip({ stats }: { stats: StatsData | null }) {
  if (!stats) return null;

  const items = [
    { label: 'Streak', value: String(stats.currentStreak), unit: 'days' },
    { label: 'Sessions', value: String(stats.totalSessions), unit: 'all-time' },
    { label: 'XP', value: stats.totalXP.toLocaleString() },
    { label: 'Hours', value: String(Math.floor((stats.totalMinutes || 0) / 60)) },
    { label: 'Level', value: stats.levelName || 'Beginner' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
      {items.map((s) => (
        <Card key={s.label} padding={18}>
          <div className="v3-eyebrow" style={{ marginBottom: 6 }}>{s.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="v3-numeric" style={{ fontSize: 28, color: 'var(--text-1)' }}>{s.value}</span>
            {s.unit && <span className="v3-caption">{s.unit}</span>}
          </div>
        </Card>
      ))}
    </div>
  );
}

function AchievementsRow() {
  const placeholders = [
    { icon: 'flame', label: '30-day streak' },
    { icon: 'muscle', label: 'Bodyweight squat' },
    { icon: 'run', label: 'First 5K' },
    { icon: 'star', label: 'Goal crushed' },
    { icon: 'bolt', label: 'Speed demon' },
    { icon: 'trophy', label: 'Early bird' },
  ];

  return (
    <Card padding={24} style={{ marginBottom: 32 }}>
      <div className="v3-eyebrow" style={{ marginBottom: 14 }}>Recent achievements</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {placeholders.map((a) => (
          <div key={a.label} style={{
            padding: 16, background: 'var(--bg-2)', borderRadius: 12,
            border: '1px solid var(--stroke-1)', textAlign: 'center',
          }}>
            <FitIcon name={a.icon} size={28} color="var(--accent)" style={{ marginBottom: 8 }} />
            <div className="v3-caption">{a.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProfileInfo({ profile }: { profile: FitnessProfileData | null }) {
  if (!profile) return null;

  const GOAL_LABELS: Record<string, string> = {
    STRENGTH: 'Strength', HYPERTROPHY: 'Hypertrophy', ENDURANCE: 'Endurance',
    WEIGHT_LOSS: 'Weight Loss', GENERAL_FITNESS: 'General Fitness', MOBILITY: 'Mobility',
  };

  const fields = [
    { label: 'Goal', value: GOAL_LABELS[profile.goal] || profile.goal },
    { label: 'Experience', value: `${profile.experienceMonths} months` },
    { label: 'Training/week', value: `${profile.daysPerWeek}x` },
    profile.age ? { label: 'Age', value: `${profile.age}` } : null,
    profile.weightKg ? { label: 'Weight', value: `${profile.weightKg} kg` } : null,
    profile.heightCm ? { label: 'Height', value: `${profile.heightCm} cm` } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Card padding={28} style={{ marginBottom: 32 }}>
      <div className="v3-eyebrow" style={{ marginBottom: 16 }}>Fitness profile</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {fields.map((f) => (
          <div key={f.label} style={{ padding: 14, background: 'var(--bg-2)', borderRadius: 10 }}>
            <div className="v3-caption" style={{ marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{f.value}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
