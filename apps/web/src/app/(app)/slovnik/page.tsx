'use client';

import { useEffect, useState } from 'react';
import { getGlossary, type GlossaryTerm } from '@/lib/api';

export default function GlossaryV2Page() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      getGlossary(query || undefined).then(setTerms).catch(console.error);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <>
      <section style={{ padding: '48px 0 32px' }}>
        <p className="v3-eyebrow-serif">Knihovna</p>
        <h1 className="v3-display-2" style={{ marginTop: 8 }}>
          Fitness<br/>
          <em className="v3-clay" style={{ fontWeight: 300 }}>slovnik.</em>
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

      <div className="space-y-1">
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
