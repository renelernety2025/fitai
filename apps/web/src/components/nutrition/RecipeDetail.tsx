'use client';

import { type Recipe } from '@/lib/api';

interface Props {
  recipe: Recipe;
  onClose: () => void;
  onDelete: () => void;
  onFavorite: () => void;
}

export default function RecipeDetail({ recipe, onClose, onDelete, onFavorite }: Props) {
  const totalTime = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-xl sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-black p-8 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{recipe.name}</h2>
            {recipe.description && (
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {recipe.description}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onFavorite}
              className="text-lg transition"
              style={{ color: recipe.isFavorite ? '#FF375F' : 'rgba(255,255,255,0.25)' }}
            >
              {recipe.isFavorite ? '\u2665' : '\u2661'}
            </button>
            <button onClick={onClose} className="text-white/40 transition hover:text-white">
              X
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="mb-6 flex flex-wrap gap-4 text-xs text-white/40">
          {totalTime > 0 && <span>Celkem {totalTime} min</span>}
          {recipe.prepMinutes != null && <span>Priprava {recipe.prepMinutes} min</span>}
          {recipe.cookMinutes != null && <span>Vareni {recipe.cookMinutes} min</span>}
          <span>{recipe.servings} porci</span>
        </div>

        {/* Macros per serving */}
        {recipe.kcalPerServing != null && (
          <div className="mb-6 grid grid-cols-4 gap-3 text-center">
            <MacroBox label="kcal" value={recipe.kcalPerServing} color="#FFF" />
            <MacroBox label="Protein" value={recipe.proteinG} color="#FF375F" />
            <MacroBox label="Sacharidy" value={recipe.carbsG} color="#A8FF00" />
            <MacroBox label="Tuky" value={recipe.fatG} color="#00E5FF" />
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Ingredience
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />
                  <span>
                    {ing.amount} {ing.unit} {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {recipe.instructions && (
          <div className="mb-6">
            <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
              Postup
            </h3>
            <p
              className="whitespace-pre-line text-sm leading-relaxed text-white/60"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {recipe.instructions}
            </p>
          </div>
        )}

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/8 px-3 py-1 text-[10px] text-white/35"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDelete}
            className="rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/40 transition hover:border-red-500/30 hover:text-red-400"
          >
            Smazat
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroBox({ label, value, color }: { label: string; value: number | null; color: string }) {
  return (
    <div className="rounded-xl bg-white/5 py-3">
      <div className="text-lg font-bold tabular-nums" style={{ color }}>
        {value ?? '-'}
      </div>
      <div className="text-[9px] uppercase text-white/40">{label}</div>
    </div>
  );
}
