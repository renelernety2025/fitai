'use client';

import { type Recipe } from '@/lib/api';

interface Props {
  recipe: Recipe;
  onSelect: () => void;
  onFavorite: () => void;
}

export default function RecipeCard({ recipe, onSelect, onFavorite }: Props) {
  const totalTime = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

  return (
    <div
      className="group relative cursor-pointer rounded-2xl border border-white/8 bg-white/[0.02] p-6 transition hover:border-white/15 hover:bg-white/[0.04]"
      onClick={onSelect}
    >
      {/* Favorite heart */}
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite(); }}
        className="absolute right-5 top-5 text-lg transition"
        style={{ color: recipe.isFavorite ? '#FF375F' : 'rgba(255,255,255,0.15)' }}
      >
        {recipe.isFavorite ? '\u2665' : '\u2661'}
      </button>

      {/* Name */}
      <h3 className="pr-8 text-lg font-bold text-white">{recipe.name}</h3>

      {/* Description */}
      {recipe.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/40">
          {recipe.description}
        </p>
      )}

      {/* Time + servings */}
      <div className="mt-4 flex gap-4 text-[11px] text-white/35">
        {totalTime > 0 && (
          <span>{totalTime} min</span>
        )}
        <span>{recipe.servings} porci</span>
      </div>

      {/* Macros */}
      {recipe.kcalPerServing != null && (
        <div className="mt-3 flex gap-3 text-[11px]">
          <span className="text-white/50">{recipe.kcalPerServing} kcal</span>
          {recipe.proteinG != null && (
            <span style={{ color: '#FF375F' }}>P {recipe.proteinG}g</span>
          )}
          {recipe.carbsG != null && (
            <span style={{ color: '#A8FF00' }}>S {recipe.carbsG}g</span>
          )}
          {recipe.fatG != null && (
            <span style={{ color: '#00E5FF' }}>T {recipe.fatG}g</span>
          )}
        </div>
      )}

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 px-2.5 py-0.5 text-[10px] text-white/35"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
