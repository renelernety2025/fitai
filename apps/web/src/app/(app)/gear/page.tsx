'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getMyGear, addGearItem, deleteGearItem } from '@/lib/api';

type GearItem = {
  id: string;
  category: string;
  brand: string;
  model: string;
  sessionCount: number;
  maxSessions: number;
  purchaseDate: string | null;
  priceKc: number | null;
};

const CATEGORY_ICONS: Record<string, string> = {
  SHOES: '\uD83D\uDC5F',
  BELT: '\uD83C\uDFCB\uFE0F',
  GLOVES: '\uD83E\uDDE4',
  WRAPS: '\uD83D\uDD17',
  CLOTHING: '\uD83D\uDC55',
  EQUIPMENT: '\u2699\uFE0F',
};

const CATEGORIES = Object.keys(CATEGORY_ICONS);

function wearPercent(item: GearItem): number {
  if (!item.maxSessions || item.maxSessions <= 0) return 0;
  return Math.min((item.sessionCount / item.maxSessions) * 100, 100);
}

function wearColor(pct: number): string {
  if (pct >= 80) return '#FF375F';
  if (pct >= 50) return '#FF9F0A';
  return '#A8FF00';
}

export default function GearPage() {
  const [items, setItems] = useState<GearItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    category: 'SHOES',
    brand: '',
    model: '',
    maxSessions: 300,
    purchaseDate: '',
    priceKc: 0,
  });

  useEffect(() => {
    document.title = 'FitAI — Gear';
  }, []);

  function load() {
    setLoading(true);
    getMyGear()
      .then((g) => setItems(g as GearItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleAdd() {
    if (!form.brand.trim() || !form.model.trim()) return;
    addGearItem({
      category: form.category,
      brand: form.brand,
      model: form.model,
      maxSessions: form.maxSessions,
      purchaseDate: form.purchaseDate || undefined,
      priceKc: form.priceKc || undefined,
    })
      .then(() => { setShowAdd(false); load(); })
      .catch(() => {});
  }

  function handleDelete(id: string) {
    deleteGearItem(id)
      .then(() => load())
      .catch(() => {});
  }

  return (
    <V2Layout>
      <Link
        href="/dashboard"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        &larr; Dashboard
      </Link>

      <section className="pt-8 pb-6">
        <V2SectionLabel>MY EQUIPMENT</V2SectionLabel>
        <V2Display size="xl">Gear</V2Display>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Sleduj opotrebeni sveho vybaveni. Vcas vymena = mene zraneni.
        </p>
      </section>

      <button
        onClick={() => setShowAdd(true)}
        className="mb-6 rounded-xl bg-[#00E5FF] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-[#00E5FF]/80"
      >
        + Add Gear
      </button>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <p className="text-3xl">
            {CATEGORY_ICONS.SHOES}
          </p>
          <p className="mt-3 text-sm text-white/40">
            Zatim zadne vybaveni. Pridej sve prvni boty nebo rukavice!
          </p>
        </div>
      ) : (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const pct = wearPercent(item);
            const color = wearColor(pct);
            return (
              <StaggerItem key={item.id}>
                <div className="group relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition hover:border-white/15">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute right-3 top-3 text-white/20 opacity-0 transition group-hover:opacity-100 hover:text-[#FF375F]"
                    title="Smazat"
                  >
                    &times;
                  </button>
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-2xl">
                      {CATEGORY_ICONS[item.category] || CATEGORY_ICONS.EQUIPMENT}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.brand} {item.model}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-white/40">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="mb-1 flex items-center justify-between text-xs text-white/50">
                    <span>{item.sessionCount} sessions</span>
                    <span style={{ color }}>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-white/30">
                    Max {item.maxSessions} sessions
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Add Gear</h3>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Category
            </label>
            <div className="mb-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, category: c })}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    form.category === c
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {CATEGORY_ICONS[c]} {c}
                </button>
              ))}
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  Brand
                </label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#00E5FF]"
                  placeholder="Nike"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                  Model
                </label>
                <input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#00E5FF]"
                  placeholder="Metcon 9"
                />
              </div>
            </div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
              Max Sessions
            </label>
            <input
              type="number"
              value={form.maxSessions}
              onChange={(e) => setForm({ ...form, maxSessions: Number(e.target.value) })}
              className="mb-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#00E5FF]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-semibold uppercase text-white/60 transition hover:text-white"
              >
                Zrusit
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 rounded-xl bg-[#00E5FF] py-2.5 text-xs font-semibold uppercase text-black transition hover:bg-[#00E5FF]/80"
              >
                Pridat
              </button>
            </div>
          </div>
        </div>
      )}
    </V2Layout>
  );
}
