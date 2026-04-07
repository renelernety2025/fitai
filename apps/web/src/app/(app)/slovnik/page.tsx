'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { getGlossary, type GlossaryTerm } from '@/lib/api';

export default function GlossaryPage() {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      getGlossary(query || undefined).then(setTerms).catch(console.error);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Slovník</h1>
        <p className="mb-6 text-gray-400">Fitness termíny vysvětleny jednoduše.</p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hledej termín..."
          className="mb-6 w-full rounded-lg bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#16a34a]"
        />

        <div className="space-y-3">
          {terms.map((t) => (
            <div key={t.id} className="rounded-xl bg-gray-900 p-5">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">{t.termCs}</h3>
                {t.category && (
                  <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">{t.category}</span>
                )}
              </div>
              <p className="text-sm text-gray-300">{t.definitionCs}</p>
            </div>
          ))}
          {terms.length === 0 && (
            <p className="text-center text-gray-500">Žádné výsledky.</p>
          )}
        </div>
      </main>
    </div>
  );
}
