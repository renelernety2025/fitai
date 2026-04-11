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
  description: string;
  tips: string[];
  commonMistakes: string[];
  muscles: string[];
  unilateral?: boolean;
  phases: ExercisePhaseDefinition[];
}

// --- SQUAT (Dřep) ---
const SQUAT_PHASES: ExercisePhaseDefinition[] = [
  {
    name: 'start',
    nameCs: 'Start — stojka',
    coachingHint: 'Nohy na šíři ramen, špičky mírně ven, hrudník vzhůru',
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
    coachingHint: 'Sed si dozadu jako na židli, kolena tlač ven',
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
    coachingHint: 'Boky pod kolena, hrudník vzhůru, váha na patách',
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
    coachingHint: 'Tlač patami do země, stáhni glutey nahoře',
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
    coachingHint: 'Tělo jako prkno, zadek nezvedej, břicho zpevni',
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
    coachingHint: 'Lokty 45° od těla, hrudník k zemi, kontroluj tempo',
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
    coachingHint: 'Tlač dlaněmi do země, vydechni nahoře',
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
  squat: {
    name: 'Squat', nameCs: 'Dřep', icon: '🦵', phases: SQUAT_PHASES,
    description: 'Základní cvik na nohy a glutey. Posiluje stehenní svaly, glutey a core.',
    tips: ['Kolena tlač ven přes špičky', 'Hrudník vzhůru, záda rovná', 'Váha na patách', 'Dýchej — nadech dolů, výdech nahoru'],
    commonMistakes: ['Kolena padají dovnitř', 'Zakulacená záda', 'Zvedání pat ze země'],
    muscles: ['Quadriceps', 'Gluteus maximus', 'Hamstrings', 'Core'],
  },
  pushup: {
    name: 'Push-up', nameCs: 'Klik', icon: '💪', phases: PUSHUP_PHASES,
    description: 'Cvik na hrudník, ramena a triceps s vlastní vahou. Základní cvik pro horní tělo.',
    tips: ['Tělo jako prkno od hlavy po paty', 'Lokty 45° od těla', 'Hrudník se dotýká země', 'Zpevni core po celou dobu'],
    commonMistakes: ['Prohnutá záda (zadek nahoře/dole)', 'Příliš široké/úzké lokty', 'Neúplný rozsah pohybu'],
    muscles: ['Pectoralis major', 'Triceps', 'Deltoids', 'Core'],
  },
  deadlift: {
    name: 'Deadlift', nameCs: 'Mrtvý tah', icon: '🏋️', phases: DEADLIFT_PHASES,
    description: 'Kompozitní cvik na celé tělo. Posiluje záda, glutey, hamstrings a core.',
    tips: ['Záda VŽDY rovná — nikdy nezakulacuj', 'Činku veď těsně u těla', 'Boky tlač dopředu nahoře', 'Stáhni lopatky dozadu'],
    commonMistakes: ['Zakulacená záda (nebezpečné!)', 'Činka daleko od těla', 'Zvedání zády místo nohama'],
    muscles: ['Erector spinae', 'Gluteus maximus', 'Hamstrings', 'Trapezius'],
  },
  ohp: {
    name: 'Overhead Press', nameCs: 'Tlak nad hlavu', icon: '🙌', phases: OHP_PHASES,
    description: 'Tlakový cvik na ramena. Posiluje deltové svaly, triceps a horní hrudník.',
    tips: ['Lokty pod činkou v rack pozici', 'Hlavu mírně uklid z cesty', 'Lockout nahoře — paže natažené', 'Core zpevněný celou dobu'],
    commonMistakes: ['Prohnutá záda (kompenzace slabých ramen)', 'Neúplný lockout nahoře', 'Lokty před činkou'],
    muscles: ['Deltoids', 'Triceps', 'Upper pectoralis', 'Core'],
  },
  lunge: {
    name: 'Lunge', nameCs: 'Výpad', icon: '🚶', phases: LUNGE_PHASES,
    description: 'Unilaterální cvik na nohy. Zlepšuje rovnováhu a symetrii mezi nohama.',
    tips: ['Koleno přední nohy nad kotníkem', 'Zadní koleno téměř k zemi', 'Trup vzpřímený', 'Odraz z paty přední nohy'],
    commonMistakes: ['Koleno přesahuje špičku', 'Nestabilní trup (naklání se)', 'Příliš krátký krok'],
    muscles: ['Quadriceps', 'Gluteus maximus', 'Hamstrings', 'Calves'],
  },
  bicepCurl: {
    name: 'Bicep Curl', nameCs: 'Bicepsový zdvih', icon: '💪', phases: BICEP_CURL_PHASES,
    description: 'Izolační cvik na biceps. Posiluje přední stranu paže.',
    tips: ['Lokty přitisknuté k tělu', 'Kontrolovaný pohyb nahoru i dolů', 'Stiskni biceps nahoře', 'Nešvihej — ne momentum'],
    commonMistakes: ['Švihy tělem (cheating)', 'Lokty se hýbou dopředu', 'Příliš rychlé spouštění'],
    muscles: ['Biceps brachii', 'Brachialis', 'Brachioradialis'],
  },
  lateralRaise: {
    name: 'Lateral Raise', nameCs: 'Upažování', icon: '🤸', phases: LATERAL_RAISE_PHASES,
    description: 'Izolační cvik na boční deltové svaly. Buduje šířku ramen.',
    tips: ['Mírný ohyb v loktech', 'Zvedej do výšky ramen, ne výš', 'Kontrolovaně dolů — ne házet', 'Představ si že lijéš vodu z konvice'],
    commonMistakes: ['Zvedání trapézy (krčení ramen)', 'Příliš těžká váha → švihy', 'Zvedání nad ramena'],
    muscles: ['Lateral deltoid', 'Trapezius', 'Supraspinatus'],
  },
  row: {
    name: 'Bent-over Row', nameCs: 'Přítahy v předklonu', icon: '🚣', phases: ROW_PHASES,
    description: 'Složený tah na záda. Posiluje celý horní záda, biceps a core.',
    tips: ['Předklon ~45°, záda rovná', 'Táhni lokty dozadu, ne nahoru', 'Stáhni lopatky k sobě nahoře', 'Core zpevněný celou dobu'],
    commonMistakes: ['Zakulacená záda', 'Příliš vzpřímený trup (málo předklonu)', 'Tahání jen rukama bez lopatek'],
    muscles: ['Latissimus dorsi', 'Rhomboids', 'Trapezius', 'Biceps'],
  },
  gluteBridge: {
    name: 'Glute Bridge', nameCs: 'Mostík', icon: '🌉', phases: GLUTE_BRIDGE_PHASES,
    description: 'Izolační cvik na glutey. Aktivuje hýžďové svaly a posiluje core.',
    tips: ['Chodidla na šíři boků, blízko k zadku', 'Tlač boky co nejvýš', 'Stiskni glutey nahoře na 1-2s', 'Nepřepínej záda'],
    commonMistakes: ['Tlak ze zad místo z gluteů', 'Chodidla příliš daleko', 'Nedostatečný rozsah nahoru'],
    muscles: ['Gluteus maximus', 'Hamstrings', 'Core', 'Erector spinae'],
  },
  calfRaise: {
    name: 'Calf Raise', nameCs: 'Výpony', icon: '🦶', phases: CALF_RAISE_PHASES,
    description: 'Izolační cvik na lýtka. Posiluje gastrocnemius a soleus.',
    tips: ['Co nejvýš na špičky', 'Pomalý kontrolovaný pohyb', 'Pauza nahoře 1s', 'Plný rozsah dolů (protáhni)'],
    commonMistakes: ['Příliš rychlé tempo', 'Neúplný rozsah pohybu', 'Ohýbání kolen'],
    muscles: ['Gastrocnemius', 'Soleus'],
  },
  // ── Unilateral variants ──
  singleArmCurl: {
    name: 'Single-arm Curl', nameCs: 'Jednoruční biceps', icon: '💪', unilateral: true,
    phases: [
      { name: 'start', nameCs: 'Paže dole', coachingHint: 'Loket u těla, paže natažená', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_correct: 'Natažená', feedback_wrong: 'Natáhni', minDurationMs: 300 },
      { name: 'curl', nameCs: 'Zdvih', coachingHint: 'Stiskni biceps, loket nehýbej', rules: [{ joint: 'left_elbow', angle_min: 30, angle_max: 70 }], feedback_correct: 'Stiskni', feedback_wrong: 'Víc nahoru', minDurationMs: 400 },
      { name: 'down', nameCs: 'Dolů', coachingHint: 'Kontrolovaně spouštěj', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 150 }], feedback_correct: 'Kontrolovaně', feedback_wrong: 'Pomaleji', minDurationMs: 300 },
    ],
    description: 'Jednoruční bicepsový zdvih. Izoluje biceps, lepší koncentrace na sval.',
    tips: ['Loket přitisknutý k tělu', 'Nedělej švihy', 'Stiskni na vrcholu'],
    commonMistakes: ['Švihy tělem', 'Loket se hýbe', 'Příliš rychle dolů'],
    muscles: ['Biceps brachii'],
  },
  singleArmPress: {
    name: 'Single-arm Press', nameCs: 'Jednoruční tlak', icon: '🙌', unilateral: true,
    phases: [
      { name: 'start', nameCs: 'Rack pozice', coachingHint: 'Loket pod činkou, core zpevni', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 100 }], feedback_correct: 'Připraven', feedback_wrong: 'Lokty pod', minDurationMs: 300 },
      { name: 'press', nameCs: 'Tlak nahoru', coachingHint: 'Tlač nahoru, natáhni paži', rules: [{ joint: 'left_elbow', angle_min: 140, angle_max: 180 }], feedback_correct: 'Lockout!', feedback_wrong: 'Natáhni', minDurationMs: 400 },
      { name: 'down', nameCs: 'Dolů', coachingHint: 'Kontrolovaně dolů do rack pozice', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 140 }], feedback_correct: 'Kontrolovaně', feedback_wrong: 'Pomaleji', minDurationMs: 300 },
    ],
    description: 'Jednoruční tlak nad hlavu. Aktivuje core pro stabilizaci, odhalí asymetrie.',
    tips: ['Zpevni core', 'Nenaklánéj se na stranu', 'Plný lockout nahoře'],
    commonMistakes: ['Naklánění trupu', 'Neúplný lockout', 'Prohnutá záda'],
    muscles: ['Deltoids', 'Triceps', 'Core'],
  },
};

export const EXERCISE_LIST = Object.entries(SAMPLE_EXERCISES).map(
  ([key, ex]) => ({ key, ...ex }),
);
