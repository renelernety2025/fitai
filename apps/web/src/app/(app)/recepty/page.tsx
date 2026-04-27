'use client';

import { useEffect, useState } from 'react';
import { Card, Chip, Tag, SectionHeader, Button } from '@/components/v3';
import { FitIcon } from '@/components/icons/FitIcons';
import {
  getRecipes,
  toggleRecipeFavorite,
  deleteRecipe,
  type Recipe,
} from '@/lib/api';
import RecipeDetail from '@/components/nutrition/RecipeDetail';
import RecipeFormModal from '@/components/nutrition/RecipeFormModal';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { document.title = 'FitAI — Recipes'; }, []);

  const reload = () => {
    getRecipes()
      .then(setRecipes)
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(reload, []);

  const allTags = Array.from(new Set(recipes.flatMap((r) => r.tags)));
  const filtered = recipes.filter((r) => {
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
      <div style={{ background: 'var(--bg-0)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="v3-eyebrow" style={{ opacity: 0.4 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-0)', minHeight: '100vh', padding: '40px 56px' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="v3-eyebrow-serif" style={{ marginBottom: 12 }}>Recipes</div>
        <h1 className="v3-display-2" style={{ margin: 0 }}>
          Recipes that<br />
          <span className="v3-clay" style={{ fontWeight: 300 }}>fuel you.</span>
        </h1>
      </div>

      {/* Search + actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <FitIcon name="search" size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            style={{
              width: '100%', padding: '10px 14px 10px 40px',
              background: 'var(--bg-2)', border: '1px solid var(--stroke-1)',
              borderRadius: 'var(--r-lg)', color: 'var(--text-1)', fontSize: 14,
            }}
          />
        </div>
        <Button variant="accent" onClick={() => setShowForm(true)}>
          <FitIcon name="plus" size={14} color="#fff" />
          <span>New recipe</span>
        </Button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <Chip active={!activeTag} onClick={() => setActiveTag(null)}>All</Chip>
        {allTags.map((t) => (
          <Chip key={t} active={activeTag === t} onClick={() => setActiveTag(activeTag === t ? null : t)}>{t}</Chip>
        ))}
      </div>

      {/* Recipe grid */}
      {filtered.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <div className="v3-caption">{recipes.length === 0 ? 'No recipes yet. Create your first!' : 'No results'}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {filtered.map((r) => (
            <RecipeGridCard key={r.id} recipe={r} onSelect={() => setSelected(r)} onFavorite={() => handleFavorite(r.id)} />
          ))}
        </div>
      )}

      {selected && (
        <RecipeDetail recipe={selected} onClose={() => setSelected(null)} onDelete={() => handleDelete(selected.id)} onFavorite={() => handleFavorite(selected.id)} />
      )}
      {showForm && (
        <RecipeFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); reload(); }} />
      )}
    </div>
  );
}

function RecipeGridCard({ recipe, onSelect, onFavorite }: { recipe: Recipe; onSelect: () => void; onFavorite: () => void }) {
  return (
    <Card padding={0} hover onClick={onSelect} style={{ overflow: 'hidden' }}>
      <div style={{ height: 200, background: 'var(--bg-3)', position: 'relative' }}>
        {recipe.tags[0] && (
          <span style={{ position: 'absolute', top: 12, left: 12 }}>
            <Tag color="var(--accent)">{recipe.tags[0]}</Tag>
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onFavorite(); }}
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <FitIcon name="heart" size={18} color={recipe.isFavorite ? 'var(--accent)' : 'var(--text-3)'} />
        </button>
      </div>
      <div style={{ padding: 20 }}>
        <div className="v3-title" style={{ marginBottom: 8, fontSize: 15 }}>{recipe.name}</div>
        <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>
          <span>{recipe.kcalPerServing ?? 0} kcal</span>
          <span>{recipe.proteinG ?? 0}g P</span>
          <span>{recipe.prepMinutes ?? 0} min</span>
        </div>
      </div>
    </Card>
  );
}
