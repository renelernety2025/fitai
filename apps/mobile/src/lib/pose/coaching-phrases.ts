/**
 * Czech coaching phrases for adaptive AI coach — v2 extended.
 * 100+ phrases organized by situation, exercise, and intensity.
 * Includes per-rep guidance (what to feel, where to push).
 */

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickUnused(arr: string[], used: Set<string>): string {
  const unused = arr.filter((s) => !used.has(s));
  const choice = pick(unused.length > 0 ? unused : arr);
  used.add(choice);
  if (used.size > arr.length * 0.7) used.clear();
  return choice;
}

const usedPhrases = new Set<string>();

// ── Counting ──
const NUMBERS: Record<number, string> = {
  1: 'Jedna', 2: 'Dva', 3: 'Tři', 4: 'Čtyři', 5: 'Pět',
  6: 'Šest', 7: 'Sedm', 8: 'Osm', 9: 'Devět', 10: 'Deset',
  11: 'Jedenáct', 12: 'Dvanáct', 13: 'Třináct', 14: 'Čtrnáct', 15: 'Patnáct',
  16: 'Šestnáct', 17: 'Sedmnáct', 18: 'Osmnáct', 19: 'Devatenáct', 20: 'Dvacet',
};

export function repCount(n: number): string {
  return NUMBERS[n] || String(n);
}

// ── Praise ──
export function praise(intensity: 'calm' | 'energetic'): string {
  const calm = [
    'Čistý rep.', 'Dobrá forma.', 'Správně.', 'Přesně tak.', 'Výborně.',
    'Pěkně.', 'Tak to má být.', 'Dobrý pohyb.', 'Stabilní.', 'Čisté provedení.',
  ];
  const energetic = [
    'Výborně! Skvělá forma!', 'Perfektní!', 'Parádní rep!', 'Super! Pokračuj!',
    'Nádherné provedení!', 'To je ono!', 'Síla! Pokračuj takhle!',
    'Držíš to perfektně!', 'Mašina!', 'Jako učebnice!',
  ];
  return pickUnused(intensity === 'calm' ? calm : energetic, usedPhrases);
}

// ── Push / motivation ──
export function pushMotivation(repsLeft: number): string {
  if (repsLeft === 1) return pickUnused([
    'Poslední!', 'Ještě jeden!', 'Finále!', 'Poslední rep, dej do toho!',
    'Jeden zbývá! Ukaž co v tobě je!',
  ], usedPhrases);
  if (repsLeft === 2) return pickUnused([
    'Ještě dva!', 'Dva zbývají!', 'Skoro tam!', 'Dva repy a máš to!',
    'Ještě dva, nepolevuj!',
  ], usedPhrases);
  if (repsLeft === 3) return pickUnused([
    'Ještě tři! Zvládneš to!', 'Tři zbývají, drž formu!',
    'Poslední trojka! Jdeme!',
  ], usedPhrases);
  return pickUnused([
    'Nevzdávej!', 'Dej do toho!', 'Pokračuj!', 'Drž tempo!', 'Jsi blízko!',
  ], usedPhrases);
}

// ── Form warning ──
export function formWarning(): string {
  return pickUnused([
    'Hlídej formu.', 'Zpomal tempo, soustřeď se na provedení.',
    'Forma klesá, kontroluj pohyb.', 'Kvalita před kvantitou.',
    'Raději pomalejc ale čistě.', 'Formu hlídej víc než rychlost.',
    'Cítím pokles formy. Soustřeď se.', 'Zpomal a udělej to čistě.',
    'Nehon se. Forma je důležitější.',
  ], usedPhrases);
}

// ── Per-exercise detailed coaching ──
// Each exercise has: corrections, per-rep focus, muscle focus, feel cues
interface ExerciseCoaching {
  corrections: string[];
  perRepFocus: string[];    // what to focus on each rep
  muscleFeel: string[];     // what muscle should burn/work
  motivation: string[];     // exercise-specific encouragement
  deviation: string;        // what to say if user does different movement
}

