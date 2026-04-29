'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, Button, Chip, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getPlaylists, addPlaylistLink, type PlaylistLink } from '@/lib/api';

const TYPES = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga', 'Recovery'];
const TYPE_COLOR: Record<string, string> = { strength: 'var(--accent)', cardio: 'var(--sage)', hiit: 'var(--warning)', yoga: 'var(--clay-deep)', recovery: 'var(--clay)' };

function detectPlatform(url: string): string {
  if (url.includes('spotify')) return 'Spotify';
  if (url.includes('apple') || url.includes('music.apple')) return 'Apple Music';
  if (url.includes('youtube')) return 'YouTube';
  return 'Link';
}

function getUrl(p: PlaylistLink): string { return p.spotifyUrl || p.appleMusicUrl || '#'; }

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', bpm: '', workoutType: 'Strength' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'FitAI — Playlists'; }, []);
  useEffect(() => { getPlaylists().then(setPlaylists).catch(() => setError(true)).finally(() => setLoading(false)); }, []);

  const filtered = useMemo(() => {
    if (filter === 'All') return playlists;
    return playlists.filter((p) => (p.workoutType || '').toLowerCase() === filter.toLowerCase());
  }, [playlists, filter]);

  async function handleAdd() {
    if (!form.title || !form.url || !form.bpm) return;
    setSaving(true);
    try {
      const isSpotify = form.url.includes('spotify');
      const result = await addPlaylistLink({ title: form.title, ...(isSpotify ? { spotifyUrl: form.url } : { appleMusicUrl: form.url }), bpm: parseInt(form.bpm, 10), workoutType: form.workoutType });
      setPlaylists((prev) => [result, ...prev]);
      setForm({ title: '', url: '', bpm: '', workoutType: 'Strength' }); setShowForm(false);
    } catch { /* noop */ } finally { setSaving(false); }
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; Music</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>Your workout<br /><em className="v3-clay" style={{ fontWeight: 300 }}>soundtrack.</em></h1>
        </section>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, alignItems: 'center', marginBottom: 24 }}>
          {TYPES.map((t) => <Chip key={t} active={filter === t} onClick={() => setFilter(t)}>{t}</Chip>)}
          <div style={{ flex: 1 }} />
          <Button variant={showForm ? 'ghost' : 'accent'} size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Playlist'}
          </Button>
        </div>

        {showForm && (
          <Card padding={20} style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Playlist name" style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 14 }} />
              <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Spotify / Apple Music URL" style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 14 }} />
              <input type="number" value={form.bpm} onChange={(e) => setForm({ ...form, bpm: e.target.value })} placeholder="BPM" style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 14 }} />
              <select value={form.workoutType} onChange={(e) => setForm({ ...form, workoutType: e.target.value })} style={{ padding: '10px 14px', borderRadius: 'var(--r-lg)', border: '1px solid var(--stroke-1)', background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 14 }}>
                {TYPES.filter((t) => t !== 'All').map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginTop: 12 }}><Button variant="accent" onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Add'}</Button></div>
          </Card>
        )}

        {error && <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 16 }}>Failed to load playlists.</p>}

        {loading ? (
          <div style={{ display: 'flex', height: 200, alignItems: 'center', justifyContent: 'center' }}><span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span></div>
        ) : filtered.length === 0 ? (
          <Card padding={48} style={{ textAlign: 'center' as const }}>
            <FitIcon name="music" size={28} color="var(--text-3)" />
            <p className="v3-body" style={{ color: 'var(--text-3)', marginTop: 12 }}>{filter === 'All' ? 'No playlists yet. Be first.' : `No ${filter} playlists.`}</p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {filtered.map((p) => {
              const url = getUrl(p);
              const platform = detectPlatform(url);
              const wt = p.workoutType || 'Other';
              return (
                <Card key={p.id} padding={20}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <span className="v3-body" style={{ fontWeight: 600, color: 'var(--text-1)' }}>{p.title}</span>
                    <Tag color={TYPE_COLOR[wt.toLowerCase()]}>{wt}</Tag>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <span className="v3-caption" style={{ color: 'var(--text-2)' }}>{platform}</span>
                    <span className="v3-caption" style={{ color: 'var(--text-3)' }}>{p.bpm} BPM</span>
                    <span className="v3-caption" style={{ color: 'var(--text-3)' }}>by {p.user?.name || 'Unknown'}</span>
                  </div>
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                    Open &#8599;
                  </a>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
