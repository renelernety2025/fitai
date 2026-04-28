'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Button, SectionHeader, Tag } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import { getCoachingMemories, searchCoachingMemory } from '@/lib/api';

type CoachingMemory = { id: string; category: string; insight: string; exerciseName?: string; metricBefore?: number; metricAfter?: number; createdAt: string };

const CAT_COLOR: Record<string, string> = {
  FORM: '#00E5FF', TECHNIQUE: 'var(--sage, #34d399)', RECOVERY: '#BF5AF2', NUTRITION: '#FF9F0A', MINDSET: 'var(--accent)',
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
      searchCoachingMemory(value).then(setSearchResults).catch(console.error);
    }, 300);
  }, []);

  function loadMore() {
    const next = page + 1;
    setLoadingMore(true);
    getCoachingMemories(next, 20)
      .then((res) => { setMemories((prev) => [...prev, ...res.data]); setTotal(res.total); setPage(next); })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  }

  const display = searchResults !== null ? searchResults : memories;
  const hasMore = searchResults === null && memories.length < total;

  if (loading) {
    return <><div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: 'pulse 1.5s infinite' }} /></div></>;
  }

  return (
    <>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 64px' }}>
        <section style={{ padding: '48px 0 32px' }}>
          <p className="v3-eyebrow-serif">&#9670; AI Memory</p>
          <h1 className="v3-display-2" style={{ marginTop: 8 }}>
            Your coach<br />
            <em className="v3-clay" style={{ fontWeight: 300 }}>remembers.</em>
          </h1>
        </section>

        <div style={{ position: 'relative', marginBottom: 32 }}>
          <FitIcon name="search" size={16} color="var(--text-3)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes..." style={{ width: '100%', padding: '12px 14px 12px 40px', background: 'var(--bg-card)', border: '1px solid var(--stroke-1)', borderRadius: 'var(--r-lg)', color: 'var(--text-1)', fontSize: 14, outline: 'none' }} />
        </div>

        {display.length === 0 && (
          <Card padding={48} style={{ textAlign: 'center' as const }}>
            <p className="v3-body" style={{ color: 'var(--text-2)' }}>{searchResults !== null ? 'No results.' : 'No notes yet.'}</p>
            <p className="v3-caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>{searchResults !== null ? 'Try different query.' : 'Start training and AI will give feedback.'}</p>
          </Card>
        )}

        {display.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {display.map((m) => {
              const color = CAT_COLOR[m.category] || 'var(--text-3)';
              const hasMetrics = m.metricBefore != null && m.metricAfter != null;
              const improvement = hasMetrics ? Math.round(((m.metricAfter! - m.metricBefore!) / m.metricBefore!) * 100) : null;
              return (
                <Card key={m.id} padding={20}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' as const }}>
                    <span className="v3-caption" style={{ color: 'var(--text-3)' }}>
                      {new Date(m.createdAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <Tag color={color}>{m.category}</Tag>
                    {m.exerciseName && <span className="v3-caption" style={{ color: 'var(--text-2)' }}>{m.exerciseName}</span>}
                  </div>
                  <p className="v3-body" style={{ color: 'var(--text-2)' }}>{m.insight}</p>
                  {hasMetrics && improvement !== null && (
                    <Card style={{ marginTop: 12 }} padding={12}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-3)' }}>{m.metricBefore} &rarr; {m.metricAfter}</span>
                        <span className="v3-numeric" style={{ fontWeight: 600, color: improvement >= 0 ? 'var(--sage, #34d399)' : 'var(--danger, #ef4444)' }}>
                          {improvement > 0 ? '+' : ''}{improvement}%
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(Math.abs(improvement), 100)}%`, background: improvement >= 0 ? 'var(--sage, #34d399)' : 'var(--danger, #ef4444)', borderRadius: 2 }} />
                      </div>
                    </Card>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <Button variant="ghost" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
