'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import {
  getCoachingMemories,
  searchCoachingMemory,
} from '@/lib/api';

type CoachingMemory = { id: string; category: string; insight: string; exerciseName?: string; metricBefore?: number; metricAfter?: number; createdAt: string };

const CATEGORY_COLOR: Record<string, string> = {
  FORM: '#00E5FF',
  TECHNIQUE: '#A8FF00',
  RECOVERY: '#BF5AF2',
  NUTRITION: '#FF9F0A',
  MINDSET: '#FF375F',
};

export default function CoachingNotesPage() {
  const [memories, setMemories] = useState<CoachingMemory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<CoachingMemory[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { document.title = 'FitAI — Coaching Notes'; }, []);

  useEffect(() => {
    getCoachingMemories(1, 20)
      .then((res) => { setMemories(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setSearchResults(null); return; }
    debounceRef.current = setTimeout(() => {
      searchCoachingMemory(value)
        .then(setSearchResults)
        .catch(console.error);
    }, 300);
  }, []);

  function loadMore() {
    const next = page + 1;
    setLoadingMore(true);
    getCoachingMemories(next, 20)
      .then((res) => {
        setMemories((prev) => [...prev, ...res.data]);
        setTotal(res.total);
        setPage(next);
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  }

  const display = searchResults !== null ? searchResults : memories;
  const hasMore = searchResults === null && memories.length < total;

  if (loading) {
    return (
      <V2Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
        </div>
      </V2Layout>
    );
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-16">
        <V2SectionLabel>AI Memory</V2SectionLabel>
        <V2Display size="xl">Coaching Notes.</V2Display>
      </section>

      {/* Search bar */}
      <section className="mb-10">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Hledat v poznamkach..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/25"
          />
        </div>
      </section>

      {/* Empty state */}
      {display.length === 0 && (
        <section className="mb-32 rounded-2xl border border-white/8 p-12 text-center">
          <p className="mb-2 text-lg text-white/50">
            {searchResults !== null
              ? 'Zadne vysledky.'
              : 'Zatim zadne poznamky od kouche.'}
          </p>
          <p className="text-sm text-white/30">
            {searchResults !== null
              ? 'Zkus jiny dotaz.'
              : 'Zacni trenovat a AI ti bude davat zpetnou vazbu.'}
          </p>
        </section>
      )}

      {/* Timeline */}
      {display.length > 0 && (
        <section className="stagger-container mb-16 space-y-4">
          {display.map((m) => {
            const color = CATEGORY_COLOR[m.category] || '#fff';
            const hasMetrics = m.metricBefore != null && m.metricAfter != null;
            const improvement = hasMetrics
              ? Math.round(((m.metricAfter! - m.metricBefore!) / m.metricBefore!) * 100)
              : null;

            return (
              <div
                key={m.id}
                className="stagger-item animate-fadeIn rounded-2xl border border-white/8 bg-white/[0.03] p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  {/* Date */}
                  <span className="text-[11px] tabular-nums text-white/30">
                    {new Date(m.createdAt).toLocaleDateString('cs-CZ', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>

                  {/* Category badge */}
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{
                      color,
                      backgroundColor: `${color}15`,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {m.category}
                  </span>

                  {/* Exercise name */}
                  {m.exerciseName && (
                    <span className="text-[11px] font-medium text-white/50">
                      {m.exerciseName}
                    </span>
                  )}
                </div>

                {/* Insight text */}
                <p className="text-sm leading-relaxed text-white/70">
                  {m.insight}
                </p>

                {/* Improvement bar */}
                {hasMetrics && improvement !== null && (
                  <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center justify-between text-[11px]">
                      <span className="text-white/40">
                        {m.metricBefore} &rarr; {m.metricAfter}
                      </span>
                      <span
                        className="font-semibold tabular-nums"
                        style={{ color: improvement >= 0 ? '#A8FF00' : '#FF375F' }}
                      >
                        {improvement > 0 ? '+' : ''}{improvement}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(Math.abs(improvement), 100)}%`,
                          backgroundColor: improvement >= 0 ? '#A8FF00' : '#FF375F',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Load more */}
      {hasMore && (
        <section className="mb-32 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-white/10 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-40"
          >
            {loadingMore ? 'Nacitam...' : 'Nacist dalsi'}
          </button>
        </section>
      )}
    </V2Layout>
  );
}
