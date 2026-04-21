'use client';

import { useEffect, useState } from 'react';
import {
  V2Layout,
  V2SectionLabel,
  V2Display,
} from '@/components/v2/V2Layout';
import {
  getRecipes,
  toggleRecipeFavorite,
  deleteRecipe,
  type Recipe,
} from '@/lib/api';
import RecipeCard from '@/components/nutrition/RecipeCard';
import RecipeDetail from '@/components/nutrition/RecipeDetail';
import RecipeFormModal from '@/components/nutrition/RecipeFormModal';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);

  const reload = () => {
    getRecipes().then(setRecipes).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(reload, []);

  const allTags = Array.from(new Set(recipes.flatMap((r) => r.tags)));
  const filtered = recipes.filter((r) => {
    if (favOnly && !r.isFavorite) return false;
    if (activeTag && !r.tags.includes(activeTag)) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleFavorite(id: string) {
    await toggleRecipeFavorite(id);
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)));
  }

  async function handleDelete(id: string) {
    await deleteRecipe(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
  }

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
      {/* Hero */}
      <section className="pt-12 pb-16 text-center">
        <V2SectionLabel>Kniha receptu</V2SectionLabel>
        <V2Display size="lg">Moje recepty</V2Display>
        <p className="mt-3 text-sm text-white/40">{recipes.length} receptu</p>
      </section>

      {/* Actions */}
      <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Hledat recepty..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-white/25 focus:outline-none sm:max-w-xs"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-black"
            style={{ backgroundColor: '#A8FF00' }}
          >
            + Novy recept
          </button>
        </div>
      </section>

      {/* Filter chips */}
      <section className="mb-10 flex flex-wrap gap-2">
        <FilterChip active={favOnly} onClick={() => setFavOnly(!favOnly)} label="Oblibene" />
        {allTags.map((tag) => (
          <FilterChip
            key={tag}
            active={activeTag === tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            label={tag}
          />
        ))}
      </section>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center text-sm text-white/30">
          {recipes.length === 0 ? 'Zatim zadne recepty. Pridejte prvni!' : 'Zadne vysledky'}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {filtered.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onSelect={() => setSelected(r)}
              onFavorite={() => handleFavorite(r.id)}
            />
          ))}
        </section>
      )}

      {/* Detail modal */}
      {selected && (
        <RecipeDetail
          recipe={selected}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected.id)}
          onFavorite={() => handleFavorite(selected.id)}
        />
      )}

      {/* Create form modal */}
      {showForm && (
        <RecipeFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); reload(); }}
        />
      )}
    </V2Layout>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-4 py-1.5 text-[11px] font-medium transition"
      style={{
        borderColor: active ? '#A8FF00' : 'rgba(255,255,255,0.1)',
        color: active ? '#A8FF00' : 'rgba(255,255,255,0.5)',
        backgroundColor: active ? 'rgba(168,255,0,0.08)' : 'transparent',
      }}
    >
      {label}
    </button>
  );
}
