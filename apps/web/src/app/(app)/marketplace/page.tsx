'use client';

import { useEffect, useState, useMemo } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getMarketplace, getMarketplaceListing, createListing, purchaseListing, rateListing } from '@/lib/api';

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  workout_plan: { label: 'Treninkovy plan', color: '#FF375F' },
  meal_plan: { label: 'Jidelnicek', color: '#A8FF00' },
  challenge: { label: 'Vyzva', color: '#00E5FF' },
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Nejnovejsi' },
  { value: 'popular', label: 'Nejpopularnejsi' },
  { value: 'rating', label: 'Nejlepe hodnocene' },
];

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#FFD600' : '#333' }}>
          &#9733;
        </span>
      ))}
    </span>
  );
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', type: 'workout_plan', price: 100, tags: '',
  });
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => { document.title = 'FitAI — Marketplace'; }, []);

  useEffect(() => {
    getMarketplace()
      .then(setListings)
      .catch(() => setError('Nepodarilo se nacist marketplace'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = listings.filter((l) => {
      if (typeFilter !== 'ALL' && l.type !== typeFilter) return false;
      if (search && !l.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sort === 'popular') result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    else if (sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return result;
  }, [listings, search, typeFilter, sort]);

  async function handlePurchase(id: string) {
    setPurchasing(true);
    try {
      await purchaseListing(id);
      setSelected((prev: any) => prev ? { ...prev, purchased: true } : prev);
    } catch { /* noop */ } finally {
      setPurchasing(false);
    }
  }

  async function handleCreate() {
    if (!createForm.title) return;
    const listing = await createListing({
      ...createForm,
      tags: createForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setListings((prev) => [listing, ...prev]);
    setShowCreate(false);
    setCreateForm({ title: '', description: '', type: 'workout_plan', price: 100, tags: '' });
  }

  async function handleRate(id: string, r: number) {
    await rateListing(id, r);
    setSelected((prev: any) => prev ? { ...prev, rating: r } : prev);
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Komunita</V2SectionLabel>
        <V2Display size="xl">Marketplace.</V2Display>
      </section>

      {loading && (
        <div className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
          {error}
        </div>
      )}

      {/* Search + filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input type="text" placeholder="Hledej..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-white/30 outline-none"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button onClick={() => setTypeFilter('ALL')}
          className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
            typeFilter === 'ALL' ? 'border-white bg-white text-black' : 'border-white/15 text-white/60 hover:text-white'
          }`}
        >
          Vse
        </button>
        {Object.entries(TYPE_BADGES).map(([key, { label, color }]) => (
          <button key={key} onClick={() => setTypeFilter(key)}
            className={`rounded-full border px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition ${
              typeFilter === key ? 'text-black' : 'border-white/15 text-white/60 hover:text-white'
            }`}
            style={typeFilter === key ? { borderColor: color, backgroundColor: color } : undefined}
          >
            {label}
          </button>
        ))}
        <button onClick={() => setShowCreate(true)}
          className="ml-auto rounded-full border border-[#A8FF00]/30 px-5 py-2 text-[11px] font-semibold text-[#A8FF00] transition hover:bg-[#A8FF00]/10"
        >
          + Vytvorit
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/3 p-6">
          <V2SectionLabel>Novy listing</V2SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Nazev" value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            />
            <select value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none"
            >
              {Object.entries(TYPE_BADGES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input type="number" placeholder="Cena (XP)" value={createForm.price}
              onChange={(e) => setCreateForm({ ...createForm, price: parseInt(e.target.value) || 0 })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none"
            />
            <input type="text" placeholder="Tagy (carkou)" value={createForm.tags}
              onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
          <textarea placeholder="Popis..." value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            className="mt-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            rows={3}
          />
          <div className="mt-4 flex gap-3">
            <button onClick={handleCreate} className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black">Vytvorit</button>
            <button onClick={() => setShowCreate(false)} className="text-sm text-white/40">Zrusit</button>
          </div>
        </div>
      )}

      {/* Listing detail overlay */}
      {selected && (
        <div className="mb-8 rounded-2xl border border-[#FFD600]/20 bg-[#FFD600]/5 p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-[10px] font-semibold"
              style={{ background: TYPE_BADGES[selected.type]?.color || '#555', color: '#000' }}
            >
              {TYPE_BADGES[selected.type]?.label || selected.type}
            </span>
            <Stars rating={selected.rating || 0} />
          </div>
          <h3 className="mt-2 text-xl font-bold text-white">{selected.title}</h3>
          <p className="mt-2 text-sm text-white/55">{selected.description}</p>
          <div className="mt-3 text-xs text-white/40">
            Autor: {selected.author?.name || 'Neznamy'} · {selected.downloads || 0} stazeni
          </div>
          <div className="mt-4 flex items-center gap-3">
            {!selected.purchased ? (
              <button onClick={() => handlePurchase(selected.id)} disabled={purchasing}
                className="rounded-full bg-[#FFD600] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-[#FFD600]/80 disabled:opacity-50"
              >
                Koupit za {selected.price || 0} XP
              </button>
            ) : (
              <span className="text-sm font-semibold text-[#A8FF00]">Zakoupeno</span>
            )}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => handleRate(selected.id, r)}
                  className="text-lg transition hover:scale-110"
                  style={{ color: r <= (selected.rating || 0) ? '#FFD600' : '#333' }}
                >
                  &#9733;
                </button>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="ml-auto text-xs text-white/30 hover:text-white">Zavrit</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((l) => {
          const badge = TYPE_BADGES[l.type];
          return (
            <button key={l.id} onClick={() => setSelected(l)}
              className="rounded-2xl border border-white/8 p-5 text-left transition hover:border-white/20 hover:bg-white/[0.02]"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold"
                  style={{ background: badge?.color || '#555', color: '#000' }}
                >
                  {badge?.label || l.type}
                </span>
                <Stars rating={l.rating || 0} size={11} />
              </div>
              <div className="text-sm font-bold text-white">{l.title}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-bold tabular-nums text-[#FFD600]">{l.price || 0} XP</span>
                <span className="text-[10px] text-white/30">{l.downloads || 0} stazeni</span>
              </div>
            </button>
          );
        })}
      </section>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-white/30">Zadne listingy k zobrazeni.</div>
      )}
    </V2Layout>
  );
}
