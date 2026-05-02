'use client';

import { useEffect, useState } from 'react';
import { getGlossary, type GlossaryTerm } from '@/lib/api';

export default function GlossaryV2Page() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const t = setTimeout(() => {
      getGlossary(query || undefined)
        .then(setTerms)
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <>
      <section style={{ padding: '48px 0 32px' }}>
        <p className="v3-eyebrow-serif">Library</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Fitness<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>glossary.</em>
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Fitness terms explained simply. {terms.length} terms.
        </p>
      </section>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search terms..."
        className="mb-16 w-full border-b border-white/15 bg-transparent py-4 text-2xl text-white placeholder-white/20 focus:border-white focus:outline-none"
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <span className="v3-caption" style={{ color: 'var(--text-3)' }}>Loading...</span>
        </div>
      )}

      {error && !loading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <p className="v3-body" style={{ color: 'var(--danger, #ef4444)' }}>Failed to load glossary.</p>
        </div>
      )}

      <div className="space-y-1" style={{ display: loading ? 'none' : undefined }}>
        {terms.map((t) => (
          <div key={t.id} className="border-b border-white/8 py-8">
            <div className="mb-3 flex items-baseline gap-3">
              <h2 className="v3-title">{t.termCs}</h2>
              {t.category && (
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  {t.category}
                </span>
              )}
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-white/55">{t.definitionCs}</p>
          </div>
        ))}
        {terms.length === 0 && (
          <p className="py-12 text-center text-sm text-white/40">No results.</p>
        )}
      </div>
    </>
  );
}
