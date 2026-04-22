'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { useAuth } from '@/lib/auth-context';
import CreateChallengeModal from '@/components/social/CreateChallengeModal';
import { FeedSkeleton } from '@/components/v2/Skeleton';
import StoriesBar from '@/components/social/StoriesBar';
import StoryViewer from '@/components/social/StoryViewer';
import ReactionBar from '@/components/social/ReactionBar';
import CommentSection from '@/components/social/CommentSection';
import FlashBanner from '@/components/social/FlashBanner';
import {
  getSocialFeed,
  getChallenges,
  joinChallenge,
  searchUsers,
  followUser,
  getFollowCounts,
  getStories,
  type FeedItem,
  type ChallengeData,
} from '@/lib/api';

function timeAgo(date: string) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1) return 'právě teď';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function CommunityV2Page() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [counts, setCounts] = useState({ following: 0, followers: 0 });
  const [tab, setTab] = useState<'feed' | 'challenges' | 'people'>('feed');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [viewerStory, setViewerStory] = useState<number | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { document.title = 'FitAI — Komunita'; }, []);

  useEffect(() => {
    getSocialFeed().then(setFeed).catch(console.error).finally(() => setFeedLoading(false));
    getChallenges().then(setChallenges).catch(console.error);
    getFollowCounts().then(setCounts).catch(console.error);
    getStories().then(setStories).catch(() => {});
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => searchUsers(query).then(setResults).catch(console.error), 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <V2Layout>
      <section className="pt-12 pb-12">
        <V2SectionLabel>Komunita</V2SectionLabel>
        <V2Display size="xl">Lidé.</V2Display>
        <p className="mt-4 text-base text-white/55">
          {counts.following} sleduji · {counts.followers} sledujících
        </p>
      </section>

      {/* Stories */}
      <StoriesBar
        stories={stories}
        onSelect={(s) => {
          const idx = stories.findIndex((st: any) => st.id === s.id);
          setViewerStory(idx >= 0 ? idx : 0);
        }}
      />
      {viewerStory !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewerStory}
          onClose={() => setViewerStory(null)}
        />
      )}

      {/* Flash Challenge */}
      <FlashBanner />

      {/* Tabs */}
      <div className="mb-16 flex items-center gap-2">
        {(['feed', 'challenges', 'people'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              tab === t
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            {t === 'feed' ? 'Feed' : t === 'challenges' ? 'Výzvy' : 'Lidé'}
          </button>
        ))}
        <button onClick={() => { getSocialFeed().then(setFeed).catch(console.error); getChallenges().then(setChallenges).catch(console.error); }} className="ml-auto text-white/20 hover:text-white/50 transition" aria-label="Obnovit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>
      </div>

      {/* Feed */}
      {tab === 'feed' && (
        <section className="space-y-1">
          {feedLoading && <FeedSkeleton />}
          {!feedLoading && feed.length === 0 && (
            <p className="py-12 text-center text-sm text-white/40">
              Feed je prazdny. Sleduj dalsi cvicence nebo zacni cvicit.
            </p>
          )}
          {feed.map((item) => (
            <div key={item.id} className="border-b border-white/8 py-6">
              <div className="mb-2 flex items-baseline gap-3">
                <Link href={`/profile/${item.user.id}`}>
                  <span className="font-medium text-white hover:text-[#A8FF00] transition cursor-pointer">{item.user.name}</span>
                </Link>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
              <p className="text-base text-white">{item.title}</p>
              <p className="text-sm text-white/55">{item.body}</p>
              <div className="mt-3">
                <ReactionBar
                  targetType="feedItem"
                  targetId={item.id}
                  reactions={[]}
                />
              </div>
              <CommentSection feedItemId={item.id} commentCount={0} />
            </div>
          ))}
        </section>
      )}

      {/* Challenges */}
      {tab === 'challenges' && (
        <section className="space-y-12">
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/90"
          >
            + Vytvorit vyzvu
          </button>

          {challenges.length === 0 && (
            <p className="py-12 text-center text-sm text-white/40">Žádné aktivní výzvy.</p>
          )}
          {challenges.map((ch) => {
            const days = Math.max(0, Math.ceil((new Date(ch.endDate).getTime() - Date.now()) / 86400000));
            const joined = ch.participants.some((p) => p.user.id === user?.id);
            const myEntry = ch.participants.find((p) => p.user.id === user?.id);
            const pct = myEntry
              ? Math.min(100, Math.round((myEntry.currentValue / ch.targetValue) * 100))
              : 0;
            return (
              <div
                key={ch.id}
                className="cursor-pointer border-b border-white/10 pb-12 transition hover:border-white/20"
                onClick={() => router.push(`/community/challenge/${ch.id}`)}
              >
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
                  {days} dní zbývá · {ch._count.participants} účastníků
                </div>
                <V2Display size="md">{ch.nameCs}</V2Display>
                <p className="mt-3 text-base text-white/55">{ch.description}</p>
                <p className="mt-1 text-sm text-white/40">Cíl: {ch.targetValue}</p>

                {/* Progress bar for current user */}
                {joined && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-[10px] text-white/40">
                        {myEntry?.currentValue ?? 0} / {ch.targetValue}
                      </span>
                      <span className="text-[10px] font-bold text-[#A8FF00]">{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#A8FF00] to-[#00E5FF] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {ch.participants.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {ch.participants.slice(0, 3).map((p, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-white/5 pb-2"
                      >
                        <span className="text-sm text-white">
                          <span className="text-white/40 tabular-nums">{i + 1}.</span> {p.user.name}
                        </span>
                        <span className="font-bold text-white tabular-nums">
                          {p.currentValue}
                          <span className="text-white/40">/{ch.targetValue}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  {!joined ? (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await joinChallenge(ch.id);
                        setChallenges(await getChallenges());
                      }}
                      className="rounded-full bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/90"
                    >
                      Připojit se
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#A8FF00]">
                      Ucastnis se
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <CreateChallengeModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={() => getChallenges().then(setChallenges)}
          />
        </section>
      )}

      {/* People */}
      {tab === 'people' && (
        <section>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledej uživatele…"
            className="mb-12 w-full border-b border-white/15 bg-transparent py-4 text-2xl text-white placeholder-white/20 focus:border-white focus:outline-none"
          />
          <div className="space-y-1">
            {results.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between border-b border-white/8 py-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm font-bold text-white">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base text-white">{u.name}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                      {u.level}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => followUser(u.id)}
                  className="rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60 transition hover:border-white hover:text-white"
                >
                  Sledovat
                </button>
              </div>
            ))}
            {query.length >= 2 && results.length === 0 && (
              <p className="py-12 text-center text-sm text-white/40">Nikdo nenalezen.</p>
            )}
          </div>
        </section>
      )}
    </V2Layout>
  );
}