const EXERCISE_COACHING: Record<string, ExerciseCoaching> = {
  squat: {
    corrections: [
      'Kolena tlač ven.', 'Hrudník vzhůru.', 'Váha na patách.', 'Záda rovná.',
      'Sed si dozadu, jako na židli.', 'Core zpevni.', 'Pohled dopředu.',
      'Dýchej. Nadech dolů, výdech nahoru.', 'Kolena za špičky, ne před ně.',
    ],
    perRepFocus: [
      'Tlač kolena ven a sed dozadu.', 'Hrudník vzhůru, záda rovná celou dobu.',
      'Cíť tah v zadní straně stehen.', 'Patami tlač do země na cestě nahoru.',
      'Zpevni břicho než začneš klesat.', 'Kontroluj tempo, ne padej dolů.',
      'Boky pod kolena, drž hrudník.', 'Výdech nahoru, stáhni glutey nahoře.',
    ],
    muscleFeel: [
      'Měl bys cítit stehna a glutey.', 'Cíť práci v quadricepsech.',
      'Glutey by měly hořet nahoře.', 'Hamstringy táhnou dole.',
    ],
    motivation: [
      'Dřepy jsou král cviků. Makáš!', 'Silné nohy, silné tělo!',
      'Každý dřep tě posiluje.', 'Nohy jsou tvůj základ, buduj ho!',
    ],
    deviation: 'Hele, tohle nevypadá jako dřep. Vrať se do správné pozice.',
  },
  pushup: {
    corrections: [
      'Tělo jako prkno.', 'Lokty čtyřicet pět stupňů od těla.',
      'Hlavu neuklánéj.', 'Břicho zpevni.', 'Dokonči rozsah.',
      'Hrudník se téměř dotýká země.', 'Nekrč zadek nahoru.',
      'Ramena nad zápěstími.', 'Lopatky stáhni k sobě dole.',
    ],
    perRepFocus: [
      'Tlač dlaněmi do země, cíť hrudník.', 'Zpevni core než jdeš dolů.',
      'Lokty u těla, ne do stran.', 'Hrudník až k zemi, pak explozivně nahoru.',
      'Vydechni nahoře, nadechni dole.', 'Představ si že tlačíš zem od sebe.',
    ],
    muscleFeel: [
      'Cíť práci v hrudníku a tricepsech.', 'Hrudník by měl pracovat nejvíc.',
      'Tricepsy pomáhají nahoře.', 'Core drží tělo rovně celou dobu.',
    ],
    motivation: [
      'Kliky budují sílu celého těla!', 'Žádné vybavení, maximální efekt!',
      'Každý klik je investice do síly.', 'Push! Push! Push!',
    ],
    deviation: 'Tohle není klik. Drž tělo rovné a pokračuj.',
  },
  deadlift: {
    corrections: [
      'Záda rovná! Nezakulacuj.', 'Činku veď těsně u těla.',
      'Boky dopředu nahoře.', 'Stáhni lopatky.',
      'Tlač nohama do země.', 'Hrudník ven.', 'Pohled dopředu, ne dolů.',
      'Zpevni core před každým tahem.', 'Netlač ze zad, táhni nohama.',
    ],
    perRepFocus: [
      'Záda rovná po celou dobu. To je priorita číslo jedna.',
      'Tlač patami do země a táhni boky dopředu.',
      'Činku veď po stehnech, těsně u těla.',
      'Stáhni lopatky dozadu, hrudník ven.', 'Glutey stiskni nahoře.',
    ],
    muscleFeel: [
      'Cíť celý zadní řetězec. Záda, hamstringy, glutey.',
      'Hamstringy táhnou, glutey tlačí nahoře.',
      'Erektory drží záda rovná.', 'Měl bys cítit napětí od pat po krk.',
    ],
    motivation: [
      'Mrtvý tah je nejtěžší cvik. Respekt!',
      'Buduj sílu od základů.', 'Král kompozitních cviků!',
    ],
    deviation: 'Pozor, tohle nevypadá jako mrtvý tah. Drž správnou pozici.',
  },
  ohp: {
    corrections: [
      'Lokty pod činkou.', 'Zpevni core.', 'Hlavu uklid z cesty.',
      'Natáhni paže úplně nahoře.', 'Nepohybuj zády.',
      'Nepřehybuj záda dozadu.', 'Stůj pevně na obou nohách.',
    ],
    perRepFocus: [
      'Tlač přímo nahoru, ne dopředu.', 'Core zpevni před každým repem.',
      'Lockout nahoře, natáhni paže úplně.', 'Hlavu mírně uklid, pak vrať zpět.',
      'Vydechni při tlaku nahoru.', 'Kontrolovaně dolů do rack pozice.',
    ],
    muscleFeel: [
      'Ramena by měla hořet, hlavně přední deltoid.',
      'Tricepsy pracují v horní části pohybu.', 'Core stabilizuje celou dobu.',
    ],
    motivation: [
      'Silná ramena, silný člověk!', 'Overhead press je test pravé síly!',
      'Boulder ramena se budují takhle!',
    ],
    deviation: 'Tohle není tlak nad hlavu. Vrať se do rack pozice.',
  },
  lunge: {
    corrections: ['Koleno nad kotníkem.', 'Trup vzpřímený.', 'Zadní koleno k zemi.', 'Odraz z paty.', 'Nenaklánéj se dopředu.'],
    perRepFocus: ['Koleno přední nohy přímo nad kotníkem.', 'Zadní koleno téměř k zemi.', 'Odraz z paty přední nohy.', 'Trup drž vzpřímeně.'],
    muscleFeel: ['Cíť quadriceps přední nohy a glutey.', 'Hamstring zadní nohy protahuje.'],
    motivation: ['Výpady budují rovnováhu a sílu!', 'Každá noha zvlášť, žádné slabé místo!'],
    deviation: 'Tohle není výpad. Udělej krok dopředu a pokles.',
  },
  bicepCurl: {
    corrections: ['Lokty u těla.', 'Nesvihej.', 'Kontrolovaně dolů.', 'Stiskni biceps nahoře.', 'Zápěstí rovné.', 'Nedělej švihy trupem.'],
    perRepFocus: ['Loket nehýbej, jen předloktí se pohybuje.', 'Stiskni biceps na vrcholu na jednu sekundu.', 'Spouštěj pomalu a kontrolovaně.', 'Cíť napětí v bicepsu celou dobu.'],
    muscleFeel: ['Biceps by měl hořet, hlavně na vrcholu.', 'Cíť kontrakci v přední části paže.', 'Předloktí pomáhá, ale biceps dominuje.'],
    motivation: ['Krásné paže se budují repe po repu!', 'Stiskni! Drž! Pomalu dolů!', 'Izolace je klíč k růstu!'],
    deviation: 'Tohle nevypadá jako bicepsový zdvih. Lokty u těla, pohyb jen v lokti.',
  },
  lateralRaise: {
    corrections: ['Nekrč ramena.', 'Do výšky ramen, ne výš.', 'Mírný ohyb v loktech.', 'Kontrolovaně spouštěj.'],
    perRepFocus: ['Zvedej do výšky ramen, ne výš.', 'Jako bys liješ vodu z konvice.', 'Mírný ohyb v loktech celou dobu.'],
    muscleFeel: ['Cíť boční deltoid, ne trapézy.', 'Ramena by měla hořet po stranách.'],
    motivation: ['Široká ramena se tady budují!', 'Každý rep přidává šířku!'],
    deviation: 'Pohyb by měl být do stran, ne dopředu.',
  },
  row: {
    corrections: ['Stáhni lopatky.', 'Táhni lokty dozadu.', 'Drž předklon.', 'Záda rovná.'],
    perRepFocus: ['Táhni lokty dozadu a stáhni lopatky k sobě.', 'Představ si že mačkáš tužku mezi lopatkami.', 'Drž předklon stabilní.'],
    muscleFeel: ['Cíť práci mezi lopatkami a v latissimus.', 'Záda by měla pracovat víc než bicepsy.'],
    motivation: ['Silná záda, zdravá záda!', 'Tahový pohyb je základ funkční síly!'],
    deviation: 'Drž předklon a táhni lokty dozadu.',
  },
  gluteBridge: {
    corrections: ['Stiskni glutey nahoře.', 'Boky výš.', 'Netlač ze zad.', 'Chodidla blízko k zadku.'],
    perRepFocus: ['Tlač boky co nejvýš a stiskni glutey nahoře.', 'Drž pauzu nahoře jednu sekundu.', 'Cíť glutey, ne záda.'],
    muscleFeel: ['Glutey by měly hořet!', 'Cíť práci v hýždích, ne v zádech.'],
    motivation: ['Silné glutey jsou základ pohybu!', 'Aktivuj glutey!'],
    deviation: 'Tlač boky nahoru, ne jen záda.',
  },
  calfRaise: {
    corrections: ['Co nejvýš na špičky.', 'Pauza nahoře.', 'Plný rozsah dolů.', 'Pomalý pohyb.'],
    perRepFocus: ['Vytáhni se co nejvýš na špičky.', 'Drž nahoře jednu sekundu.', 'Protáhni lýtko dole.'],
    muscleFeel: ['Lýtka by měla hořet!', 'Cíť napětí od kotníku po koleno.'],
    motivation: ['Lýtka se budují objemem a trpělivostí!'],
    deviation: 'Pomalý pohyb nahoru a dolů, plný rozsah.',
  },
  singleArmCurl: {
    corrections: ['Loket u těla.', 'Nesvihej.', 'Stiskni na vrcholu.'],
    perRepFocus: ['Soustřeď se na jeden biceps.', 'Cíť jak sval pracuje izolovaně.', 'Kontroluj celý rozsah pohybu.'],
    muscleFeel: ['Jeden biceps by měl hořet. Cíť každé vlákno.'],
    motivation: ['Izolace odhalí slabá místa!', 'Jedna ruka, plná koncentrace!'],
    deviation: 'Pohybuj jen jednou rukou, druhou drž v klidu.',
  },
  singleArmPress: {
    corrections: ['Zpevni core.', 'Nenaklánéj se.', 'Lockout nahoře.'],
    perRepFocus: ['Core musí stabilizovat, nenaklánéj trup.', 'Tlač přímo nahoru.', 'Natáhni paži úplně nahoře.'],
    muscleFeel: ['Cíť rameno a triceps na pracující straně.', 'Core pracuje na stabilizaci.'],
    motivation: ['Jednostranný tlak odhalí asymetrie!', 'Síla a stabilita v jednom!'],
    deviation: 'Tlač jednou rukou nahoru, druhou drž volně.',
  },
};

