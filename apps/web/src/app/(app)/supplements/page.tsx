'use client';

import { useCallback, useEffect, useState } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import {
  getMyStack,
  logSupplement,
  getSupplementCatalog,
  addToStack,
} from '@/lib/api';

type Supplement = { id: string; name: string; dosage: string; timing: string; takenToday: boolean; monthlyCost?: number };
type SupplementCatalogItem = { id: string; name: string; defaultDosage: string; description?: string };

const TIMING_COLOR: Record<string, string> = {
  MORNING: '#FF9F0A',
  PRE_WORKOUT: '#FF375F',
  POST_WORKOUT: '#A8FF00',
  EVENING: '#BF5AF2',
};

const TIMING_LABEL: Record<string, string> = {
  MORNING: 'Morning',
  PRE_WORKOUT: 'Pre-workout',
  POST_WORKOUT: 'Post-workout',
  EVENING: 'Evening',
};

export default function SupplementsPage() {
  const [stack, setStack] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [catalog, setCatalog] = useState<SupplementCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [selectedCatalogId, setSelectedCatalogId] = useState('');

  useEffect(() => { document.title = 'FitAI — Supplements'; }, []);

  const refresh = useCallback(() => {
    getMyStack()
      .then(setStack)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function handleToggle(id: string) {
    logSupplement(id).then(refresh).catch(console.error);
  }

  function openModal() {
    setShowModal(true);
    if (catalog.length === 0) {
      setCatalogLoading(true);
      getSupplementCatalog()
        .then(setCatalog)
        .catch(console.error)
        .finally(() => setCatalogLoading(false));
    }
  }

  function handleAdd() {
    if (!selectedCatalogId) return;
    addToStack({ supplementId: selectedCatalogId, dosage: '', timing: '' })
      .then(() => {
        setShowModal(false);
        setSelectedCatalogId('');
        refresh();
      })
      .catch(console.error);
  }

  const takenCount = stack.filter((s) => s.takenToday).length;

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
        <V2SectionLabel>My Stack</V2SectionLabel>
        <V2Display size="xl">Supplement Stack.</V2Display>
      </section>

      {/* Empty state */}
      {stack.length === 0 && !showModal && (
        <section className="mb-16 rounded-2xl border border-white/8 p-12 text-center">
          <p className="mb-2 text-lg text-white/50">
            Tvuj stack je prazdny.
          </p>
          <p className="mb-6 text-sm text-white/30">
            Pridej prvni suplement!
          </p>
          <button
            onClick={openModal}
            className="inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:scale-105"
          >
            Pridat suplement
          </button>
        </section>
      )}

      {/* Daily checklist header */}
      {stack.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                Today&apos;s Progress
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-white">
                {takenCount}
                <span className="text-white/30">/{stack.length}</span>
              </div>
            </div>
            <button
              onClick={openModal}
              className="rounded-full border border-white/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50 transition hover:border-white/25 hover:text-white"
            >
              + Add
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: stack.length > 0 ? `${(takenCount / stack.length) * 100}%` : '0%',
                backgroundColor: '#A8FF00',
              }}
            />
          </div>
        </section>
      )}

      {/* Supplement cards */}
      {stack.length > 0 && (
        <section className="stagger-container mb-32 grid gap-4 sm:grid-cols-2">
          {stack.map((s) => {
            const color = TIMING_COLOR[s.timing] || '#fff';
            return (
              <div
                key={s.id}
                className={`stagger-item animate-fadeIn rounded-2xl border p-6 transition ${
                  s.takenToday
                    ? 'border-white/15 bg-white/[0.05]'
                    : 'border-white/8 bg-white/[0.03]'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  {/* Timing badge */}
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{
                      color,
                      backgroundColor: `${color}15`,
                      border: `1px solid ${color}30`,
                    }}
                  >
                    {TIMING_LABEL[s.timing] || s.timing}
                  </span>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(s.id)}
                    className="group flex h-7 w-7 items-center justify-center rounded-full border transition"
                    style={{
                      borderColor: s.takenToday ? '#A8FF00' : 'rgba(255,255,255,0.15)',
                      backgroundColor: s.takenToday ? '#A8FF0020' : 'transparent',
                    }}
                  >
                    {s.takenToday ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-6" stroke="#A8FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-white/20 transition group-hover:bg-white/50" />
                    )}
                  </button>
                </div>

                {/* Name + dosage */}
                <div className="mb-1 text-base font-semibold tracking-tight text-white">
                  {s.name}
                </div>
                <div className="text-sm text-white/50">
                  {s.dosage}
                </div>

                {/* Monthly cost */}
                {s.monthlyCost != null && (
                  <div className="mt-3 text-[11px] tabular-nums text-white/30">
                    {s.monthlyCost} Kc/mesic
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Add supplement modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="animate-scaleIn w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Pridat suplement
              </h2>
              <button
                onClick={() => { setShowModal(false); setSelectedCatalogId(''); }}
                className="text-white/40 transition hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="5" y1="5" x2="15" y2="15" />
                  <line x1="15" y1="5" x2="5" y2="15" />
                </svg>
              </button>
            </div>

            {catalogLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/40" />
              </div>
            ) : (
              <>
                <select
                  value={selectedCatalogId}
                  onChange={(e) => setSelectedCatalogId(e.target.value)}
                  className="mb-6 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                >
                  <option value="" className="bg-[#111]">Vyber suplement...</option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111]">
                      {c.name} — {c.defaultDosage}
                    </option>
                  ))}
                </select>

                {selectedCatalogId && (() => {
                  const item = catalog.find((c) => c.id === selectedCatalogId);
                  return item ? (
                    <div className="mb-6 rounded-xl border border-white/8 bg-white/[0.02] p-4">
                      <p className="text-sm leading-relaxed text-white/55">
                        {item.description}
                      </p>
                    </div>
                  ) : null;
                })()}

                <button
                  onClick={handleAdd}
                  disabled={!selectedCatalogId}
                  className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:opacity-30"
                >
                  Pridat do stacku
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </V2Layout>
  );
}
