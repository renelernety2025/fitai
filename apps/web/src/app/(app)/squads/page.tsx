'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import {
  getMySquad,
  getSquadLeaderboard,
  createSquad,
  leaveSquad,
} from '@/lib/api';

type SquadMember = {
  id: string;
  name: string;
  weeklyXP: number;
  avatarUrl: string | null;
};

type Squad = {
  id: string;
  name: string;
  motto: string;
  weeklyXP: number;
  members: SquadMember[];
};

type LeaderboardRow = {
  id: string;
  name: string;
  memberCount: number;
  weeklyXP: number;
};

export default function SquadsPage() {
  const [mySquad, setMySquad] = useState<Squad | null>(null);
  const [board, setBoard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', motto: '' });

  useEffect(() => {
    document.title = 'FitAI — Squads';
  }, []);

  function load() {
    setLoading(true);
    Promise.all([
      getMySquad().catch(() => null),
      getSquadLeaderboard().catch(() => []),
    ])
      .then(([s, b]) => {
        setMySquad(s as Squad | null);
        setBoard(b as LeaderboardRow[]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleCreate() {
    if (!form.name.trim()) return;
    createSquad(form)
      .then(() => { setShowCreate(false); load(); })
      .catch(() => {});
  }

  function handleLeave() {
    if (!mySquad) return;
    leaveSquad(mySquad.id)
      .then(() => load())
      .catch(() => {});
  }

  const maxXP = board.length > 0
    ? Math.max(...board.map((r) => r.weeklyXP), 1)
    : 1;

  return (
    <V2Layout>
      <Link
        href="/dashboard"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        &larr; Dashboard
      </Link>

      <section className="pt-8 pb-6">
        <V2SectionLabel>TEAM</V2SectionLabel>
        <V2Display size="xl">Squads</V2Display>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Zaloz nebo se pridej k tymu. Sbirejte XP spolecne a bojujte o prvni misto.
        </p>
      </section>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={5} />
        </div>
      ) : (
        <>
          {mySquad ? (
            <div className="mb-8 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#BF5AF2]">
                Muj squad
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {mySquad.name}
              </h2>
              {mySquad.motto && (
                <p className="mt-1 text-xs italic text-white/40">
                  &ldquo;{mySquad.motto}&rdquo;
                </p>
              )}
              <div className="mt-4 flex items-center gap-1">
                {mySquad.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white"
                    title={m.name}
                  >
                    {m.name.charAt(0)}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-white/50">
                  Tydenni XP:{' '}
                  <span className="font-bold text-[#A8FF00]">
                    {mySquad.weeklyXP.toLocaleString()}
                  </span>
                </span>
                <button
                  onClick={handleLeave}
                  className="rounded-lg border border-white/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 transition hover:border-[#FF375F] hover:text-[#FF375F]"
                >
                  Leave Squad
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
              <p className="mb-4 text-sm text-white/40">
                Nejsi v zadnem squadu.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="rounded-xl bg-[#BF5AF2] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#BF5AF2]/80"
              >
                Create Squad
              </button>
            </div>
          )}

          <V2SectionLabel>GLOBAL LEADERBOARD</V2SectionLabel>
          <StaggerContainer className="mt-4 space-y-2">
            {board.length === 0 && (
              <p className="py-12 text-center text-sm text-white/30">
                Zatim zadne squady.
              </p>
            )}
            {board.map((row, i) => (
              <StaggerItem key={row.id}>
                <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background:
                        i === 0
                          ? '#FFD700'
                          : i === 1
                            ? '#C0C0C0'
                            : i === 2
                              ? '#CD7F32'
                              : 'rgba(255,255,255,0.06)',
                      color: i < 3 ? '#000' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {row.name}
                    </p>
                    <p className="text-[10px] text-white/40">
                      {row.memberCount} clenu
                    </p>
                  </div>
                  <div className="w-32">
                    <div className="h-1.5 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-[#BF5AF2]"
                        style={{ width: `${(row.weeklyXP / maxXP) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-bold text-white">
                    {row.weeklyXP.toLocaleString()}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Create Squad</h3>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Nazev
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#BF5AF2]"
              placeholder="Nazev squadu"
            />
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Motto
            </label>
            <input
              value={form.motto}
              onChange={(e) => setForm({ ...form, motto: e.target.value })}
              className="mb-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#BF5AF2]"
              placeholder="Volitelne motto"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-semibold uppercase text-white/60 transition hover:text-white"
              >
                Zrusit
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 rounded-xl bg-[#BF5AF2] py-2.5 text-xs font-semibold uppercase text-white transition hover:bg-[#BF5AF2]/80"
              >
                Vytvorit
              </button>
            </div>
          </div>
        </div>
      )}
    </V2Layout>
  );
}
