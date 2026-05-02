'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, Chip, Tag, SectionHeader } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getExercises, type ExerciseData } from '@/lib/api';
import { isFavorite, toggleFavorite, getFavoriteIds } from '@/lib/favorites';

const FILTERS = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
const FILTER_GROUPS: Record<string, string[]> = {
  Chest: ['CHEST'],
  Back: ['BACK'],
  Shoulders: ['SHOULDERS'],
  Arms: ['BICEPS', 'TRICEPS'],
  Legs: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS', 'CALVES'],
  Core: ['CORE'],
};

const DIFF_COLOR: Record<string, string> = {
  BEGINNER: 'var(--sage)',
  INTERMEDIATE: 'var(--accent)',
  ADVANCED: '#FF375F',
};

const DIFF_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const PLACEHOLDER_IMGS = [
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=75&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=75&auto=format&fit=crop',
];

export default function ExercisesPage() {
  const [allExercises, setAllExercises] = useState<ExerciseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [showFavs, setShowFavs] = useState(false);

  useEffect(() => { document.title = 'FitAI — Exercise Library'; }, []);

  useEffect(() => {
    getExercises()
      .then(setAllExercises)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    setFavIds(new Set(getFavoriteIds()));
  }, []);

  function handleToggleFav(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
    setFavIds(new Set(getFavoriteIds()));
  }

  const exercises = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allExercises.filter((ex) => {
      if (showFavs && !favIds.has(ex.id)) return false;
      if (filter !== 'All') {
        const allowed = FILTER_GROUPS[filter] || [];
        const match = ex.muscleGroups.some((g) => allowed.includes(g.toUpperCase()));
        if (!match) return false;
      }
      if (q && !ex.nameCs.toLowerCase().includes(q)
        && !ex.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allExercises, filter, search, showFavs, favIds]);

  return (
    <div style={{ background: 'var(--bg-0)', color: 'var(--text-1)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        position: 'relative', padding: '80px 48px 56px', overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(232,93,44,0.08) 0%, var(--bg-0) 100%)',
        borderBottom: '1px solid var(--stroke-1)',
      }}>
        <div className="v3-eyebrow" style={{ color: 'var(--accent-hot)', marginBottom: 16 }}>
          THE FACULTY &middot; {allExercises.length || '60'}+ EXERCISES
        </div>
        <h1 className="v3-display-1" style={{ marginBottom: 16 }}>
          World-class.{' '}
          <span style={{ color: 'var(--text-3)', fontWeight: 300 }}>On demand.</span>
        </h1>
        <p className="v3-body" style={{ maxWidth: 520, color: 'var(--text-2)' }}>
          Detailed instructions, movement phases, breathing cues, tempo.
          Form over weight, always.
        </p>
      </div>

      {/* Filters */}
      <div style={{
        padding: '20px 48px', display: 'flex', alignItems: 'center',
        gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--stroke-1)',
      }}>
        {FILTERS.map((c) => (
          <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>{c}</Chip>
        ))}
        <div style={{ flex: 1 }} />
        <Chip
          active={showFavs}
          onClick={() => setShowFavs((p) => !p)}
          icon={<FitIcon name="heart" size={14} />}
        >
          Favorites
        </Chip>
        <div style={{
          marginLeft: 8, padding: '0 16px', height: 40, display: 'flex',
          alignItems: 'center', borderRadius: 'var(--r-pill)',
          border: '1px solid var(--stroke-2)', background: 'transparent',
        }}>
          <FitIcon name="search" size={16} color="var(--text-3)" />
          <input
            type="text" value={search} placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-1)', fontSize: 13, marginLeft: 8, width: 140,
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '32px 48px', textAlign: 'center' }}>
          <p className="v3-body" style={{ color: 'var(--danger, #ef4444)', marginBottom: 12 }}>Failed to load exercises.</p>
          <button onClick={() => { setError(false); setLoading(true); getExercises().then(setAllExercises).catch(() => setError(true)).finally(() => setLoading(false)); }}
            style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Try again</button>
        </div>
      )}

      {/* Count */}
      <div style={{ padding: '16px 48px 0' }}>
        <span className="v3-caption">
          {loading ? 'Loading...' : error ? '' : `${exercises.length} exercises`}
        </span>
      </div>

      {/* Grid */}
      <div style={{
        padding: '24px 48px 64px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16,
      }}>
        {exercises.map((ex, i) => (
          <Link key={ex.id} href={`/exercises/${ex.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card padding={0} hover style={{ overflow: 'hidden', minHeight: 280, cursor: 'pointer' }}>
              <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                <img
                  src={PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length]}
                  alt={ex.nameCs}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)',
                }} />
                <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                  <Tag color={DIFF_COLOR[ex.difficulty]}>
                    {DIFF_LABEL[ex.difficulty] ?? ex.difficulty}
                  </Tag>
                </div>
                <button
                  onClick={(e) => handleToggleFav(ex.id, e)}
                  style={{
                    position: 'absolute', top: 12, right: 12, background: 'none',
                    border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  <FitIcon
                    name="heart"
                    size={20}
                    color={favIds.has(ex.id) ? 'var(--accent)' : 'rgba(255,255,255,0.4)'}
                  />
                </button>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                  {ex.name || ex.nameCs}
                </div>
                <div className="v3-caption">
                  {ex.muscleGroups.slice(0, 3).join(' / ')}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!loading && exercises.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-3)' }}>
          <p>No exercises match your filters.</p>
          <button
            onClick={() => { setFilter('All'); setSearch(''); setShowFavs(false); }}
            style={{
              marginTop: 16, background: 'none', border: 'none',
              color: 'var(--accent)', cursor: 'pointer', fontSize: 14,
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
