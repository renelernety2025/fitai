/**
 * Czech coaching phrases for adaptive AI coach.
 * Organized by situation + intensity level.
 */

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Counting (spoken as word, not number) ──
const NUMBERS: Record<number, string> = {
  1: 'Jedna', 2: 'Dva', 3: 'Tři', 4: 'Čtyři', 5: 'Pět',
  6: 'Šest', 7: 'Sedm', 8: 'Osm', 9: 'Devět', 10: 'Deset',
  11: 'Jedenáct', 12: 'Dvanáct', 13: 'Třináct', 14: 'Čtrnáct', 15: 'Patnáct',
  16: 'Šestnáct', 17: 'Sedmnáct', 18: 'Osmnáct', 19: 'Devatenáct', 20: 'Dvacet',
};

export function repCount(n: number): string {
  return NUMBERS[n] || String(n);
}

// ── Praise (form > 85%) ──
const PRAISE_CALM = [
  'Čistý rep.',
  'Dobrá forma.',
  'Správně.',
  'Přesně tak.',
  'Výborně.',
];

const PRAISE_ENERGETIC = [
  'Výborně! Skvělá forma!',
  'Perfektní! Přesně tak to má být!',
  'Parádní rep!',
  'Super! Pokračuj!',
];

export function praise(intensity: 'calm' | 'energetic'): string {
  return pick(intensity === 'calm' ? PRAISE_CALM : PRAISE_ENERGETIC);
}

// ── Push / motivation (near end of set) ──
export function pushMotivation(repsLeft: number): string {
  if (repsLeft === 1) return pick(['Poslední!', 'Ještě jeden!', 'Finále!']);
  if (repsLeft === 2) return pick(['Ještě dva!', 'Dva zbývají!', 'Skoro tam!']);
  if (repsLeft === 3) return pick(['Ještě tři! Zvládneš to!', 'Tři zbývají!']);
  return pick(['Nevzdávej!', 'Dej do toho!', 'Pokračuj!']);
}

// ── Form correction — generic ──
const FORM_DECLINING = [
  'Hlídej formu.',
  'Zpomal tempo, soustřeď se na provedení.',
  'Forma klesá, kontroluj pohyb.',
  'Kvalita před kvantitou.',
  'Raději pomalejc ale čistě.',
];

export function formWarning(): string {
  return pick(FORM_DECLINING);
}

// ── Exercise-specific corrections ──
const CORRECTIONS: Record<string, string[]> = {
  squat: [
    'Kolena tlač ven.',
    'Hrudník vzhůru.',
    'Váha na patách.',
    'Záda rovná.',
    'Sed si dozadu.',
  ],
  pushup: [
    'Tělo jako prkno.',
    'Lokty čtyřicet pět stupňů.',
    'Hlavu neuklánéj.',
    'Břicho zpevni.',
    'Dokonči rozsah.',
  ],
  deadlift: [
    'Záda rovná! Nezakulacuj.',
    'Činku veď těsně u těla.',
    'Boky dopředu nahoře.',
    'Stáhni lopatky.',
    'Tlač nohama do země.',
  ],
  ohp: [
    'Lokty pod činkou.',
    'Zpevni core.',
    'Hlavu uklid z cesty.',
    'Natáhni paže úplně nahoře.',
    'Nepohybuj zády.',
  ],
  lunge: [
    'Koleno nad kotníkem.',
    'Trup vzpřímený.',
    'Zadní koleno k zemi.',
    'Odraz z paty.',
  ],
  bicepCurl: [
    'Lokty u těla.',
    'Nesvihej.',
    'Kontrolovaně dolů.',
    'Stiskni biceps nahoře.',
  ],
  lateralRaise: [
    'Nekrč ramena.',
    'Do výšky ramen, ne výš.',
    'Mírný ohyb v loktech.',
    'Kontrolovaně spouštěj.',
  ],
  row: [
    'Stáhni lopatky.',
    'Táhni lokty dozadu.',
    'Drž předklon.',
    'Záda rovná.',
  ],
  gluteBridge: [
    'Stiskni glutey nahoře.',
    'Boky výš.',
    'Netlač ze zad.',
    'Chodidla blízko k zadku.',
  ],
  calfRaise: [
    'Co nejvýš na špičky.',
    'Pauza nahoře.',
    'Plný rozsah dolů.',
    'Pomalý pohyb.',
  ],
};

export function exerciseCorrection(exerciseKey: string): string {
  const corrections = CORRECTIONS[exerciseKey] || CORRECTIONS.squat;
  return pick(corrections);
}

// ── Safety alerts (urgent) ──
export function safetyVoice(messageCs: string): string {
  return `Pozor! ${messageCs}`;
}

// ── Set finished ──
export function setFinished(reps: number, avgForm: number): string {
  if (avgForm >= 85) return `Set hotový. ${reps} repů, skvělá forma.`;
  if (avgForm >= 65) return `Set hotový. ${reps} repů, dobrá práce.`;
  return `Set hotový. ${reps} repů. Příště se soustřeď na formu.`;
}

// ── Set start ──
export function setStart(setNumber: number, targetReps: number): string {
  if (setNumber === 1) return `Jdeme na to. ${targetReps} opakování.`;
  return `Set ${setNumber}. ${targetReps} repů. Připraven? Jdeme!`;
}

// ── Rest phase ──
export function restTip(): string {
  return pick([
    'Napij se vody.',
    'Protáhni se.',
    'Dýchej zhluboka.',
    'Soustřeď se na další set.',
    'Uvolni ramena.',
    'Připrav se mentálně.',
  ]);
}

export function restPrepare(): string {
  return pick([
    'Připrav se na další set!',
    'Za chvíli jedeme!',
    'Deset sekund do startu.',
  ]);
}

// ── Phase change hints ──
export function phaseHint(phaseName: string, coachingHint?: string): string {
  if (coachingHint) return coachingHint;
  return phaseName;
}

// ── Milestone celebrations ──
export function milestone(reps: number): string {
  if (reps === 5) return 'Pět! Dobrý start!';
  if (reps === 10) return 'Deset! Skvělé tempo!';
  if (reps === 15) return 'Patnáct! Držíš to!';
  if (reps === 20) return 'Dvacet! Neskutečné!';
  return `${reps}! Výborně!`;
}
