'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Button, Tag, SectionHeader, Ring } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getBossFights, startBoss, completeBoss, getSkillTree } from '@/lib/api';

const SKILLS = [
  { x: 50, y: 12, label: 'Foundation', lvl: 'I' },
  { x: 25, y: 32, label: 'Strength', lvl: 'II' },
  { x: 75, y: 32, label: 'Endurance', lvl: 'II' },
  { x: 12, y: 56, label: 'Power', lvl: 'III' },
  { x: 38, y: 56, label: 'Mobility', lvl: 'II' },
  { x: 62, y: 56, label: 'Speed', lvl: 'III' },
  { x: 88, y: 56, label: 'Recovery', lvl: 'II' },
  { x: 25, y: 78, label: 'Olympic', lvl: 'IV' },
  { x: 50, y: 78, label: 'Mental', lvl: 'IV' },
  { x: 75, y: 78, label: 'Marathon', lvl: 'IV' },
  { x: 50, y: 95, label: 'Mastery', lvl: 'V' },
];

const EDGES = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,7],[4,7],[4,8],[5,8],[5,9],[6,9],[7,10],[8,10],[9,10]];

export default function BossFightsPage() {
  const [data, setData] = useState<any>(null);
  const [activeBoss, setActiveBoss] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [scoreInput, setScoreInput] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { document.title = 'FitAI — Boss Fights'; }, []);
  useEffect(() => {
    getBossFights().then(setData).catch(() => {});
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleStart = useCallback(async (boss: any) => {
    try {
      const result = await startBoss(boss.code);
      setActiveBoss(boss);
      setTimer(0);
      setRunning(true);
      setScoreInput('');
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch { /* noop */ }
  }, []);

  const handleComplete = useCallback(async () => {
    if (!activeBoss) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    try {
      await completeBoss(activeBoss.code, { timeSeconds: timer, score: scoreInput ? parseInt(scoreInput) : undefined });
      getBossFights().then(setData).catch(() => {});
    } catch { /* noop */ }
    setActiveBoss(null);
  }, [activeBoss, timer, scoreInput]);

  const bosses = data?.bosses ?? [];
  const defeated = data?.defeated ?? [];
  const defeatedSet = new Set<string>(defeated.map((d: any) => d.code as string));
  const userXP = data?.userXP ?? 0;
  const userLevel = data?.userLevel ?? 1;
  const nextLevelXP = data?.nextLevelXP ?? 1000;

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '64px 96px' }}>
      <BossHeader />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 }}>
        <SkillTreeCard defeatedSet={defeatedSet} />
        <div>
          <QuestsSection bosses={bosses} defeatedSet={defeatedSet} activeBoss={activeBoss}
            onStart={handleStart} running={running} timer={timer} scoreInput={scoreInput}
            setScoreInput={setScoreInput} onComplete={handleComplete} />
          <XPBar xp={userXP} level={userLevel} nextXP={nextLevelXP} />
        </div>
      </div>
    </div>
  );
}

function BossHeader() {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Boss Fights · Skill Tree</div>
      <h1 className="v3-display-2" style={{ margin: 0 }}>
        The long<br /><em style={{ color: 'var(--clay)', fontWeight: 300 }}>game.</em>
      </h1>
    </div>
  );
}

function SkillTreeCard({ defeatedSet }: { defeatedSet: Set<string> }) {
  const earnedCount = Math.min(SKILLS.length, defeatedSet.size + 3);
  return (
    <Card padding={32}>
      <div className="v3-eyebrow" style={{ marginBottom: 8 }}>Skill tree · {earnedCount} of {SKILLS.length} unlocked</div>
      <div className="v3-title" style={{ marginBottom: 24 }}>Where you have grown</div>
      <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 12 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 110" preserveAspectRatio="none">
          {EDGES.map(([a, b], i) => {
            const sa = SKILLS[a], sb = SKILLS[b];
            const both = a < earnedCount && b < earnedCount;
            return (
              <line key={i} x1={sa.x} y1={sa.y} x2={sb.x} y2={sb.y}
                stroke={both ? 'var(--accent)' : 'var(--stroke-2)'} strokeWidth="0.3"
                strokeDasharray={both ? '0' : '1 1'} />
            );
          })}
        </svg>
        {SKILLS.map((s, i) => {
          const earned = i < earnedCount;
          return (
            <div key={i} style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: earned ? 'linear-gradient(135deg, var(--accent), var(--clay))' : 'var(--bg-3)',
                border: earned ? '2px solid var(--accent)' : '1px dashed var(--stroke-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: earned ? '0 0 20px rgba(232,93,44,0.4)' : 'none',
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)',
                color: earned ? '#fff' : 'var(--text-3)', margin: '0 auto 6px',
              }}>{s.lvl}</div>
              <div style={{ fontSize: 10, color: earned ? 'var(--text-1)' : 'var(--text-3)', whiteSpace: 'nowrap' }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function QuestsSection({ bosses, defeatedSet, activeBoss, onStart, running, timer, scoreInput, setScoreInput, onComplete }: any) {
  return (
    <>
      <SectionHeader eyebrow="Active quests" title="Boss fights" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {bosses.map((b: any) => {
          const isDefeated = defeatedSet.has(b.code);
          const isActive = activeBoss?.code === b.code;
          return (
            <Card key={b.code} padding={20} hover style={{ opacity: isDefeated ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Ring value={isActive ? Math.min(100, (timer / (b.targetTimeSeconds || 300)) * 100) : (isDefeated ? 100 : 0)}
                  size={56} stroke={4} color={isDefeated ? 'var(--sage, #A8B89A)' : 'var(--accent)'}
                  label={isActive ? formatTime(timer) : undefined} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: 6 }}><Tag color="var(--accent)">+{b.xpReward || 0} XP</Tag></div>
                  <div className="v3-title" style={{ marginBottom: 2 }}>{b.name || b.nameCs}</div>
                  <div className="v3-caption">{b.description}</div>
                </div>
                {!isActive && !isDefeated && (
                  <Button variant="ghost" size="sm" onClick={() => onStart(b)} disabled={!!activeBoss}>Start</Button>
                )}
                {isActive && running && (
                  <Button variant="accent" size="sm" onClick={onComplete}>Finish</Button>
                )}
                {isDefeated && <FitIcon name="check" size={20} color="var(--sage, #A8B89A)" />}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function XPBar({ xp, level, nextXP }: { xp: number; level: number; nextXP: number }) {
  const pct = Math.min(100, (xp / nextXP) * 100);
  return (
    <Card padding={24} style={{ marginTop: 16, background: 'linear-gradient(135deg, var(--bg-card), rgba(232,93,44,0.08))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <div className="v3-eyebrow">Level</div>
          <div className="v3-numeric" style={{ fontSize: 48, lineHeight: 1, color: 'var(--accent)' }}>{level}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="v3-caption">{xp.toLocaleString()} / {nextXP.toLocaleString()} XP</div>
          <div className="v3-caption" style={{ marginTop: 4, color: 'var(--accent)' }}>{(nextXP - xp).toLocaleString()} to next</div>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)' }} />
      </div>
    </Card>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
