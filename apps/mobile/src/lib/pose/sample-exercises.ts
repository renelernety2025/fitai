/**
 * Exercise definitions for mobile pose detection.
 * Each exercise has phases with joint angle rules for automatic rep counting.
 * Joint angles are in degrees, measured by feedback-engine.ts.
 */

import type { ExercisePhaseDefinition } from './types';

export interface ExerciseDefinition {
  name: string;
  nameCs: string;
  icon: string;
  phases: ExercisePhaseDefinition[];
}

// --- SQUAT (Dřep) ---
const SQUAT_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Start — stojka',
    rules: [
      { joint: 'left_knee', angle_min: 160, angle_max: 180 },
      { joint: 'right_knee', angle_min: 160, angle_max: 180 },
      { joint: 'left_hip', angle_min: 160, angle_max: 180 },
      { joint: 'right_hip', angle_min: 160, angle_max: 180 },
    ],
    feedback_correct: 'Rovně stojíš',
    feedback_wrong: 'Narovnej se',
    minDurationMs: 300,
  },
  {
    name: 'eccentric',
    nameCs: 'Dolů',
    rules: [
      { joint: 'left_knee', angle_min: 80, angle_max: 140 },
      { joint: 'right_knee', angle_min: 80, angle_max: 140 },
      { joint: 'left_hip', angle_min: 80, angle_max: 140 },
      { joint: 'right_hip', angle_min: 80, angle_max: 140 },
    ],
    feedback_correct: 'Klesej pomalu',
    feedback_wrong: 'Hlídej tempo',
    minDurationMs: 500,
  },
  {
    name: 'bottom',
    nameCs: 'Dno dřepu',
    rules: [
      { joint: 'left_knee', angle_min: 60, angle_max: 100 },
      { joint: 'right_knee', angle_min: 60, angle_max: 100 },
      { joint: 'left_hip', angle_min: 60, angle_max: 100 },
      { joint: 'right_hip', angle_min: 60, angle_max: 100 },
    ],
    feedback_correct: 'Dobrá hloubka',
    feedback_wrong: 'Dolů trochu víc',
    minDurationMs: 300,
  },
  {
    name: 'concentric',
    nameCs: 'Nahoru',
    rules: [
      { joint: 'left_knee', angle_min: 100, angle_max: 160 },
      { joint: 'right_knee', angle_min: 100, angle_max: 160 },
      { joint: 'left_hip', angle_min: 100, angle_max: 160 },
      { joint: 'right_hip', angle_min: 100, angle_max: 160 },
    ],
    feedback_correct: 'Tlač patami',
    feedback_wrong: 'Tlač explozivně',
    minDurationMs: 400,
  },
];

// --- PUSH-UP (Klik) ---
const PUSHUP_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Prkno nahoře',
    rules: [
      { joint: 'left_elbow', angle_min: 150, angle_max: 180 },
      { joint: 'right_elbow', angle_min: 150, angle_max: 180 },
    ],
    feedback_correct: 'Rovné tělo',
    feedback_wrong: 'Narovnej paže',
    minDurationMs: 300,
  },
  {
    name: 'down',
    nameCs: 'Dolů',
    rules: [
      { joint: 'left_elbow', angle_min: 60, angle_max: 110 },
      { joint: 'right_elbow', angle_min: 60, angle_max: 110 },
    ],
    feedback_correct: 'Dobrý rozsah',
    feedback_wrong: 'Ještě níž',
    minDurationMs: 400,
  },
  {
    name: 'up',
    nameCs: 'Nahoru',
    rules: [
      { joint: 'left_elbow', angle_min: 100, angle_max: 160 },
      { joint: 'right_elbow', angle_min: 100, angle_max: 160 },
    ],
    feedback_correct: 'Tlač explozivně',
    feedback_wrong: 'Dokonči pohyb',
    minDurationMs: 300,
  },
];

