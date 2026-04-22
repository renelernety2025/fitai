'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import {
  getActiveDuels,
  getDuelHistory,
  submitDuelScore,
  challengeDuel,
} from '@/lib/api';

type Duel = {
  id: string;
  challengerName: string;
  challengedName: string;
  type: string;
  metric: string;
  xpBet: number;
  challengerScore: number | null;
  challengedScore: number | null;
  status: string;
  endsAt: string;
  winnerId: string | null;
  winnerName: string | null;
};

export default function DuelsPage() {
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [active, setActive] = useState<Duel[]>([]);
  const [history, setHistory] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    challengedId: '',
    type: 'reps',
    metric: 'pushups',
    duration: '24h',
    xpBet: 50,
  });

  useEffect(() => {
    document.title = 'FitAI — Duels';
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([getActiveDuels(), getDuelHistory()])
      .then(([a, h]) => {
        setActive(a as Duel[]);
        setHistory(h as Duel[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleScore(id: string) {
    const val = prompt('Zadej skore:');
    if (!val) return;
    submitDuelScore(id, Number(val))
      .then(() => getActiveDuels())
      .then((a) => setActive(a as Duel[]))
      .catch(() => {});
  }

  function handleChallenge() {
    challengeDuel(form)
      .then(() => getActiveDuels())
      .then((a) => {
        setActive(a as Duel[]);
        setShowModal(false);
      })
      .catch(() => {});
  }

  function timeLeft(endsAt: string): string {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Skonceno';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  return (
    <V2Layout>
      <Link
        href="/dashboard"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        &larr; Dashboard
      </Link>

      <section className="pt-8 pb-6">
        <V2SectionLabel>1v1 ARENA</V2SectionLabel>
        <V2Display size="xl">Duels</V2Display>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Vyzvi kohokoliv na 1v1 souboj. Vsad XP a dokaZ, kdo je lepsi.
        </p>
      </section>

      <div className="mb-6 flex gap-2">
        {(['active', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition ${
              tab === t
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t === 'active' ? 'Active' : 'History'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : tab === 'active' ? (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2">
          {active.length === 0 && (
            <p className="col-span-2 py-16 text-center text-sm text-white/30">
              Zadne aktivni duely. Vyzvi nekoho!
            </p>
          )}
          {active.map((d) => (
            <StaggerItem key={d.id}>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
                <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  {d.type} &middot; {d.metric}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF375F]/20 text-lg font-bold text-[#FF375F]">
                      {d.challengerName.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-white">{d.challengerName}</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {d.challengerScore ?? '--'}
                    </p>
                  </div>
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{
                      background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                    }}
                  >
                    VS
                  </div>
                  <div className="flex-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#00E5FF]/20 text-lg font-bold text-[#00E5FF]">
                      {d.challengedName.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-white">{d.challengedName}</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {d.challengedScore ?? '--'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                  <span>{d.xpBet} XP bet</span>
                  <span>{timeLeft(d.endsAt)}</span>
                </div>
                <button
                  onClick={() => handleScore(d.id)}
                  className="mt-4 w-full rounded-xl bg-[#FF375F] py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#FF375F]/80"
                >
                  Log Score
                </button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2">
          {history.length === 0 && (
            <p className="col-span-2 py-16 text-center text-sm text-white/30">
              Zadna historie duelu.
            </p>
          )}
          {history.map((d) => (
            <StaggerItem key={d.id}>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 opacity-80">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  {d.type} &middot; {d.metric}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">{d.challengerName}</span>
                  <span className="text-white/30">vs</span>
                  <span className="font-semibold text-white">{d.challengedName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-lg font-bold">
                  <span className="text-white">{d.challengerScore ?? 0}</span>
                  <span className="text-white/20">:</span>
                  <span className="text-white">{d.challengedScore ?? 0}</span>
                </div>
                {d.winnerName && (
                  <p className="mt-3 text-center text-xs font-semibold text-[#A8FF00]">
                    Vitez: {d.winnerName} (+{d.xpBet} XP)
                  </p>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-white shadow-lg transition hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}
      >
        +
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Challenge Someone</h3>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              User ID
            </label>
            <input
              value={form.challengedId}
              onChange={(e) => setForm({ ...form, challengedId: e.target.value })}
              className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FF375F]"
              placeholder="ID uzivatele"
            />
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="reps">Reps</option>
                  <option value="weight">Weight</option>
                  <option value="time">Time</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  Duration
                </label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="24h">24 hodin</option>
                  <option value="48h">48 hodin</option>
                  <option value="7d">7 dni</option>
                </select>
              </div>
            </div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              XP Bet
            </label>
            <input
              type="number"
              value={form.xpBet}
              onChange={(e) => setForm({ ...form, xpBet: Number(e.target.value) })}
              className="mb-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#FF375F]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-semibold uppercase text-white/60 transition hover:text-white"
              >
                Zrusit
              </button>
              <button
                onClick={handleChallenge}
                className="flex-1 rounded-xl py-2.5 text-xs font-semibold uppercase text-white transition hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}
              >
                Vyzvat
              </button>
            </div>
          </div>
        </div>
      )}
    </V2Layout>
  );
}
