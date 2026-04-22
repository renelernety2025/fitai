'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getBossFights, startBoss, completeBoss } from '@/lib/api';

const BOSS_EMOJI: Record<string, string> = {
  minotaur: '\uD83D\uDC02',
  hydra: '\uD83D\uDC09',
  atlas: '\uD83C\uDFCB\uFE0F',
  sparta: '\u2694\uFE0F',
  olymp: '\uD83C\uDFD4\uFE0F',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BossFightsPage() {
  const [data, setData] = useState<any>(null);
  const [activeBoss, setActiveBoss] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [completing, setCompleting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { document.title = 'FitAI — Aréna'; }, []);

  useEffect(() => {
    getBossFights().then(setData).catch(() => {});
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleStart = useCallback(async (boss: any) => {
    try {
      const result = await startBoss(boss.code);
      setActiveBoss(boss);
      setInstructions(result.instructions || boss.description);
      setTimer(0);
      setRunning(true);
      setScoreInput('');
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } catch { /* noop */ }
  }, []);

  const handleComplete = useCallback(async () => {
    if (!activeBoss) return;
    setCompleting(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    try {
      await completeBoss(activeBoss.code, {
        timeSeconds: timer,
        score: scoreInput ? parseInt(scoreInput) : undefined,
      });
      // Refresh boss list to show defeated status
      getBossFights().then(setData).catch(() => {});
    } catch { /* noop */ } finally {
      setCompleting(false);
      setActiveBoss(null);
      setInstructions(null);
    }
  }, [activeBoss, timer, scoreInput]);

  const bosses = data?.bosses || [];
  const defeated = data?.defeated || [];
  const defeatedCodes = new Set(defeated.map((d: any) => d.code));

  return (
    <V2Layout>
      <section className="pt-12 pb-8 text-center">
        <V2SectionLabel>Epicky souboj</V2SectionLabel>
        <V2Display size="xl">Arena.</V2Display>
        <p className="mt-4 text-base text-white/55">
          Poraz bossy. Ziskej XP. Dokazes to.
        </p>
      </section>

      {/* Active boss fight */}
      {activeBoss && (
        <section className="mb-12 rounded-2xl border border-[#FFD600]/30 bg-[#FFD600]/5 p-8 text-center">
          <div className="mb-2 text-4xl">{BOSS_EMOJI[activeBoss.code] || '\uD83D\uDC79'}</div>
          <h3 className="mb-1 text-xl font-bold text-white">{activeBoss.nameCs || activeBoss.name}</h3>
          {instructions && <p className="mb-6 text-sm text-white/55">{instructions}</p>}

          <div className="mb-6 text-5xl font-bold tabular-nums text-[#FFD600]" style={{ letterSpacing: '-0.03em' }}>
            {formatTime(timer)}
          </div>

          {running ? (
            <div className="flex flex-col items-center gap-4">
              <input type="number" placeholder="Skore (nepovinne)" value={scoreInput}
                onChange={(e) => setScoreInput(e.target.value)}
                className="w-48 rounded-xl border border-white/10 bg-black px-4 py-3 text-center text-sm text-white placeholder:text-white/30 outline-none"
              />
              <button onClick={handleComplete} disabled={completing}
                className="rounded-full bg-[#FF375F] px-10 py-4 text-sm font-bold text-white transition hover:bg-[#FF375F]/80 disabled:opacity-50"
              >
                {completing ? 'Ukladam...' : 'Porazit!'}
              </button>
            </div>
          ) : null}
        </section>
      )}

      {/* Boss grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bosses.map((boss: any) => {
          const isDefeated = defeatedCodes.has(boss.code);
          const best = defeated.find((d: any) => d.code === boss.code);
          return (
            <div key={boss.code}
              className={`rounded-2xl border p-6 transition ${
                isDefeated
                  ? 'border-[#FFD600]/40 bg-[#FFD600]/5'
                  : 'border-white/8 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-3xl">{BOSS_EMOJI[boss.code] || '\uD83D\uDC79'}</span>
                {isDefeated && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-[#FFD600]">
                    Porazeno &#10003;
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{boss.nameCs || boss.name}</h3>
              <p className="mt-1 text-xs text-white/50">{boss.description}</p>
              <div className="mt-3 flex items-center gap-4 text-[11px] text-white/40">
                <span>Cil: {boss.targetTimeSeconds ? formatTime(boss.targetTimeSeconds) : 'N/A'}</span>
                <span className="text-[#FFD600] font-semibold">+{boss.xpReward || 0} XP</span>
              </div>
              {best && (
                <div className="mt-2 text-[11px] text-[#A8FF00]">
                  Nejlepsi cas: {formatTime(best.bestTimeSeconds || 0)}
                </div>
              )}
              <button onClick={() => handleStart(boss)} disabled={!!activeBoss}
                className="mt-4 w-full rounded-full border border-white/15 py-2.5 text-xs font-semibold text-white transition hover:bg-white/5 disabled:opacity-30"
              >
                Zahajit boj
              </button>
            </div>
          );
        })}
      </section>

      {bosses.length === 0 && !activeBoss && (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#FFD600]" />
        </div>
      )}
    </V2Layout>
  );
}
