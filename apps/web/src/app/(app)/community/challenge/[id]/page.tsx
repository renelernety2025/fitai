'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { useAuth } from '@/lib/auth-context';
import {
  getChallengeDetail,
  joinChallenge,
  inviteToChallenge,
  searchUsers,
} from '@/lib/api';

const TYPE_LABELS: Record<string, string> = {
  workouts: 'Treninky',
  volume: 'Objem (kg)',
  streak: 'Streak',
  steps: 'Kroky',
};

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteResults, setInviteResults] = useState<any[]>([]);
  const [inviteSent, setInviteSent] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getChallengeDetail(id)
      .then(setChallenge)
      .catch(() => router.push('/community'))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (inviteQuery.length < 2) {
      setInviteResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchUsers(inviteQuery).then(setInviteResults).catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [inviteQuery]);

  if (loading) {
    return (
      <>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      </>
    );
  }

  if (!challenge) return null;

  const joined = challenge.participants.some(
    (p: any) => p.user.id === user?.id,
  );
  const myEntry = challenge.participants.find(
    (p: any) => p.user.id === user?.id,
  );
  const pct = myEntry
    ? Math.min(100, Math.round((myEntry.currentValue / challenge.targetValue) * 100))
    : 0;

  async function handleJoin() {
    setError(null);
    try {
      await joinChallenge(challenge.id);
      const updated = await getChallengeDetail(challenge.id);
      setChallenge(updated);
    } catch {
      setError('Nepodarilo se pripojit k vyzve');
    }
  }

  async function handleInvite(targetUserId: string) {
    try {
      await inviteToChallenge(challenge.id, targetUserId);
      setInviteSent((prev) => new Set(prev).add(targetUserId));
    } catch {
      setError('Nepodarilo se odeslat pozvanku');
    }
  }

  return (
    <>
      {/* Back link */}
      <button
        onClick={() => router.push('/community')}
        className="mb-8 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 transition hover:text-white"
      >
        &larr; Komunita
      </button>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
          {error}
        </div>
      )}

      {/* Hero */}
      <section className="pb-12 pt-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full border border-[#A8FF00]/30 bg-[#A8FF00]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A8FF00]">
            {TYPE_LABELS[challenge.type] || challenge.type}
          </span>
          {challenge.isExpired && (
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-red-400">
              Ukoncena
            </span>
          )}
        </div>
        <V2Display size="xl">{challenge.nameCs}</V2Display>
        {challenge.description && (
          <p className="mt-4 max-w-xl text-base text-white/55">
            {challenge.description}
          </p>
        )}

        {/* Stats row */}
        <div className="mt-6 flex gap-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Ucastnici
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white">
              {challenge._count.participants}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Zbyvajici dny
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white">
              {challenge.daysRemaining}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Cil
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white">
              {challenge.targetValue}
            </p>
          </div>
        </div>

        {/* Creator */}
        {challenge.creator && (
          <p className="mt-4 text-sm text-white/40">
            Vytvoril: {challenge.creator.name}
          </p>
        )}
      </section>

      {/* User progress */}
      {joined && (
        <section className="mb-12">
          <V2SectionLabel>Tvůj pokrok</V2SectionLabel>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm text-white/60">
                {myEntry?.currentValue ?? 0} / {challenge.targetValue}
              </span>
              <span className="text-sm font-bold text-[#A8FF00]">{pct}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#A8FF00] to-[#00E5FF] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="mb-12 flex gap-3">
        {!joined && !challenge.isExpired && (
          <button
            onClick={handleJoin}
            className="rounded-full bg-white px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/90"
          >
            Pripojit se
          </button>
        )}
        {joined && (
          <span className="flex items-center gap-2 rounded-full border border-[#A8FF00]/30 bg-[#A8FF00]/10 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#A8FF00]">
            Ucastnis se
          </span>
        )}
        {!challenge.isExpired && (
          <button
            onClick={() => setInviteOpen(!inviteOpen)}
            className="rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white hover:text-white"
          >
            Pozvat pritele
          </button>
        )}
      </div>

      {/* Invite modal inline */}
      {inviteOpen && (
        <section className="mb-12 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <input
            type="text"
            value={inviteQuery}
            onChange={(e) => setInviteQuery(e.target.value)}
            placeholder="Hledej uzivatele..."
            className="mb-4 w-full border-b border-white/15 bg-transparent py-3 text-base text-white placeholder-white/30 focus:border-white focus:outline-none"
          />
          <div className="space-y-1">
            {inviteResults.map((u) => {
              const alreadyIn = challenge.participants.some(
                (p: any) => p.user.id === u.id,
              );
              const sent = inviteSent.has(u.id);
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between border-b border-white/5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-xs font-bold text-white">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white">{u.name}</span>
                  </div>
                  {alreadyIn ? (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      Uz je ve vyzve
                    </span>
                  ) : sent ? (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#A8FF00]">
                      Pozvano
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInvite(u.id)}
                      className="rounded-full border border-white/20 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-[#00E5FF] hover:text-[#00E5FF]"
                    >
                      Pozvat
                    </button>
                  )}
                </div>
              );
            })}
            {inviteQuery.length >= 2 && inviteResults.length === 0 && (
              <p className="py-4 text-center text-sm text-white/40">
                Nikdo nenalezen.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Leaderboard */}
      <section>
        <V2SectionLabel>Zebricek</V2SectionLabel>
        <div className="mt-6 space-y-1">
          {challenge.participants.map((p: any, i: number) => {
            const participantPct = Math.min(
              100,
              Math.round((p.currentValue / challenge.targetValue) * 100),
            );
            const isMe = p.user.id === user?.id;
            return (
              <div
                key={p.user.id}
                className={`rounded-lg border px-5 py-4 ${
                  isMe
                    ? 'border-[#A8FF00]/20 bg-[#A8FF00]/5'
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        i === 0
                          ? 'text-[#A8FF00]'
                          : i === 1
                            ? 'text-[#00E5FF]'
                            : 'text-white/40'
                      }`}
                    >
                      {i + 1}.
                    </span>
                    <span className="text-sm text-white">
                      {p.user.name}
                      {isMe && (
                        <span className="ml-2 text-[10px] text-[#A8FF00]">
                          (ty)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-white">
                    {p.currentValue}
                    <span className="text-white/30">
                      /{challenge.targetValue}
                    </span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${
                      i === 0
                        ? 'bg-[#A8FF00]'
                        : i === 1
                          ? 'bg-[#00E5FF]'
                          : 'bg-white/30'
                    }`}
                    style={{ width: `${participantPct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {challenge.participants.length === 0 && (
            <p className="py-12 text-center text-sm text-white/40">
              Zatim zadni ucastnici.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