// --- DEADLIFT (Mrtvý tah) ---
const DEADLIFT_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Stojka',
    rules: [
      { joint: 'left_hip', angle_min: 160, angle_max: 180 },
      { joint: 'right_hip', angle_min: 160, angle_max: 180 },
      { joint: 'left_knee', angle_min: 160, angle_max: 180 },
      { joint: 'right_knee', angle_min: 160, angle_max: 180 },
    ],
    feedback_correct: 'Nahoře',
    feedback_wrong: 'Narovnej se úplně',
    minDurationMs: 300,
  },
  {
    name: 'hinge',
    nameCs: 'Předklon',
    rules: [
      { joint: 'left_hip', angle_min: 60, angle_max: 120 },
      { joint: 'right_hip', angle_min: 60, angle_max: 120 },
      { joint: 'left_knee', angle_min: 140, angle_max: 180 },
      { joint: 'right_knee', angle_min: 140, angle_max: 180 },
    ],
    feedback_correct: 'Rovná záda',
    feedback_wrong: 'Nezakulacuj záda!',
    minDurationMs: 500,
  },
  {
    name: 'up',
    nameCs: 'Nahoru',
    rules: [
      { joint: 'left_hip', angle_min: 120, angle_max: 170 },
      { joint: 'right_hip', angle_min: 120, angle_max: 170 },
    ],
    feedback_correct: 'Táhni boky',
    feedback_wrong: 'Boky dopředu',
    minDurationMs: 400,
  },
];

// --- OVERHEAD PRESS (Tlak nad hlavu) ---
const OHP_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Rack pozice',
    rules: [
      { joint: 'left_elbow', angle_min: 60, angle_max: 100 },
      { joint: 'right_elbow', angle_min: 60, angle_max: 100 },
      { joint: 'left_shoulder', angle_min: 60, angle_max: 100 },
      { joint: 'right_shoulder', angle_min: 60, angle_max: 100 },
    ],
    feedback_correct: 'Připraven',
    feedback_wrong: 'Lokty pod činku',
    minDurationMs: 300,
  },
  {
    name: 'press',
    nameCs: 'Tlak nahoru',
    rules: [
      { joint: 'left_elbow', angle_min: 140, angle_max: 180 },
      { joint: 'right_elbow', angle_min: 140, angle_max: 180 },
      { joint: 'left_shoulder', angle_min: 150, angle_max: 180 },
      { joint: 'right_shoulder', angle_min: 150, angle_max: 180 },
    ],
    feedback_correct: 'Lockout!',
    feedback_wrong: 'Natáhni paže',
    minDurationMs: 400,
  },
  {
    name: 'down',
    nameCs: 'Dolů',
    rules: [
      { joint: 'left_elbow', angle_min: 80, angle_max: 140 },
      { joint: 'right_elbow', angle_min: 80, angle_max: 140 },
    ],
    feedback_correct: 'Kontrolovaně',
    feedback_wrong: 'Pomaleji',
    minDurationMs: 300,
  },
];

// --- LUNGE (Výpad) ---
const LUNGE_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Stojka',
    rules: [
      { joint: 'left_knee', angle_min: 160, angle_max: 180 },
      { joint: 'right_knee', angle_min: 160, angle_max: 180 },
      { joint: 'left_hip', angle_min: 160, angle_max: 180 },
      { joint: 'right_hip', angle_min: 160, angle_max: 180 },
    ],
    feedback_correct: 'Připraven',
    feedback_wrong: 'Narovnej se',
    minDurationMs: 300,
  },
  {
    name: 'down',
    nameCs: 'Výpad dolů',
    rules: [
      { joint: 'left_knee', angle_min: 70, angle_max: 110 },
      { joint: 'left_hip', angle_min: 70, angle_max: 120 },
    ],
    feedback_correct: '90° v koleni',
    feedback_wrong: 'Koleno víc do pravého úhlu',
    minDurationMs: 500,
  },
  {
    name: 'up',
    nameCs: 'Nahoru',
    rules: [
      { joint: 'left_knee', angle_min: 110, angle_max: 170 },
      { joint: 'left_hip', angle_min: 120, angle_max: 170 },
    ],
    feedback_correct: 'Odraz patou',
    feedback_wrong: 'Tlač ze přední nohy',
    minDurationMs: 400,
  },
];

