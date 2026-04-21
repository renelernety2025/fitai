/**
 * Client-side exercise favorites stored in localStorage.
 * No API needed — purely local preference.
 */

const KEY = 'fitai_favorites';

function getAll(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function save(ids: Set<string>): void {
  localStorage.setItem(KEY, JSON.stringify([...ids]));
}

export function isFavorite(exerciseId: string): boolean {
  return getAll().has(exerciseId);
}

export function toggleFavorite(exerciseId: string): boolean {
  const favs = getAll();
  if (favs.has(exerciseId)) {
    favs.delete(exerciseId);
  } else {
    favs.add(exerciseId);
  }
  save(favs);
  return favs.has(exerciseId);
}

export function getFavoriteIds(): string[] {
  return [...getAll()];
}
