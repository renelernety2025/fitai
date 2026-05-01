'use client';

/**
 * Battle Pass / Season — level track, missions, rewards.
 * Horizontal scrollable timeline + mission list.
 */

import { useEffect, useState, useRef } from 'react';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { Confetti } from '@/components/v2/Confetti';
import { getCurrentSeason, joinSeason, checkSeasonMissions } from '@/lib/api';

interface Mission {
  id: string;
  title: string;
  current: number;
  target: number;
  xpReward: number;
  completed: boolean;
  locked: boolean;
}

interface SeasonData {
  name: string;
  level: number;
  maxLevel: number;
  currentXP: number;
  nextLevelXP: number;
  joined: boolean;
  endsAt: string;
  missions: Mission[];
}

function daysRemaining(endsAt: string): number {
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86400000));
}

function LevelTrack({
  level,
  maxLevel,
}: {
  level: number;
  maxLevel: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null!);
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  useEffect(() => {
    if (trackRef.current) {
      const el = trackRef.current.querySelector(`[data-level="${level}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [level]);

  return (
    <div ref={trackRef} className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {levels.map((l) => {
        const past = l < level;
        const current = l === level;
        const future = l > level;
        return (
          <div
            key={l}
            data-level={l}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums transition-all"
            style={current
              ? { borderColor: 'var(--sage)', background: 'color-mix(in srgb, var(--sage) 20%, transparent)', color: 'var(--sage)', boxShadow: '0 0 24px color-mix(in srgb, var(--sage) 26%, transparent)' }
              : past
              ? { borderColor: 'color-mix(in srgb, var(--sage) 40%, transparent)', background: 'color-mix(in srgb, var(--sage) 10%, transparent)', color: 'color-mix(in srgb, var(--sage) 60%, transparent)' }
              : { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.2)' }}
          >
            {l}
          </div>
        );
      })}
    </div>
  );
}

function MissionCard({
  mission,
  isNew,
}: {
  mission: Mission;
  isNew: boolean;
}) {
  const pct = mission.target > 0 ? (mission.current / mission.target) * 100 : 0;
  return (
    <div
      className={`rounded-xl border p-5 transition ${
        mission.locked ? 'border-white/5 opacity-40' : !mission.completed ? 'border-white/10' : ''
      } ${isNew ? 'animate-pulse' : ''}`}
      style={mission.completed ? { borderColor: 'color-mix(in srgb, var(--sage) 20%, transparent)', background: 'color-mix(in srgb, var(--sage) 5%, transparent)' } : undefined}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`text-sm font-semibold ${mission.completed ? 'line-through' : ''} ${mission.locked ? 'text-white/30' : !mission.completed ? 'text-white' : ''}`}
          style={mission.completed ? { color: 'var(--sage)' } : undefined}
        >
          {mission.completed && '\u2713 '}{mission.title}
        </span>
        <span className="rounded-full px-3 py-1 text-[10px] font-bold" style={{ background: 'color-mix(in srgb, var(--warning) 15%, transparent)', color: 'var(--warning)' }}>
          +{mission.xpReward} XP
        </span>
      </div>
      {!mission.completed && !mission.locked && (
        <>
          <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ backgroundColor: 'var(--sage)', width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <div className="text-[10px] tabular-nums text-white/40">
            {mission.current} / {mission.target}
          </div>
        </>
      )}
    </div>
  );
}

export default function SeasonPage() {
  const [data, setData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [checking, setChecking] = useState(false);
  const [newlyCompleted, setNewlyCompleted] = useState<string[]>([]);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { document.title = 'FitAI — Season'; }, []);

  useEffect(() => {
    getCurrentSeason()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      const d = await joinSeason();
      setData(d);
    } catch {
      setError('Nepodarilo se pripojit k sezone');
    }
    setJoining(false);
  }

  async function handleCheck() {
    setChecking(true);
    setError(null);
    try {
      const result = await checkSeasonMissions();
      if (result.completed && result.completed.length > 0) {
        setNewlyCompleted(result.completed.map((m: Mission) => m.id));
        setConfettiTrigger(true);
        setTimeout(() => setConfettiTrigger(false), 100);
      }
      const fresh = await getCurrentSeason();
      setData(fresh);
    } catch {
      setError('Nepodarilo se zkontrolovat mise');
    }
    setChecking(false);
  }

  return (
    <>
      <Confetti trigger={confettiTrigger} />
      <section className="pt-12 pb-24">
        <p className="v3-eyebrow">Sezona</p>

        {error && (
          <div className="mb-6 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-6 py-4 text-sm text-[var(--accent)]">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[var(--sage)]" />
          </div>
        )}

        {!loading && data && (
          <>
            {/* Hero */}
            <h1
              className="mb-2 font-bold tracking-tight text-white"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.04em', lineHeight: 1 }}
            >
              {data.name}
            </h1>
            <div className="mb-8 flex items-baseline gap-3">
              <span
                className="font-bold tabular-nums text-[var(--sage)]"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em' }}
              >
                Level {data.level}
              </span>
              <span className="text-sm text-white/40">/ {data.maxLevel}</span>
            </div>

            {/* XP bar */}
            <div className="mb-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              <span>XP do dalsiho levelu</span>
              <span>{data.currentXP} / {data.nextLevelXP}</span>
            </div>
            <div className="mb-8 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--sage)] transition-all duration-700"
                style={{ width: `${data.nextLevelXP > 0 ? Math.min(100, (data.currentXP / data.nextLevelXP) * 100) : 0}%` }}
              />
            </div>

            {/* Timer + join */}
            <div className="mb-8 flex items-center gap-6">
              <span className="text-sm text-white/40">
                Zbyva <span className="font-semibold text-white/70">{daysRemaining(data.endsAt)} dni</span>
              </span>
              {!data.joined && (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black transition hover:scale-105 disabled:opacity-50"
                >
                  {joining ? 'Pripojuji...' : 'Pripojit se'}
                </button>
              )}
            </div>

            {/* Level track */}
            <div className="mb-12">
              <p className="v3-eyebrow">Progress</p>
              <LevelTrack level={data.level} maxLevel={data.maxLevel} />
            </div>

            {/* Missions */}
            <div className="mb-6 flex items-center justify-between">
              <p className="v3-eyebrow">Mise</p>
              <button
                onClick={handleCheck}
                disabled={checking}
                className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold text-white/60 transition hover:text-white disabled:opacity-50"
              >
                {checking ? 'Kontroluji...' : 'Zkontrolovat mise'}
              </button>
            </div>
            {data.missions.length === 0 && (
              <p className="py-8 text-center text-sm text-white/30">Zatim zadne mise.</p>
            )}
            <StaggerContainer className="space-y-3">
              {data.missions.map((m) => (
                <StaggerItem key={m.id}>
                  <MissionCard
                    mission={m}
                    isNew={newlyCompleted.includes(m.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </>
        )}

        {!loading && !data && (
          <div className="py-24 text-center">
            <h1
              className="mb-6 font-bold tracking-tight text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em' }}
            >
              Zadna aktivni sezona
            </h1>
            <p className="mb-8 text-white/40">Sezona zatim nebyla spustena.</p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:scale-105 disabled:opacity-50"
            >
              {joining ? 'Pripojuji...' : 'Pripojit se'}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