// --- BICEP CURL (Bicepsový zdvih) ---
const BICEP_CURL_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Paže dole',
    rules: [
      { joint: 'left_elbow', angle_min: 150, angle_max: 180 },
      { joint: 'right_elbow', angle_min: 150, angle_max: 180 },
    ],
    feedback_correct: 'Natažené paže',
    feedback_wrong: 'Natáhni paže',
    minDurationMs: 300,
  },
  {
    name: 'curl',
    nameCs: 'Zdvih',
    rules: [
      { joint: 'left_elbow', angle_min: 30, angle_max: 70 },
      { joint: 'right_elbow', angle_min: 30, angle_max: 70 },
    ],
    feedback_correct: 'Stlač biceps',
    feedback_wrong: 'Víc nahoru',
    minDurationMs: 400,
  },
  {
    name: 'down',
    nameCs: 'Dolů',
    rules: [
      { joint: 'left_elbow', angle_min: 80, angle_max: 150 },
      { joint: 'right_elbow', angle_min: 80, angle_max: 150 },
    ],
    feedback_correct: 'Kontrolovaně',
    feedback_wrong: 'Nehazarduj',
    minDurationMs: 300,
  },
];

// --- SHOULDER LATERAL RAISE (Upažování) ---
const LATERAL_RAISE_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Paže u těla',
    rules: [
      { joint: 'left_shoulder', angle_min: 0, angle_max: 30 },
      { joint: 'right_shoulder', angle_min: 0, angle_max: 30 },
    ],
    feedback_correct: 'Připraven',
    feedback_wrong: 'Paže dolů',
    minDurationMs: 300,
  },
  {
    name: 'raise',
    nameCs: 'Upažení',
    rules: [
      { joint: 'left_shoulder', angle_min: 70, angle_max: 110 },
      { joint: 'right_shoulder', angle_min: 70, angle_max: 110 },
    ],
    feedback_correct: 'Do výšky ramen',
    feedback_wrong: 'Výš!',
    minDurationMs: 400,
  },
  {
    name: 'down',
    nameCs: 'Dolů',
    rules: [
      { joint: 'left_shoulder', angle_min: 20, angle_max: 70 },
      { joint: 'right_shoulder', angle_min: 20, angle_max: 70 },
    ],
    feedback_correct: 'Kontrolovaně',
    feedback_wrong: 'Pomaleji',
    minDurationMs: 300,
  },
];

// --- BENT-OVER ROW (Přítahy v předklonu) ---
const ROW_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Předklon — nataženo',
    rules: [
      { joint: 'left_hip', angle_min: 60, angle_max: 110 },
      { joint: 'right_hip', angle_min: 60, angle_max: 110 },
      { joint: 'left_elbow', angle_min: 150, angle_max: 180 },
      { joint: 'right_elbow', angle_min: 150, angle_max: 180 },
    ],
    feedback_correct: 'Rovná záda',
    feedback_wrong: 'Drž předklon',
    minDurationMs: 300,
  },
  {
    name: 'pull',
    nameCs: 'Přítah',
    rules: [
      { joint: 'left_elbow', angle_min: 40, angle_max: 90 },
      { joint: 'right_elbow', angle_min: 40, angle_max: 90 },
    ],
    feedback_correct: 'Stáhni lopatky',
    feedback_wrong: 'Táhni lokty dozadu',
    minDurationMs: 400,
  },
  {
    name: 'down',
    nameCs: 'Spustit',
    rules: [
      { joint: 'left_elbow', angle_min: 100, angle_max: 160 },
      { joint: 'right_elbow', angle_min: 100, angle_max: 160 },
    ],
    feedback_correct: 'Kontrolovaně',
    feedback_wrong: 'Pomaleji',
    minDurationMs: 300,
  },
];

