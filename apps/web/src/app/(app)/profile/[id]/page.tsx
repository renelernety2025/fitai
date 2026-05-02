'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PropsButton from '@/components/social/PropsButton';
import {
  getPublicProfile,
  followUser,
  unfollowUser,
  startConversation,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'var(--sage)',
  Intermediate: 'var(--sage)',
  Expert: 'var(--clay-deep)',
  Master: 'var(--warning)',
  Legend: 'var(--accent)',
  Zacatecnik: 'var(--sage)',
  Pokrocily: 'var(--sage)',
  Mistr: 'var(--warning)',
  Legenda: 'var(--accent)',
};

interface PublicProfile {
  id: string;
  name: string;
  bio?: string;
  level: string;
  stats: {
    totalSessions: number;
    currentStreak: number;
    totalXP: number;
    propsCount: number;
  };
  achievements: {
    id: string;
    title?: string;
    titleCs: string;
    icon: string;
    category: string;
  }[];
  isFollowing: boolean;
  isMutual: boolean;
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { document.title = 'FitAI — Profile'; }, []);

  useEffect(() => {
    if (!id) return;
    getPublicProfile(id)
      .then((p) => {
        setProfile(p);
        setFollowing(p.isFollowing);
      })
      .catch(() => setError('Profile not found'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleFollow() {
    if (!profile) return;
    try {
      if (following) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }
      setFollowing(!following);
    } catch {
      // silent
    }
  }

  async function handleMessage() {
    if (!profile) return;
    try {
      const conv = await startConversation(profile.id);
      router.push(`/messages?c=${conv.id}`);
    } catch {
      setError('Failed to start conversation');
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div style={{ color: 'var(--accent)' }}>
            {error || 'Profile not found'}
          </div>
        </div>
      </>
    );
  }

  const levelColor = LEVEL_COLORS[profile.level] || '#A8FF00';
  const isOwn = user?.id === profile.id;

  return (
    <>
      <Link href="/community" className="mb-4 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white">
        &larr; Community
      </Link>
      <section className="pt-12 pb-12">
        <p className="v3-eyebrow">Profile</p>

        {/* Avatar + name */}
        <div className="mb-8 flex items-center gap-6">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold"
            style={{
              border: `2px solid ${levelColor}`,
              color: 'var(--text-primary)',
            }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="v3-display-2">{profile.name}</h1>
            <div
              className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em]"
              style={{ color: levelColor }}
            >
              {profile.level}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p
            className="mb-8 max-w-lg text-base"
            style={{ color: 'var(--text-secondary)' }}
          >
            {profile.bio}
          </p>
        )}

        {/* Actions */}
        {!isOwn && (
          <div className="mb-12 flex flex-wrap gap-3">
            <button
              onClick={handleFollow}
              className="rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition"
              style={{
                borderColor: following
                  ? 'var(--sage)'
                  : 'rgba(255,255,255,0.2)',
                backgroundColor: following
                  ? 'color-mix(in srgb, var(--sage) 10%, transparent)'
                  : 'transparent',
                color: following
                  ? 'var(--sage)'
                  : 'var(--text-secondary)',
              }}
            >
              {following ? 'Following' : 'Follow'}
            </button>
            <PropsButton
              toUserId={profile.id}
              initialCount={profile.stats.propsCount}
            />
            {(profile.isMutual || following) && (
              <button
                onClick={handleMessage}
                className="rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition"
                style={{
                  borderColor: 'rgba(0,229,255,0.3)',
                  backgroundColor: 'rgba(0,229,255,0.1)',
                  color: '#00E5FF',
                }}
              >
                Message
              </button>
            )}
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
        <div>
          <div className="text-3xl font-bold tabular-nums text-white">{profile.stats.totalSessions}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">sessions</div>
        </div>
        <div>
          <div className="text-3xl font-bold tabular-nums text-white">{profile.stats.currentStreak}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">streak</div>
        </div>
        <div>
          <div className="text-3xl font-bold tabular-nums text-white">{profile.stats.totalXP}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">XP</div>
        </div>
        <div>
          <div className="text-3xl font-bold tabular-nums text-white">{profile.stats.propsCount}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">props</div>
        </div>
      </section>

      {/* Top achievements */}
      {profile.achievements.length > 0 && (
        <section className="mb-12">
          <p className="v3-eyebrow">Top achievements</p>
          <div className="flex gap-4">
            {profile.achievements.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex flex-col items-center gap-2 rounded-xl p-4"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span className="text-2xl">{a.icon}</span>
                <span
                  className="text-center text-[10px] font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {a.title || a.titleCs}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