export function exerciseCorrection(exerciseKey: string): string {
  const c = EXERCISE_COACHING[exerciseKey]?.corrections || EXERCISE_COACHING.squat.corrections;
  return pickUnused(c, usedPhrases);
}

export function perRepCoaching(exerciseKey: string): string {
  const c = EXERCISE_COACHING[exerciseKey]?.perRepFocus || [];
  return c.length > 0 ? pickUnused(c, usedPhrases) : '';
}

export function muscleFocus(exerciseKey: string): string {
  const c = EXERCISE_COACHING[exerciseKey]?.muscleFeel || [];
  return c.length > 0 ? pickUnused(c, usedPhrases) : '';
}

export function exerciseMotivation(exerciseKey: string): string {
  const c = EXERCISE_COACHING[exerciseKey]?.motivation || [];
  return c.length > 0 ? pickUnused(c, usedPhrases) : praise('energetic');
}

export function deviationWarning(exerciseKey: string): string {
  return EXERCISE_COACHING[exerciseKey]?.deviation || 'Vrať se ke správnému provedení cviku.';
}

// ── Safety ──
export function safetyVoice(messageCs: string): string {
  return `Pozor! ${messageCs}`;
}

// ── Set lifecycle ──
export function setStart(setNumber: number, targetReps: number): string {
  if (setNumber === 1) return `Jdeme na to. ${targetReps} opakování. Soustřeď se na formu.`;
  if (setNumber === 2) return `Druhý set. ${targetReps} repů. Víš co dělat, jdeme!`;
  if (setNumber === 3) return `Třetí set! ${targetReps} repů. Drž formu!`;
  return `Set ${setNumber}. ${targetReps} repů. Ukončíme to silně!`;
}

