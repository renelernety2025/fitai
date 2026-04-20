/**
 * Predefined training sequences — composed from individual animation clips.
 * Each sequence is a choreographed workout routine with smooth transitions.
 */

import type { SequenceStep } from '@/components/exercise/sequence-viewer';

const BASE = '/models/animations/exercises';

export interface TrainingSequence {
  id: string;
  name: string;
  nameCs: string;
  description: string;
  category: 'warmup' | 'boxing' | 'hiit' | 'golf' | 'cooldown';
  durationMin: number;
  steps: SequenceStep[];
}

export const TRAINING_SEQUENCES: TrainingSequence[] = [
  {
    id: 'boxing-round-1',
    name: 'Boxing Round 1',
    nameCs: 'Boxerske kolo 1',
    description: 'Zakladni kombinace — direkt, kriz, hak. 3 minuty, 6 kombinaci.',
    category: 'boxing',
    durationMin: 3,
    steps: [
      { name: 'Stance', nameCs: 'Postoj', clipPath: `${BASE}/Offensive Idle.fbx`, speed: 0.5, repeats: 2 },
      { name: 'Jab', nameCs: 'Direkt', clipPath: `${BASE}/Lead Jab.fbx`, speed: 0.7, repeats: 3 },
      { name: 'Jab-Cross', nameCs: '1-2', clipPath: `${BASE}/Jab Cross.fbx`, speed: 0.7, repeats: 3 },
      { name: 'Hook', nameCs: 'Hak', clipPath: `${BASE}/Hook.fbx`, speed: 0.7, repeats: 3 },
      { name: 'Body Shot', nameCs: 'Na telo', clipPath: `${BASE}/Body Jab Cross.fbx`, speed: 0.7, repeats: 2 },
      { name: 'Combo', nameCs: 'Kombo', clipPath: `${BASE}/Punch Combo.fbx`, speed: 0.6, repeats: 2 },
      { name: 'Stance', nameCs: 'Oddych', clipPath: `${BASE}/Offensive Idle.fbx`, speed: 0.5, repeats: 2 },
    ],
  },
  {
    id: 'hiit-burner',
    name: 'HIIT Burner',
    nameCs: 'HIIT spalovac',
    description: 'Vysoka intenzita — jumping jacks, burpees, box jumpy, plank. 5 minut.',
    category: 'hiit',
    durationMin: 5,
    steps: [
      { name: 'Jumping Jacks', nameCs: 'Jumping Jacks', clipPath: `${BASE}/Jumping Jacks.fbx`, speed: 0.7, repeats: 3 },
      { name: 'Burpees', nameCs: 'Burpees', clipPath: `${BASE}/Burpee.fbx`, speed: 0.5, repeats: 3 },
      { name: 'Box Jump', nameCs: 'Box Jump', clipPath: `${BASE}/Box Jump.fbx`, speed: 0.5, repeats: 3 },
      { name: 'Plank', nameCs: 'Plank', clipPath: `${BASE}/Start Plank.fbx`, speed: 0.3, repeats: 2 },
      { name: 'Squat', nameCs: 'Drep', clipPath: `${BASE}/Air Squat.fbx`, speed: 0.5, repeats: 3 },
      { name: 'Bicycle Crunch', nameCs: 'Bicykl', clipPath: `${BASE}/Bicycle Crunch.fbx`, speed: 0.6, repeats: 3 },
    ],
  },
  {
    id: 'golf-full-practice',
    name: 'Golf Full Practice',
    nameCs: 'Golf kompletni trenink',
    description: 'Od pripravy pres drive az po putt — cely trénink v jedne sekvenci.',
    category: 'golf',
    durationMin: 4,
    steps: [
      { name: 'Setup', nameCs: 'Priprava', clipPath: `${BASE}/Golf Drive Setup.fbx`, speed: 0.4, repeats: 2 },
      { name: 'Drive', nameCs: 'Drajv', clipPath: `${BASE}/Golf Drive.fbx`, speed: 0.5, repeats: 3 },
      { name: 'Post-Swing', nameCs: 'Dokonceni', clipPath: `${BASE}/Golf Post-Swing.fbx`, speed: 0.4, repeats: 1 },
      { name: 'Chip', nameCs: 'Cip', clipPath: `${BASE}/Golf Chip.fbx`, speed: 0.5, repeats: 3 },
      { name: 'Pre-Putt', nameCs: 'Cteni greenu', clipPath: `${BASE}/Golf Pre-Putt.fbx`, speed: 0.4, repeats: 1 },
      { name: 'Putt', nameCs: 'Pat', clipPath: `${BASE}/Golf Putt.fbx`, speed: 0.4, repeats: 3 },
      { name: 'Victory', nameCs: 'Oslava!', clipPath: `${BASE}/Golf Putt Victory.fbx`, speed: 0.5, repeats: 1 },
    ],
  },
  {
    id: 'morning-warmup',
    name: 'Morning Warmup',
    nameCs: 'Ranni rozcvicka',
    description: 'Jumping jacks, drepy, plank — probudte telo za 3 minuty.',
    category: 'warmup',
    durationMin: 3,
    steps: [
      { name: 'Jumping Jacks', nameCs: 'Jumping Jacks', clipPath: `${BASE}/Jumping Jacks.fbx`, speed: 0.6, repeats: 4 },
      { name: 'Squat', nameCs: 'Drepy', clipPath: `${BASE}/Air Squat.fbx`, speed: 0.5, repeats: 3 },
      { name: 'Push Up', nameCs: 'Kliky', clipPath: `${BASE}/Push Up To Idle.fbx`, speed: 0.5, repeats: 3 },
      { name: 'Plank', nameCs: 'Plank', clipPath: `${BASE}/Start Plank.fbx`, speed: 0.3, repeats: 2 },
      { name: 'Kettlebell', nameCs: 'Kettlebell', clipPath: `${BASE}/Kettlebell Swing.fbx`, speed: 0.5, repeats: 3 },
    ],
  },
  {
    id: 'mma-shadow',
    name: 'MMA Shadow Fight',
    nameCs: 'MMA stinovy boj',
    description: 'Udery, kopy, obrana, strhnutí — kompletni MMA kolo.',
    category: 'boxing',
    durationMin: 3,
    steps: [
      { name: 'MMA Stance', nameCs: 'Postoj', clipPath: `${BASE}/Mma Idle.fbx`, speed: 0.5, repeats: 1 },
      { name: 'Jab-Cross', nameCs: '1-2', clipPath: `${BASE}/Jab Cross.fbx`, speed: 0.7, repeats: 2 },
      { name: 'Hook', nameCs: 'Hak', clipPath: `${BASE}/Hook.fbx`, speed: 0.7, repeats: 2 },
      { name: 'MMA Kick', nameCs: 'Kop', clipPath: `${BASE}/Mma Kick.fbx`, speed: 0.6, repeats: 2 },
      { name: 'Block', nameCs: 'Blok', clipPath: `${BASE}/Center Block.fbx`, speed: 0.7, repeats: 2 },
      { name: 'Takedown', nameCs: 'Strhnutí', clipPath: `${BASE}/Double Leg Takedown - Attacker.fbx`, speed: 0.5, repeats: 1 },
      { name: 'Combo', nameCs: 'Finalni kombo', clipPath: `${BASE}/Punch Combo.fbx`, speed: 0.6, repeats: 2 },
    ],
  },
];

const CAT_COLORS: Record<string, string> = {
  warmup: '#FF9F0A',
  boxing: '#FF375F',
  hiit: '#00E5FF',
  golf: '#A8FF00',
  cooldown: '#BF5AF2',
};

export function getCategoryColor(cat: string): string {
  return CAT_COLORS[cat] ?? '#FFF';
}
