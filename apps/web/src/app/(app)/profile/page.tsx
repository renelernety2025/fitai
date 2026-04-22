'use client';

import { useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getFitnessProfile, getMyStats, type FitnessProfileData, type StatsData } from '@/lib/api';
import { resetOnboardingTour } from '@/components/onboarding/OnboardingTour';
import { FadeIn, NumberTicker } from '@/components/v2/motion';

const GOAL_LABELS: Record<string, string> = {
  STRENGTH: 'Sila', HYPERTROPHY: 'Hypertrofie', ENDURANCE: 'Vytrvalost',
  WEIGHT_LOSS: 'Hubnuti', GENERAL_FITNESS: 'Obecna kondice', MOBILITY: 'Mobilita',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<FitnessProfileData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [tourRestarted, setTourRestarted] = useState(false);

  useEffect(() => { document.title = 'FitAI — Profil'; }, []);

  useEffect(() => {
    getFitnessProfile().then(setProfile).catch(console.error);
    getMyStats().then(setStats).catch(console.error);
  }, []);

  return (
    <V2Layout>
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white">
        &larr; Dashboard
      </Link>
      <section className="pt-12 pb-16">
        <V2SectionLabel>Tvuj ucet</V2SectionLabel>
        <div className="flex items-center gap-6">
          {/* Gradient ring avatar */}
          <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: 'conic-gradient(#A8FF00, #00E5FF, #BF5AF2, #A8FF00)' }}
            />
            <div
              className="absolute inset-[3px] flex items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: 'var(--bg-primary, #000)' }}
            >
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
          </div>
          <div>
            <V2Display size="xl">{user?.name || 'Athlete'}</V2Display>
            <p className="mt-2 text-base text-white/40">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Stats summary */}
      {stats && (
        <FadeIn delay={0.1}>
        <section className="mb-24 grid grid-cols-2 gap-y-12 sm:grid-cols-4">
          <ProfileStat value={stats.totalSessions} label="Treninku" />
          <ProfileStat value={stats.currentStreak} label="Streak" />
          <ProfileStat value={stats.totalXP} label="XP" />
          <ProfileStat value={Math.floor((stats.totalMinutes || 0) / 60)} label="Hodin" />
        </section>
        </FadeIn>
      )}

      {/* Fitness profile */}
      {profile && (
        <FadeIn delay={0.2}>
        <section className="mb-24">
          <V2SectionLabel>Fitness profil</V2SectionLabel>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <InfoCard label="Cil" value={GOAL_LABELS[profile.goal] || profile.goal} />
            <InfoCard label="Zkusenost" value={`${profile.experienceMonths} mesicu`} />
            <InfoCard label="Treninky/tyden" value={`${profile.daysPerWeek}x`} />
            <InfoCard label="Delka treninku" value={`${profile.sessionMinutes} min`} />
            {profile.age && <InfoCard label="Vek" value={`${profile.age} let`} />}
            {profile.weightKg && <InfoCard label="Vaha" value={`${profile.weightKg} kg`} />}
            {profile.heightCm && <InfoCard label="Vyska" value={`${profile.heightCm} cm`} />}
            {profile.equipment.length > 0 && (
              <InfoCard label="Vybaveni" value={profile.equipment.join(', ')} />
            )}
            {profile.injuries.length > 0 && (
              <InfoCard label="Zraneni/omezeni" value={profile.injuries.join(', ')} accent="#FF375F" />
            )}
            {profile.dailyKcal && (
              <InfoCard label="Denni kalorie" value={`${profile.dailyKcal} kcal`} />
            )}
          </div>
        </section>
        </FadeIn>
      )}

      {/* Level info */}
      {stats && (
        <FadeIn delay={0.3}>
        <section className="mb-24">
          <V2SectionLabel>Level</V2SectionLabel>
          <V2Display size="lg">{stats.levelName || 'Zacatecnik'}</V2Display>
          <div className="mt-4 h-2 w-full max-w-md rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#A8FF00] transition-all"
              style={{ width: `${Math.min(100, (stats.totalXP % 500) / 5)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-white/30">
            {stats.totalXP} XP celkem
          </p>
        </section>
        </FadeIn>
      )}

      {/* Restart onboarding tour */}
      <section className="mb-24">
        <V2SectionLabel>Pruvodce</V2SectionLabel>
        {tourRestarted ? (
          <p className="text-sm text-[#A8FF00]">Pruvodce restartovan. Prejdi na dashboard.</p>
        ) : (
          <button
            onClick={() => {
              resetOnboardingTour();
              setTourRestarted(true);
            }}
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            Spustit pruvodce znovu
          </button>
        )}
      </section>
    </V2Layout>
  );
}

function ProfileStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div
        className="font-bold tracking-tight tabular-nums"
        style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-primary)' }}
      >
        <NumberTicker value={value} />
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </div>
      <div
        className="mt-1 text-base font-semibold"
        style={{ color: accent ?? 'white' }}
      >
        {value}
      </div>
    </div>
  );
}
