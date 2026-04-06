'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/lib/auth-context';
import {
  getSocialFeed, getChallenges, joinChallenge, searchUsers,
  followUser, unfollowUser, getFollowCounts,
  type FeedItem, type ChallengeData,
} from '@/lib/api';

const feedTypeIcons: Record<string, string> = {
  workout_completed: '🏋️',
  gym_completed: '💪',
  streak_milestone: '🔥',
  level_up: '⭐',
  challenge_won: '🏆',
};

function timeAgo(date: string) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return 'právě teď';
  if (mins < 60) return `před ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `před ${hours}h`;
  return `před ${Math.floor(hours / 24)}d`;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [counts, setCounts] = useState({ following: 0, followers: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [tab, setTab] = useState<'feed' | 'challenges' | 'people'>('feed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSocialFeed(), getChallenges(), getFollowCounts()])
      .then(([f, c, fc]) => { setFeed(f); setChallenges(c); setCounts(fc); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      searchUsers(searchQuery).then(setSearchResults).catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleJoinChallenge(id: string) {
    await joinChallenge(id);
    const updated = await getChallenges();
    setChallenges(updated);
  }

  async function handleFollow(userId: string) {
    await followUser(userId);
    setCounts((c) => ({ ...c, following: c.following + 1 }));
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Komunita</h1>
          <div className="flex gap-3 text-sm">
            <span className="text-gray-400">{counts.following} sleduji</span>
            <span className="text-gray-400">{counts.followers} sledujících</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {(['feed', 'challenges', 'people'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t ? 'bg-[#16a34a] text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t === 'feed' ? 'Feed' : t === 'challenges' ? 'Výzvy' : 'Lidé'}
            </button>
          ))}
        </div>

        {/* Feed Tab */}
        {tab === 'feed' && (
          <div className="space-y-3">
            {loading && <p className="text-gray-500">Načítání...</p>}
            {!loading && feed.length === 0 && (
              <div className="rounded-xl bg-gray-900 p-8 text-center">
                <p className="text-gray-400">Feed je prázdný. Sleduj další cvičence nebo začni cvičit!</p>
              </div>
            )}
            {feed.map((item) => (
              <div key={item.id} className="rounded-xl bg-gray-900 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-lg">
                    {feedTypeIcons[item.type] || '📋'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{item.user.name}</span>
                      <span className="text-xs text-gray-500">{timeAgo(item.createdAt)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-200">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Challenges Tab */}
        {tab === 'challenges' && (
          <div className="space-y-4">
            {challenges.length === 0 && (
              <p className="text-center text-gray-400">Žádné aktivní výzvy.</p>
            )}
            {challenges.map((ch) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(ch.endDate).getTime() - Date.now()) / 86400000));
              const isJoined = ch.participants.some((p) => p.user.id === user?.id);
              return (
                <div key={ch.id} className="rounded-xl bg-gray-900 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{ch.nameCs}</h3>
                      <p className="text-sm text-gray-400">{ch.description}</p>
                    </div>
                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                      {daysLeft} dní zbývá
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
                    <span>Cíl: {ch.targetValue}</span>
                    <span>·</span>
                    <span>{ch._count.participants} účastníků</span>
                  </div>

                  {/* Top 3 leaderboard */}
                  {ch.participants.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {ch.participants.slice(0, 3).map((p, i) => (
                        <div key={i} className="flex items-center justify-between rounded bg-gray-800 px-3 py-1.5 text-sm">
                          <span className="text-white">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {p.user.name}
                          </span>
                          <span className="font-mono text-[#16a34a]">{p.currentValue}/{ch.targetValue}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isJoined ? (
                    <button
                      onClick={() => handleJoinChallenge(ch.id)}
                      className="rounded-lg bg-[#16a34a] px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Připojit se
                    </button>
                  ) : (
                    <span className="text-sm text-green-400">Účastníš se</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* People Tab */}
        {tab === 'people' && (
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledej uživatele..."
              className="mb-4 w-full rounded-lg bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
            />
            <div className="space-y-2">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-xl bg-gray-900 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16a34a] text-sm font-bold text-white">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.level}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(u.id)}
                    className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    Sledovat
                  </button>
                </div>
              ))}
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-center text-gray-500">Nikdo nenalezen.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