export function setFinished(reps: number, avgForm: number, setNum: number): string {
  const formComment = avgForm >= 85 ? 'skvělá forma' : avgForm >= 65 ? 'dobrá práce' : 'příště víc na formu';
  const base = `Set ${setNum} hotový. ${reps} repů, ${formComment}.`;
  if (avgForm >= 85) return `${base} Teď si odpočiň, zasloužíš si to.`;
  if (avgForm >= 65) return `${base} Odpočinek.`;
  return `${base} V dalším setu zpomal a soustřeď se na provedení.`;
}

// ── Rest phase ──
const REST_TIPS: string[] = [
  'Napij se vody.', 'Protáhni cílový sval.', 'Dýchej zhluboka.',
  'Soustřeď se na další set.', 'Uvolni ramena a krk.',
  'Připrav se mentálně na další set.', 'Zatřes rukama, uvolni napětí.',
  'Vizualizuj si perfektní provedení dalšího setu.',
  'Zkontroluj postoj, stůj rovně.', 'Protáhni boky a hamstringy.',
];

export function restTip(): string {
  return pickUnused(REST_TIPS, usedPhrases);
}

export function restConversation(setNum: number, avgForm: number, exerciseKey: string): string {
  if (avgForm >= 85) return pickUnused([
    `Forma byla skvělá. Drž to takhle i v dalším setu.`,
    `Výborná práce. Cítíš ten sval? To je správně.`,
    `Perfektní set. Odpočiň si a jdeme na další.`,
  ], usedPhrases);
  if (avgForm >= 65) return pickUnused([
    `Dobrý set. V dalším zkus zpomalit tempo.`,
    `Solidní práce. Soustřeď se víc na ${perRepCoaching(exerciseKey)}`,
    `Fajn. Příští set bude ještě lepší.`,
  ], usedPhrases);
  return pickUnused([
    `Forma nebyla ideální. V dalším setu zpomal a soustřeď se na provedení.`,
    `Zkus v dalším setu méně váhy a víc kontroly.`,
    `Raději méně repů s čistou formou než víc se špatnou.`,
  ], usedPhrases);
}

export function restPrepare(): string {
  return pickUnused([
    'Připrav se na další set!', 'Za chvíli jedeme!',
    'Deset sekund. Nastav se do pozice.', 'Skoro čas! Připraven?',
  ], usedPhrases);
}

// ── Milestone ──
export function milestone(reps: number): string {
  if (reps === 5) return 'Pět! Dobrý start, drž tempo!';
  if (reps === 10) return 'Deset! Skvělé, jsi v rytmu!';
  if (reps === 15) return 'Patnáct! Výdrž, jsi silný!';
  if (reps === 20) return 'Dvacet! Neuvěřitelné! Respekt!';
  return `${reps}! Výborně!`;
}

// ── Phase hint ──
export function phaseHint(phaseName: string, coachingHint?: string): string {
  return coachingHint || phaseName;
}
