'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display, V2Stat } from '@/components/v2/V2Layout';
import PropsButton from '@/components/social/PropsButton';
import {
  getPublicProfile,
  followUser,
  startConversation,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const LEVEL_COLORS: Record<string, string> = {
  Zacatecnik: '#00E5FF',
  Pokrocily: '#A8FF00',
  Expert: '#BF5AF2',
  Mistr: '#FFD600',
  Legenda: '#FF375F',
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

  useEffect(() => { document.title = 'FitAI — Profil'; }, []);

  useEffect(() => {
    if (!id) return;
    getPublicProfile(id)
      .then((p) => {
        setProfile(p);
        setFollowing(p.isFollowing);
      })
      .catch(() => setError('Profil nenalezen'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleFollow() {
    if (!profile) return;
    try {
      await followUser(profile.id);
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
      setError('Nepodarilo se zahajit konverzaci');
    }
  }

  if (loading) {
    return (
      <V2Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div style={{ color: 'var(--text-muted)' }}>Nacitam...</div>
        </div>
      </V2Layout>
    );
  }

  if (error || !profile) {
    return (
      <V2Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div style={{ color: '#FF375F' }}>
            {error || 'Profil nenalezen'}
          </div>
        </div>
      </V2Layout>
    );
  }

  const levelColor = LEVEL_COLORS[profile.level] || '#A8FF00';
  const isOwn = user?.id === profile.id;

  return (
    <V2Layout>
      <Link href="/community" className="mb-4 inline-flex items-center gap-1 text-sm text-white/40 transition hover:text-white">
        &larr; Komunita
      </Link>
      <section className="pt-12 pb-12">
        <V2SectionLabel>Profil</V2SectionLabel>

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
            <V2Display size="lg">{profile.name}</V2Display>
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
                  ? '#A8FF00'
                  : 'rgba(255,255,255,0.2)',
                backgroundColor: following
                  ? 'rgba(168,255,0,0.1)'
                  : 'transparent',
                color: following
                  ? '#A8FF00'
                  : 'var(--text-secondary)',
              }}
            >
              {following ? 'Sledujete' : 'Sledovat'}
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
                Napsat zpravu
              </button>
            )}
          </div>
        )}
      </section>

      {/* Stats */}
      <section className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
        <V2Stat
          value={profile.stats.totalSessions}
          label="treninku"
        />
        <V2Stat value={profile.stats.currentStreak} label="streak" />
        <V2Stat value={profile.stats.totalXP} label="XP" />
        <V2Stat value={profile.stats.propsCount} label="props" />
      </section>

      {/* Top achievements */}
      {profile.achievements.length > 0 && (
        <section className="mb-12">
          <V2SectionLabel>Top uspechy</V2SectionLabel>
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
                  {a.titleCs}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </V2Layout>
  );
}
