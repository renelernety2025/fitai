/**
 * Sport-specific animation mappings for training modules.
 * Separate from exercise-animations.ts which maps gym exercises.
 */

const BASE = '/models/animations/exercises';

export interface SportAnimation {
  name: string;
  nameCs: string;
  clipPath: string;
  speed: number;
  category: string;
}

/** Shadow boxing combos and moves */
export const BOXING_MOVES: SportAnimation[] = [
  { name: 'Jab', nameCs: 'Direkt', clipPath: `${BASE}/Lead Jab.fbx`, speed: 0.7, category: 'punch' },
  { name: 'Cross', nameCs: 'Kriz', clipPath: `${BASE}/Jab Cross.fbx`, speed: 0.7, category: 'punch' },
  { name: 'Hook', nameCs: 'Hak', clipPath: `${BASE}/Hook.fbx`, speed: 0.7, category: 'punch' },
  { name: 'Body Shot', nameCs: 'Uder na telo', clipPath: `${BASE}/Body Jab Cross.fbx`, speed: 0.7, category: 'punch' },
  { name: 'MMA Kick', nameCs: 'MMA kop', clipPath: `${BASE}/Mma Kick.fbx`, speed: 0.6, category: 'kick' },
  { name: 'Center Block', nameCs: 'Stredovy blok', clipPath: `${BASE}/Center Block.fbx`, speed: 0.7, category: 'defense' },
  { name: 'Left Block', nameCs: 'Levy blok', clipPath: `${BASE}/Left Block.fbx`, speed: 0.7, category: 'defense' },
  { name: 'Right Block', nameCs: 'Pravy blok', clipPath: `${BASE}/Right Block.fbx`, speed: 0.7, category: 'defense' },
  { name: 'Fighting Stance', nameCs: 'Bojovy postoj', clipPath: `${BASE}/Offensive Idle.fbx`, speed: 0.5, category: 'stance' },
];

/** Predefined boxing combos */
export interface BoxingCombo {
  name: string;
  nameCs: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  moves: string[];
  description: string;
}

export const BOXING_COMBOS: BoxingCombo[] = [
  { name: '1-2', nameCs: 'Zakladni kombinace', difficulty: 'beginner', moves: ['Jab', 'Cross'], description: 'Direkt + kriz — zaklad vseho' },
  { name: '1-2-3', nameCs: 'Trojka', difficulty: 'beginner', moves: ['Jab', 'Cross', 'Hook'], description: 'Direkt + kriz + hak' },
  { name: '1-1-2', nameCs: 'Dvojity direkt', difficulty: 'beginner', moves: ['Jab', 'Jab', 'Cross'], description: 'Dva direkty + kriz' },
  { name: '1-2-Body', nameCs: 'Na telo', difficulty: 'intermediate', moves: ['Jab', 'Cross', 'Body Shot'], description: 'Direkt + kriz + uder na telo' },
  { name: '1-2-3-2', nameCs: 'Ctyri udery', difficulty: 'intermediate', moves: ['Jab', 'Cross', 'Hook', 'Cross'], description: '4 udery v rade' },
  { name: '1-2-Block-3', nameCs: 'Utok-obrana', difficulty: 'advanced', moves: ['Jab', 'Cross', 'Center Block', 'Hook'], description: 'Udery s obranou' },
  { name: 'Kick Combo', nameCs: 'S kopem', difficulty: 'advanced', moves: ['Jab', 'Cross', 'MMA Kick'], description: 'Ruce + nohy' },
];

/** Golf shots */
export const GOLF_SHOTS: SportAnimation[] = [
  { name: 'Drive', nameCs: 'Drajv', clipPath: `${BASE}/Golf Drive.fbx`, speed: 0.5, category: 'long' },
  { name: 'Chip', nameCs: 'Cip', clipPath: `${BASE}/Golf Chip.fbx`, speed: 0.5, category: 'short' },
  { name: 'Putt', nameCs: 'Pat', clipPath: `${BASE}/Golf Putt.fbx`, speed: 0.4, category: 'putt' },
  { name: 'Pre-Putt', nameCs: 'Priprava na pat', clipPath: `${BASE}/Golf Pre-Putt.fbx`, speed: 0.4, category: 'putt' },
];

/** Generate random boxing combo for a round */
export function generateBoxingRound(
  rounds: number,
  difficulty: BoxingCombo['difficulty'],
): BoxingCombo[] {
  const pool = BOXING_COMBOS.filter(
    (c) => c.difficulty === difficulty || c.difficulty === 'beginner',
  );
  const result: BoxingCombo[] = [];
  for (let i = 0; i < rounds; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return result;
}