// --- GLUTE BRIDGE (Mostík) ---
const GLUTE_BRIDGE_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Dole',
    rules: [
      { joint: 'left_hip', angle_min: 60, angle_max: 100 },
      { joint: 'right_hip', angle_min: 60, angle_max: 100 },
      { joint: 'left_knee', angle_min: 60, angle_max: 100 },
      { joint: 'right_knee', angle_min: 60, angle_max: 100 },
    ],
    feedback_correct: 'Připraven',
    feedback_wrong: 'Chodidla blíž',
    minDurationMs: 300,
  },
  {
    name: 'up',
    nameCs: 'Zdvih boků',
    rules: [
      { joint: 'left_hip', angle_min: 150, angle_max: 180 },
      { joint: 'right_hip', angle_min: 150, angle_max: 180 },
      { joint: 'left_knee', angle_min: 80, angle_max: 110 },
      { joint: 'right_knee', angle_min: 80, angle_max: 110 },
    ],
    feedback_correct: 'Stiskni glutey',
    feedback_wrong: 'Boky výš!',
    minDurationMs: 400,
  },
  {
    name: 'down',
    nameCs: 'Dolů',
    rules: [
      { joint: 'left_hip', angle_min: 90, angle_max: 150 },
      { joint: 'right_hip', angle_min: 90, angle_max: 150 },
    ],
    feedback_correct: 'Kontrolovaně',
    feedback_wrong: 'Pomaleji',
    minDurationMs: 300,
  },
];

// --- CALF RAISE (Výpony) ---
const CALF_RAISE_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Stojka',
    rules: [
      { joint: 'left_knee', angle_min: 165, angle_max: 180 },
      { joint: 'right_knee', angle_min: 165, angle_max: 180 },
    ],
    feedback_correct: 'Připraven',
    feedback_wrong: 'Narovnej nohy',
    minDurationMs: 200,
  },
  {
    name: 'raise',
    nameCs: 'Na špičky',
    rules: [
      { joint: 'left_knee', angle_min: 170, angle_max: 180 },
      { joint: 'right_knee', angle_min: 170, angle_max: 180 },
    ],
    feedback_correct: 'Vytáhni se!',
    feedback_wrong: 'Výš na špičky',
    minDurationMs: 400,
  },
];

// --- EXPORT ---

export const SAMPLE_EXERCISES: Record<string, ExerciseDefinition> = {
  squat: { name: 'Squat', nameCs: 'Dřep', icon: '🦵', phases: SQUAT_PHASES },
  pushup: { name: 'Push-up', nameCs: 'Klik', icon: '💪', phases: PUSHUP_PHASES },
  deadlift: { name: 'Deadlift', nameCs: 'Mrtvý tah', icon: '🏋️', phases: DEADLIFT_PHASES },
  ohp: { name: 'Overhead Press', nameCs: 'Tlak nad hlavu', icon: '🙌', phases: OHP_PHASES },
  lunge: { name: 'Lunge', nameCs: 'Výpad', icon: '🚶', phases: LUNGE_PHASES },
  bicepCurl: { name: 'Bicep Curl', nameCs: 'Bicepsový zdvih', icon: '💪', phases: BICEP_CURL_PHASES },
  lateralRaise: { name: 'Lateral Raise', nameCs: 'Upažování', icon: '🤸', phases: LATERAL_RAISE_PHASES },
  row: { name: 'Bent-over Row', nameCs: 'Přítahy v předklonu', icon: '🚣', phases: ROW_PHASES },
  gluteBridge: { name: 'Glute Bridge', nameCs: 'Mostík', icon: '🌉', phases: GLUTE_BRIDGE_PHASES },
  calfRaise: { name: 'Calf Raise', nameCs: 'Výpony', icon: '🦶', phases: CALF_RAISE_PHASES },
};

export const EXERCISE_LIST = Object.entries(SAMPLE_EXERCISES).map(
  ([key, ex]) => ({ key, ...ex }),
);
