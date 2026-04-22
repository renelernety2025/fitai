'use client';

/**
 * Playlists — workout music playlists shared by community.
 */

import { useEffect, useState, useMemo } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { GlassCard } from '@/components/v2/GlassCard';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getPlaylists, addPlaylistLink, type PlaylistLink } from '@/lib/api';

const WORKOUT_TYPES = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Recovery'];

const TYPE_COLORS: Record<string, string> = {
  strength: '#FF375F',
  cardio: '#A8FF00',
  hiit: '#FF9F0A',
  yoga: '#BF5AF2',
  recovery: '#00E5FF',
};

function detectPlatform(url: string): string {
  if (url.includes('spotify')) return 'Spotify';
  if (url.includes('apple') || url.includes('music.apple'))
    return 'Apple Music';
  if (url.includes('youtube')) return 'YouTube';
  if (url.includes('soundcloud')) return 'SoundCloud';
  return 'Link';
}

function platformColor(platform: string): string {
  if (platform === 'Spotify') return '#1DB954';
  if (platform === 'Apple Music') return '#FC3C44';
  if (platform === 'YouTube') return '#FF0000';
  return '#6E6E73';
}

function getPlaylistUrl(playlist: PlaylistLink): string {
  return playlist.spotifyUrl || playlist.appleMusicUrl || '#';
}

function PlaylistCard({ playlist }: { playlist: PlaylistLink }) {
  const wt = playlist.workoutType || 'Other';
  const color = TYPE_COLORS[wt.toLowerCase()] || '#6E6E73';
  const url = getPlaylistUrl(playlist);
  const platform = detectPlatform(url);
  const pColor = platformColor(platform);

  return (
    <GlassCard className="p-5 h-full flex flex-col">
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-white">
            {playlist.title}
          </h3>
          <span
            className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{
              color,
              background: `${color}15`,
              border: `1px solid ${color}30`,
            }}
          >
            {wt}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[11px] text-white/40">
          <span className="font-medium" style={{ color: pColor }}>
            {platform}
          </span>
          <span>{playlist.bpm} BPM</span>
          <span>by {playlist.user?.name || 'Unknown'}</span>
        </div>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10 transition-all"
      >
        Otevrit &#8599;
      </a>
    </GlassCard>
  );
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    url: '',
    bpm: '',
    workoutType: 'Strength',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'FitAI — Playlists';
  }, []);

  useEffect(() => {
    getPlaylists()
      .then(setPlaylists)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'All') return playlists;
    return playlists.filter(
      (p) =>
        (p.workoutType || '').toLowerCase() === filter.toLowerCase(),
    );
  }, [playlists, filter]);

  async function handleAdd() {
    if (!form.title || !form.url || !form.bpm) return;
    setSaving(true);
    try {
      const isSpotify = form.url.includes('spotify');
      const result = await addPlaylistLink({
        title: form.title,
        ...(isSpotify
          ? { spotifyUrl: form.url }
          : { appleMusicUrl: form.url }),
        bpm: parseInt(form.bpm, 10),
        workoutType: form.workoutType,
      });
      setPlaylists((prev) => [result, ...prev]);
      setForm({ title: '', url: '', bpm: '', workoutType: 'Strength' });
      setShowForm(false);
    } catch {
      /* noop */
    } finally {
      setSaving(false);
    }
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Workout Music</V2SectionLabel>
        <V2Display size="xl">Playlists.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Sdilej a objevuj playlisty pro kazdy typ treninku.
        </p>
      </section>

      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {WORKOUT_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all ${
              filter === t
                ? 'bg-[#FF375F] text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-[#A8FF00] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#A8FF00]/80 transition-all"
        >
          {showForm ? 'Zrusit' : '+ Pridat Playlist'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <GlassCard className="p-6 mb-8" hover={false}>
          <h3 className="mb-4 text-sm font-semibold text-white">
            Novy playlist
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Nazev playlistu"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
            />
            <input
              type="url"
              value={form.url}
              onChange={(e) =>
                setForm((f) => ({ ...f, url: e.target.value }))
              }
              placeholder="Spotify / Apple Music URL"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
            />
            <input
              type="number"
              value={form.bpm}
              onChange={(e) =>
                setForm((f) => ({ ...f, bpm: e.target.value }))
              }
              placeholder="BPM (napr. 140)"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
            />
            <select
              value={form.workoutType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  workoutType: e.target.value,
                }))
              }
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
            >
              {WORKOUT_TYPES.filter((t) => t !== 'All').map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !form.title || !form.url}
            className="mt-4 rounded-lg bg-[#FF375F] px-6 py-2 text-xs font-semibold text-white disabled:opacity-40 hover:bg-[#FF375F]/80 transition-all"
          >
            {saving ? 'Ukladam...' : 'Pridat'}
          </button>
        </GlassCard>
      )}

      {error && (
        <p className="mb-8 text-sm text-[#FF375F]">
          Nepodarilo se nacist playlisty.
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mb-3 text-4xl text-white/15">
            &#127925;
          </div>
          <p className="text-sm text-white/30">
            {filter === 'All'
              ? 'Zatim zadne playlisty. Bud prvni.'
              : `Zadne ${filter} playlisty.`}
          </p>
        </div>
      ) : (
        <StaggerContainer>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
            {filtered.map((p) => (
              <StaggerItem key={p.id}>
                <PlaylistCard playlist={p} />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>
      )}
    </V2Layout>
  );
}
