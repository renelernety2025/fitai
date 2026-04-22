'use client';

import { useEffect, useState, useMemo } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { getGymReviews, addGymReview } from '@/lib/api';

const EQUIPMENT_OPTIONS = [
  'Cinky', 'Jednoruky', 'Stroje', 'Kladky', 'Kardio', 'Kettlebells', 'TRX',
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

export default function GymFinderPage() {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [equipFilter, setEquipFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');
  const [form, setForm] = useState({
    name: '', address: '', rating: 4, equipment: [] as string[], notes: '',
  });

  useEffect(() => { document.title = 'FitAI — Posilovny'; }, []);

  useEffect(() => {
    getGymReviews()
      .then(setGyms)
      .catch(() => setError('Nepodarilo se nacist recenze'))
      .finally(() => setLoading(false));
  }, []);

  function toggleEquipFilter(eq: string) {
    setEquipFilter((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq],
    );
  }

  function toggleFormEquip(eq: string) {
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(eq)
        ? prev.equipment.filter((e) => e !== eq)
        : [...prev.equipment, eq],
    }));
  }

  const filtered = useMemo(() => {
    let result = gyms;
    if (equipFilter.length > 0) {
      result = result.filter((g) =>
        equipFilter.every((eq) => g.equipment?.includes(eq)),
      );
    }
    if (sortBy === 'rating') {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return result;
  }, [gyms, equipFilter, sortBy]);

  async function handleAdd() {
    if (!form.name) return;
    const review = await addGymReview(form);
    setGyms((prev) => [...prev, review]);
    setShowForm(false);
    setForm({ name: '', address: '', rating: 4, equipment: [], notes: '' });
  }

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Komunita</V2SectionLabel>
        <V2Display size="xl">Najdi posilovnu.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Recenze posiloven od komunity. Najdi tu pravou pro tvuj trenink.
        </p>
      </section>

      {loading && (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#A8FF00]" />
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-[#FF375F]/20 bg-[#FF375F]/5 px-6 py-4 text-sm text-[#FF375F]">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button onClick={() => setShowForm((p) => !p)}
          className="rounded-full border border-[#A8FF00]/30 px-6 py-2.5 text-sm font-semibold text-[#A8FF00] transition hover:bg-[#A8FF00]/10"
        >
          + Pridat recenzi
        </button>
        <button onClick={() => setSortBy(sortBy === 'rating' ? 'name' : 'rating')}
          className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-white/60 transition hover:text-white"
        >
          Radit: {sortBy === 'rating' ? 'Hodnoceni' : 'Nazev'}
        </button>
      </div>

      {/* Equipment filter chips */}
      <div className="mb-8 flex flex-wrap gap-2">
        {EQUIPMENT_OPTIONS.map((eq) => (
          <button key={eq} onClick={() => toggleEquipFilter(eq)}
            className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold transition ${
              equipFilter.includes(eq)
                ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF]'
                : 'border-white/15 text-white/50 hover:text-white'
            }`}
          >
            {eq}
          </button>
        ))}
      </div>

      {/* Add review form */}
      {showForm && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/3 p-6">
          <V2SectionLabel>Nova recenze</V2SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input type="text" placeholder="Nazev posilovny" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            />
            <input type="text" placeholder="Adresa" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-xs text-white/50">Hodnoceni</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} onClick={() => setForm({ ...form, rating: r })}
                  className="text-2xl transition hover:scale-110"
                  style={{ color: r <= form.rating ? '#FFD600' : '#333' }}
                >
                  &#9733;
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-2 block text-xs text-white/50">Vybaveni</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button key={eq} onClick={() => toggleFormEquip(eq)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition ${
                    form.equipment.includes(eq)
                      ? 'border-[#A8FF00] bg-[#A8FF00]/10 text-[#A8FF00]'
                      : 'border-white/15 text-white/40'
                  }`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>
          <textarea placeholder="Poznamky (nepovinne)" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="mt-4 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none"
            rows={2}
          />
          <button onClick={handleAdd}
            className="mt-4 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Odeslat recenzi
          </button>
        </div>
      )}

      {/* Gym list */}
      <section className="space-y-3">
        {filtered.map((g, i) => (
          <div key={g.id || i}
            className="rounded-2xl border border-white/8 p-5 transition hover:border-white/20 hover:bg-white/[0.02]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{g.name}</h3>
                {g.address && <p className="mt-0.5 text-xs text-white/40">{g.address}</p>}
              </div>
              <Stars rating={g.rating || 0} />
            </div>
            {g.equipment && g.equipment.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {g.equipment.map((eq: string) => (
                  <span key={eq} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[9px] font-semibold text-white/50">
                    {eq}
                  </span>
                ))}
              </div>
            )}
            {g.notes && <p className="mt-2 text-xs text-white/40">{g.notes}</p>}
          </div>
        ))}
      </section>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-white/30">
          Zadne posilovny. Bud prvni kdo prida recenzi!
        </div>
      )}
    </V2Layout>
  );
}
