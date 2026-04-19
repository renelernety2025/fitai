/**
 * FitAI Exercise Data — 60 exercises total
 * 14 existing (preserved exactly) + 46 new
 *
 * Exported arrays: exercises (equipment-based), bodyweightExercises
 * Exported map: equipmentMap
 */

export const exercises = [
  // ────────────────────────────────────────────────────────────
  // EXISTING 8 equipment exercises (preserved exactly)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Barbell Squat', nameCs: 'Drep s cinkou',
    description: 'Compound lower body exercise targeting quads, glutes, and core.',
    descriptionCs: 'Zakladni cvik na dolni telo — stehna, hyzde, core.',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'CORE'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Postav se pod cinku v racku, nohy na sirku ramen.',
        'Poloz cinku na horni cast trapezu (ne na krk!).',
        'Odejdi od racku — 2 kroky dozadu.',
        'Spicky mirne ven (15-30\u00b0), vaha na cele plosce.',
        'Nadechni se, zpevni core a zacni klesat.',
        'Tlac kolena ven smerem za spicky.',
        'Klesej dokud stehna nejsou paralelne se zemi (nebo nize).',
        'Kratka pauza dole, pak vydech a tlac ze zeme pres paty.',
        'Narovnej se do vychozi pozice. Opakuj.',
      ],
      commonMistakes: [
        'Kolena padaji dovnitr — aktivne je tlac ven.',
        'Zaoblena zada — drz hrudnik nahoru, pohled dopredu.',
        'Zvedani pat — vaha musi zustat na cele plosce.',
        'Nedostatecna hloubka — stehna musi byt alespon paralelne.',
        'Prilis rychly sestup — kontroluj pohyb (2 sekundy dolu).',
      ],
      targetMuscles: {
        primary: ['Quadriceps (predni stehna)', 'Gluteus maximus (velky hyzdovy)'],
        secondary: ['Core (brisni svaly)', 'Hamstringy (zadni stehna)', 'Adduktory (vnitrni stehna)', 'Vzprimovace patere'],
      },
      breathing: 'NADECH pri sestupu (zpevni core), VYDECH pri vystupu (nejvyssi usili).',
      tempo: '2-1-2 (2s sestup, 1s vydrz dole, 2s vystup)',
      warmup: 'Zahrivaci set: 2\u00d715 repu s prazdnou cinkou (20kg). Pak 1\u00d710 s 50% vahy.',
      tips: [
        'Tlac z pat, ne ze spicek.',
        'Predstav si, ze si sedas na zidli za tebou.',
        'Hrudnik nahoru, pohled dopredu — ne dolu.',
        'Core zpevneny po celou dobu pohybu.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }, { joint: 'right_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Narovnej se do vzprimene pozice', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Descending', nameCs: 'Klesani', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 150 }, { joint: 'left_hip', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Kolena za spicky, zada rovna', feedback_correct: 'Dobry sestup', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Spodni pozice', rules: [{ joint: 'left_knee', angle_min: 70, angle_max: 100 }, { joint: 'left_hip', angle_min: 60, angle_max: 100 }], feedback_wrong: 'Jdi hloubeji, stehna paralelne', feedback_correct: 'Perfektni hloubka!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Ascending', nameCs: 'Stoupani', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 150 }], feedback_wrong: 'Tlac z pat, kolena ven', feedback_correct: 'Dobry vystup', minDurationMs: 200 },
    ],
  },
  {
    name: 'Bench Press', nameCs: 'Bench press',
    description: 'Upper body push exercise targeting chest, shoulders, and triceps.',
    descriptionCs: 'Tlak na lavici — prsa, ramena, tricepsy.',
    muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: ['Lehni si na lavici, oci pod cinkou.', 'Uchop cinku o trochu sireji nez ramena.', 'Stahni lopatky k sobe a dolu — vytvor "oblouk" v horni casti zad.', 'Zvedni cinku z racku, ruce propnute nad hrudnikem.', 'Nadechni se a pomalu spoustej cinku k dolni casti hrudniku.', 'Lehce se dotkni hrudi (nesklapej!).', 'Vydech a tlac cinku zpet nahoru — mirne dozadu k ocim.'],
      commonMistakes: ['Odrazeni cinky od hrudi — kontrolovany dotek.', 'Zvedani hyzdi z lavice — boky musi zustat dole.', 'Lokty prilis daleko od tela (90\u00b0) — drz je v 45\u00b0 uhlu.', 'Nerovnomerny tlak — obe ruce stejne.'],
      targetMuscles: { primary: ['Pectoralis major (velky prsni sval)'], secondary: ['Predni deltoid (rameno)', 'Triceps'] },
      breathing: 'NADECH pri spousteni, VYDECH pri tlaku nahoru.',
      tempo: '2-1-1 (2s dolu, 1s dotek, 1s nahoru)',
      warmup: '2\u00d715 repu s prazdnou cinkou. 1\u00d710 s 50% vahy.',
      tips: ['Lopatky stazene — stabilni zaklad.', 'Nohy pevne na zemi.', 'Predstav si, ze ohybas cinku do tvaru U.'],
    },
    phases: [
      { phase: 'START', name: 'Arms Extended', nameCs: 'Vzpazeni', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }, { joint: 'right_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Kontrolovane spoustej', feedback_correct: 'Dobry sestup', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Chest', nameCs: 'U hrudi', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 90 }], feedback_wrong: 'Dotkni se hrudi', feedback_correct: 'Dole!', minDurationMs: 150 },
      { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 150 }], feedback_wrong: 'Tlac rovnomerne', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Deadlift', nameCs: 'Mrtvy tah',
    description: 'Full body compound lift targeting posterior chain.',
    descriptionCs: 'Komplexni cvik na zada, hyzde a zadni stehna.',
    muscleGroups: ['BACK', 'HAMSTRINGS', 'GLUTES', 'CORE'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: ['Postav se k cince, nohy na sirku boku, cinka nad stredem chodidla.', 'Predklon se v kyccich (ne v zadech!), uchop cinku nadhmatem.', 'Stahni lopatky, hrudnik nahoru, zada ROVNA.', 'Nadechni se, zpevni core.', 'Tlac nohama do zeme — cinka jde nahoru podel nohou.', 'Vzprim se, boky dopredu, ramena dozadu.', 'Nahore: stuj zprimma, nezaklanet se.', 'Kontrolovane spust cinku dolu — kycle dozadu, pak ohni kolena.'],
      commonMistakes: ['Zaoblena zada — KRITICKE! Zada musi byt neutralni po celou dobu.', 'Cinka daleko od tela — musi jit podel nohou.', 'Trhani cinky — plynuly, kontrolovany pohyb.', 'Hyperextenze nahore — stuj rovne, nezaklanet.'],
      targetMuscles: { primary: ['Vzprimovace patere', 'Gluteus maximus', 'Hamstringy'], secondary: ['Trapezy', 'Predlokti (uchop)', 'Core', 'Quadriceps'] },
      breathing: 'NADECH dole (zpevnit core), VYDECH nahore.',
      tempo: '1-0-2 (1s nahoru, 0 pauza, 2s kontrolovane dolu)',
      warmup: '2\u00d710 rumunsky mrtvy tah s lehkou vahou. 1\u00d75 s 50% vahy.',
      tips: ['Zada VZDY rovna — radeji mensi vaha s perfektni formou.', 'Cinka jde podel nohou — ne od tela.', 'Zacni pohyb nohama, ne zady.'],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj zprimma', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Hinging', nameCs: 'Predklon', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 140 }, { joint: 'left_knee', angle_min: 140, angle_max: 170 }], feedback_wrong: 'Zada rovna, ohybej v kyccich', feedback_correct: 'Dobry predklon', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_hip', angle_min: 50, angle_max: 90 }], feedback_wrong: 'Prsa nahoru, zada neutralni', feedback_correct: 'Dobra pozice!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pulling', nameCs: 'Tah', rules: [{ joint: 'left_hip', angle_min: 90, angle_max: 150 }], feedback_wrong: 'Tlac boky dopredu', feedback_correct: 'Tahni!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Bicep Curl', nameCs: 'Bicepsovy zdvih',
    description: 'Isolation exercise for biceps.',
    descriptionCs: 'Izolovany cvik na bicepsy.',
    muscleGroups: ['BICEPS'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: ['Postav se rovne, jednorucky v rukou, dlane dopredu.', 'Lokty u tela — nepohybuj jimi!', 'Pomalu zdvihni cinky smerem k ramenum.', 'Stiskni biceps nahore (1s vydrz).', 'Pomalu spust zpet dolu — kontrolovane, ne padem.'],
      commonMistakes: ['Svihani telem — stuj pevne, pracuje jen predlokti.', 'Lokty utikaji dopredu — drz je u boku.', 'Prilis rychle spousteni — negativni faze je dulezita.', 'Nepropnuti rukou dole — plny rozsah pohybu.'],
      targetMuscles: { primary: ['Biceps brachii'], secondary: ['Brachialis', 'Predlokti'] },
      breathing: 'VYDECH pri zdvihu, NADECH pri spousteni.',
      tempo: '2-1-3 (2s nahoru, 1s stisk, 3s dolu — duraz na negativni fazi)',
      warmup: '1\u00d715 s lehkou vahou.',
      tips: ['Lokty = fixni bod, nehybej jimi.', 'Kontroluj negativni fazi (spousteni) — tam roste sval.', 'Alternativne stridat ruce pro lepsi soustredeni.'],
    },
    phases: [
      { phase: 'START', name: 'Arms Down', nameCs: 'Ruce dole', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce dolu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Curling', nameCs: 'Zdvih', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 120 }], feedback_wrong: 'Lokty u tela, nesvihej', feedback_correct: 'Dobry zdvih', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_elbow', angle_min: 30, angle_max: 60 }], feedback_wrong: 'Stiskni biceps nahore', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 160 }], feedback_wrong: 'Pomalu dolu, kontroluj', feedback_correct: 'Dobry sestup', minDurationMs: 200 },
    ],
  },
  {
    name: 'Overhead Press', nameCs: 'Tlak nad hlavu',
    description: 'Shoulder press targeting deltoids and triceps.',
    descriptionCs: 'Ramena a tricepsy — tlak nad hlavu.',
    muscleGroups: ['SHOULDERS', 'TRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: ['Uchop cinku nadhmatem na sirku ramen.', 'Zvedni ji do pozice u ramen (cinka se dotyka klicnich kosti).', 'Nadechni se, zpevni core a hyzde.', 'Tlac cinku rovne nad hlavu — hlava se uhne dozadu.', 'Propni ruce nahore, cinka nad stredem hlavy.', 'Kontrolovane spust zpet k ramenum.'],
      commonMistakes: ['Zaklaneni — drz trup vzprimeny, zpevni core.', 'Tlak dopredu misto nahoru — cinka jde rovne.', 'Lokty prilis vzadu — drz je mirne vpredu.', 'Nezamcene ruce nahore — propni uplne.'],
      targetMuscles: { primary: ['Predni a stredni deltoid'], secondary: ['Triceps', 'Horni trapez', 'Core (stabilizace)'] },
      breathing: 'NADECH dole, VYDECH pri tlaku nahoru.',
      tempo: '1-1-2 (1s nahoru, 1s nahore, 2s dolu)',
      warmup: '2\u00d715 s prazdnou cinkou.',
      tips: ['Zpevni hyzde — stabilita celeho tela.', 'Divej se dopredu, ne nahoru.', 'Cinka jde rovne — nejkratsi cesta.'],
    },
    phases: [
      { phase: 'START', name: 'Rack', nameCs: 'U ramen', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 100 }, { joint: 'left_shoulder', angle_min: 60, angle_max: 100 }], feedback_wrong: 'Cinka u ramen', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Tlac rovne nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Lockout', nameCs: 'Nahore', rules: [{ joint: 'left_elbow', angle_min: 155, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce nahore', feedback_correct: 'Zamknuto!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 150 }], feedback_wrong: 'Kontrolovane dolu', feedback_correct: 'Dobry sestup', minDurationMs: 200 },
    ],
  },
  {
    name: 'Barbell Row', nameCs: 'Pritahy v predklonu',
    description: 'Compound back exercise targeting lats and rhomboids.',
    descriptionCs: 'Zada — siroky sval a mezilopatkove svaly.',
    muscleGroups: ['BACK', 'BICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: ['Uchop cinku nadhmatem, mirne sireji nez ramena.', 'Predklon se v kyccich do cca 45\u00b0 — zada ROVNA.', 'Ruce visi dolu, mirne pokrcene lokty.', 'Tahni cinku k dolni casti hrudniku / brichu.', 'Stiskni lopatky k sobe nahore (1s vydrz).', 'Kontrolovane spust dolu.'],
      commonMistakes: ['Zaoblena zada — neutralni pater po celou dobu.', 'Trhani cinky — plynuly tah, ne svih.', 'Prilis vzprimeny postoj — predklon musi byt dostatecny (45\u00b0).', 'Lokty prilis daleko od tela.'],
      targetMuscles: { primary: ['Latissimus dorsi (siroky zadovy)', 'Rhomboids (mezilopatkove)'], secondary: ['Biceps', 'Zadni deltoid', 'Vzprimovace patere'] },
      breathing: 'VYDECH pri tahu nahoru, NADECH pri spousteni.',
      tempo: '1-1-2 (1s tah, 1s stisk, 2s dolu)',
      warmup: '2\u00d715 s lehkou vahou nebo prazdnou cinkou.',
      tips: ['Tahni lokty dozadu, ne ruce.', 'Predstav si, ze mackas tuzku mezi lopatkami.', 'Zada musi byt rovna — jako pri mrtvem tahu.'],
    },
    phases: [
      { phase: 'START', name: 'Hinged', nameCs: 'Predklon', rules: [{ joint: 'left_hip', angle_min: 60, angle_max: 100 }, { joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Predklon se, ruce propnute', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rowing', nameCs: 'Pritah', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 120 }], feedback_wrong: 'Tahni k brichu, lokty dozadu', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Squeeze', nameCs: 'Stisk', rules: [{ joint: 'left_elbow', angle_min: 40, angle_max: 70 }], feedback_wrong: 'Stiskni lopatky k sobe', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Plank', nameCs: 'Plank',
    description: 'Isometric core stabilization exercise.',
    descriptionCs: 'Izometricky cvik na stabilizaci trupu.',
    muscleGroups: ['CORE', 'SHOULDERS'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: ['Lehni si na bricho, predlokti na zem (lokty pod rameny).', 'Zvedni telo — opora na predloktich a spickach.', 'Telo tvori ROVNOU linii: hlava-ramena-boky-paty.', 'Zpevni bricho (jako bys cekal ranu do bricha).', 'Stahni hyzdE.', 'Drz pozici po stanovenou dobu.'],
      commonMistakes: ['Propadla zada — zpevni core, nezvedej hlavu.', 'Zvednuty zadek — boky v linii s rameny.', 'Zadrzovani dechu — dychej normalne.', 'Pohled nahoru — krk neutralni, divej se na zem.'],
      targetMuscles: { primary: ['Rectus abdominis (primy brisni)', 'Transverzus abdominis (hluboky stabilizator)'], secondary: ['Predni deltoid', 'Quadriceps', 'Gluteus'] },
      breathing: 'Dychej normalne — nezadrzuj dech! Kratke pravidelne nadechy a vydechy.',
      tempo: 'Vydrz: 30-60s pro zacatecniky, 60-120s pro pokrocile.',
      warmup: 'Zadny specialni warm-up. Zacni kratsi vydrzi.',
      tips: ['Mene je vice — 30s s perfektni formou > 2min se spatnou.', 'Zkus varianty: bocni plank, plank s dotykem ramene.'],
    },
    phases: [
      { phase: 'START', name: 'Hold', nameCs: 'Vydrz', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 70, angle_max: 110 }], feedback_wrong: 'Boky v linii, nezvedej zadek', feedback_correct: 'Perfektni plank!', minDurationMs: 1000 },
    ],
  },
  {
    name: 'Lunges', nameCs: 'Vypady',
    description: 'Unilateral leg exercise for quads, glutes, and balance.',
    descriptionCs: 'Vypady vpred — stehna, hyzdE, stabilita.',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: ['Postav se rovne, nohy u sebe.', 'Vykroc jednou nohou dopredu (velky krok).', 'Sniz telo dolu — obe kolena do 90\u00b0.', 'Zadni koleno se temer dotkne zeme.', 'Predni koleno nepresahuje spicku.', 'Odraz z predni paty a vrat se do stoje.', 'Opakuj s druhou nohou (stridej).'],
      commonMistakes: ['Koleno pres spicku — krok musi byt dostatecne dlouhy.', 'Uzky postoj — nohy na sirku boku, ne za sebou.', 'Predklon trupu — drz se vzprimene.', 'Odraz ze spicky — tlac z paty.'],
      targetMuscles: { primary: ['Quadriceps', 'Gluteus maximus'], secondary: ['Hamstringy', 'Adduktory', 'Core (stabilizace)'] },
      breathing: 'NADECH pri sestupu, VYDECH pri vystupu.',
      tempo: '2-1-1 (2s dolu, 1s dole, 1s nahoru)',
      warmup: '1\u00d710 vypady bez zavazi na kazdou nohu.',
      tips: ['Skvely cvik pro opravu asymetrii mezi nohama.', 'Varianta: bulharsky vypad (zadni noha na lavicce) pro vetsi vyzvu.'],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }, { joint: 'right_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj rovne', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Stepping', nameCs: 'Vykrok', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 150 }], feedback_wrong: 'Koleno za spicku, trup rovne', feedback_correct: 'Dobry vykrok', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_knee', angle_min: 80, angle_max: 100 }], feedback_wrong: 'Koleno do 90\u00b0, zadni koleno k zemi', feedback_correct: 'Perfektni pozice!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pushing', nameCs: 'Vystup', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Odraz z predni paty', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Chest (4)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Incline Dumbbell Press', nameCs: 'Sikmy tlak s jednorukami',
    description: 'Upper chest press on an incline bench with dumbbells.',
    descriptionCs: 'Tlak na sikme lavici s jednoruckami — horni cast prsou.',
    muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Nastav lavici na 30-45\u00b0.',
        'Sedni si, jednorucky poloz na stehna.',
        'Kopnutim kolen si je vyhod do vychozi pozice nad hrudnikem.',
        'Stahni lopatky, ruce propnute nad hornim hrudnikem.',
        'Pomalu spoustej jednorucky do stran — lokty v 45\u00b0.',
        'Dole ucitis natazeni v prsou.',
        'Tlac nahoru a mirne k sobe.',
      ],
      commonMistakes: [
        'Prilis strmy uhel lavice — max 45\u00b0, jinak prebiraj ramena.',
        'Lokty prilis daleko od tela — drz 45\u00b0 uhel.',
        'Nerovnomerne spousteni — obe strany symetricky.',
      ],
      targetMuscles: {
        primary: ['Horni pectoralis major'],
        secondary: ['Predni deltoid', 'Triceps'],
      },
      breathing: 'NADECH pri spousteni, VYDECH pri tlaku nahoru.',
      tempo: '2-1-1 (2s dolu, 1s pauza, 1s nahoru)',
      warmup: '1\u00d712 s lehkymi jednoruckami.',
      tips: [
        'Lopatky stazene po celou dobu.',
        'Jednorucky se nahore temer dotknou.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Extended', nameCs: 'Vzpazeni', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }, { joint: 'right_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce nahoru', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Pomalu dolu, kontroluj', feedback_correct: 'Dobry sestup', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 90 }], feedback_wrong: 'Ucit natazeni v prsou', feedback_correct: 'Dole!', minDurationMs: 150 },
      { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 160 }], feedback_wrong: 'Tlac nahoru, lopatky stazene', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Dumbbell Fly', nameCs: 'Rozpazky s jednoruckami',
    description: 'Chest isolation exercise with dumbbells on a flat bench.',
    descriptionCs: 'Izolace prsou — rozpazky na rovne lavici.',
    muscleGroups: ['CHEST'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Lehni si na rovnou lavici, jednorucky nad hrudnikem.',
        'Mirne pokrc lokty (15-20\u00b0) a drz uhel po celou dobu.',
        'Pomalu rozpazuj ruce do stran — obloukem dolu.',
        'Dole ucitis natazeni v prsou.',
        'Stahni ruce zpet nahoru stejnym obloukem.',
      ],
      commonMistakes: [
        'Prilis propnute lokty — riziko zraneni, drz mirne pokrcene.',
        'Prilis hluboko — nestahuj pod uroven lavice.',
        'Meneni uhlu lokte — uhel loktu se NEMENI.',
      ],
      targetMuscles: {
        primary: ['Pectoralis major'],
        secondary: ['Predni deltoid'],
      },
      breathing: 'NADECH pri rozpazeni, VYDECH pri stazeni.',
      tempo: '2-1-2 (2s rozpazeni, 1s pauza, 2s stazeni)',
      warmup: '1\u00d712 s lehkou vahou.',
      tips: [
        'Predstav si, ze objimas velky strom.',
        'Uhel loktu se nemeni — pohyb je v ramennim kloubu.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Up', nameCs: 'Ruce nahore', rules: [{ joint: 'left_elbow', angle_min: 140, angle_max: 170 }, { joint: 'right_elbow', angle_min: 140, angle_max: 170 }], feedback_wrong: 'Ruce nad hrudnikem', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Opening', nameCs: 'Rozpazeni', rules: [{ joint: 'left_shoulder', angle_min: 60, angle_max: 120 }], feedback_wrong: 'Pomalu rozpazuj', feedback_correct: 'Dobry pohyb', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Stretched', nameCs: 'Natazeni', rules: [{ joint: 'left_shoulder', angle_min: 30, angle_max: 70 }], feedback_wrong: 'Citis natazeni v prsou?', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'CONCENTRIC', name: 'Closing', nameCs: 'Stazeni', rules: [{ joint: 'left_shoulder', angle_min: 70, angle_max: 140 }], feedback_wrong: 'Stahni ruce k sobe', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Cable Crossover', nameCs: 'Krizeni na kladkach',
    description: 'Cable chest isolation exercise with constant tension.',
    descriptionCs: 'Izolace prsou na kladkovem stroji — konstantni napeti.',
    muscleGroups: ['CHEST'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Postav se mezi kladky, madla nahore.',
        'Vykroc jednou nohou dopredu pro stabilitu.',
        'Mirne se predklon, lokty mirne pokrcene.',
        'Stahni madla obloukem dolu a pred sebe.',
        'V dolni pozici zkriz ruce.',
        'Pomalu vrat zpet nahoru.',
      ],
      commonMistakes: [
        'Prilis tezka vaha — pohyb musi byt plynuly.',
        'Propnute lokty — drz mirne pokrcene.',
        'Pohyb v loktech — lokty jsou fixni.',
      ],
      targetMuscles: {
        primary: ['Pectoralis major'],
        secondary: ['Predni deltoid'],
      },
      breathing: 'VYDECH pri stazeni, NADECH pri navraceni.',
      tempo: '2-1-2 (2s stazeni, 1s stisk, 2s zpet)',
      warmup: '1\u00d712 s lehkou vahou.',
      tips: [
        'Soustred se na stisk prsou v dolni pozici.',
        'Kontroluj pohyb v obou smerech.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Wide', nameCs: 'Rozpazeni', rules: [{ joint: 'left_shoulder', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Rozpaz ruce', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Crossing', nameCs: 'Krizeni', rules: [{ joint: 'left_shoulder', angle_min: 40, angle_max: 100 }], feedback_wrong: 'Stahni ruce k sobe', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Crossed', nameCs: 'Zkrizeni', rules: [{ joint: 'left_shoulder', angle_min: 10, angle_max: 50 }], feedback_wrong: 'Stiskni prsa', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Returning', nameCs: 'Navrat', rules: [{ joint: 'left_shoulder', angle_min: 60, angle_max: 140 }], feedback_wrong: 'Kontrolovane zpet', feedback_correct: 'Dobre!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Decline Push-up', nameCs: 'Klik s nohama nahore',
    description: 'Push-up with feet elevated targeting upper chest.',
    descriptionCs: 'Klik s nohama na vyvysene podlozce — horni prsa.',
    muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Poloz nohy na lavicku/schod za sebou.',
        'Ruce na zemi, sirsi nez ramena.',
        'Telo v rovne linii.',
        'Spoustej hrudnik k zemi.',
        'Tlac zpet nahoru.',
      ],
      commonMistakes: [
        'Propadle boky.',
        'Prilis vysoka podlozka pro zacatecniky.',
        'Lokty prilis daleko.',
      ],
      targetMuscles: {
        primary: ['Horni pectoralis major', 'Predni deltoid'],
        secondary: ['Triceps', 'Core'],
      },
      breathing: 'NADECH dolu, VYDECH nahoru.',
      tempo: '2-1-1',
      warmup: '1\u00d710 klasickych kliku.',
      tips: [
        'Cim vyse nohy, tim tezsi cvik.',
        'Drz core zpevneny po celou dobu.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Plank', nameCs: 'Plank', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 130 }], feedback_wrong: 'Kontroluj sestup', feedback_correct: 'Dolu', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 80 }], feedback_wrong: 'Hrudnik k zemi', feedback_correct: 'Dole!', minDurationMs: 150 },
      { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Tlac nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Back (5)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Lat Pulldown', nameCs: 'Stahovani na kladce',
    description: 'Machine back exercise targeting latissimus dorsi.',
    descriptionCs: 'Stahovani horni kladky — siroky zadovy sval.',
    muscleGroups: ['BACK', 'BICEPS'],
    difficulty: 'BEGINNER' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Sedni si ke stroji, stehna pod operu.',
        'Uchop tyc siroce, nadhmatem.',
        'Stahni lopatky dolu a dozadu.',
        'Tahni tyc k horni casti hrudi.',
        'Drz 1s dole, stiskni lopatky.',
        'Pomalu vrat nahoru.',
      ],
      commonMistakes: [
        'Tahani za hlavu — NEBEZPECNE, tahni pred sebe.',
        'Zakloneni trupu — mirny zaklon OK, ne prilis.',
        'Pohyb z bicepsu — zacni pohyb lopatkami.',
      ],
      targetMuscles: {
        primary: ['Latissimus dorsi'],
        secondary: ['Biceps', 'Rhomboids', 'Zadni deltoid'],
      },
      breathing: 'VYDECH pri tahu dolu, NADECH pri vraceni.',
      tempo: '2-1-3 (2s tah, 1s stisk, 3s zpet)',
      warmup: '1\u00d715 s lehkou vahou.',
      tips: [
        'Predstav si, ze tahas lokty dolu, ne ruce.',
        'Lopatky k sobe a dolu — to je klicove.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Up', nameCs: 'Ruce nahore', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Ruce nahoru, uchop tyc', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pulling', nameCs: 'Tah', rules: [{ joint: 'left_elbow', angle_min: 70, angle_max: 130 }], feedback_wrong: 'Tahni lokty dolu', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_elbow', angle_min: 40, angle_max: 80 }], feedback_wrong: 'Stiskni lopatky dole', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Returning', nameCs: 'Navrat', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Pomalu zpet nahoru', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Seated Cable Row', nameCs: 'Pritahy v sede na kladce',
    description: 'Cable back exercise for mid-back thickness.',
    descriptionCs: 'Pritahy v sede na kladce — stredni cast zad.',
    muscleGroups: ['BACK', 'BICEPS'],
    difficulty: 'BEGINNER' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Sedni si ke kladce, nohy na operu, kolena mirne pokrcena.',
        'Uchop madlo uzkym uchopem.',
        'Trup vzprimeny, hrudnik ven.',
        'Tahni madlo k brichu — lokty jdou dozadu.',
        'Stiskni lopatky k sobe.',
        'Pomalu vrat zpet.',
      ],
      commonMistakes: [
        'Houpani trupem — trup stabilni.',
        'Zaoblena zada — hrudnik ven.',
        'Pohyb z bicepsu — tahni lopatkami.',
      ],
      targetMuscles: {
        primary: ['Rhomboids', 'Stredni trapezy'],
        secondary: ['Latissimus dorsi', 'Biceps', 'Zadni deltoid'],
      },
      breathing: 'VYDECH pri tahu, NADECH pri vraceni.',
      tempo: '2-1-2',
      warmup: '1\u00d715 s lehkou vahou.',
      tips: [
        'Zamysli se nad lopatkami, ne nad rukama.',
        'Trup se nehybe — pracuji jen ruce a zada.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Forward', nameCs: 'Ruce vpred', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce dopredu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rowing', nameCs: 'Pritah', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 120 }], feedback_wrong: 'Tahni k brichu', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Squeeze', nameCs: 'Stisk', rules: [{ joint: 'left_elbow', angle_min: 40, angle_max: 70 }], feedback_wrong: 'Stiskni lopatky', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Returning', nameCs: 'Navrat', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Pomalu zpet', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Dumbbell Row', nameCs: 'Pritah jednoruky',
    description: 'Unilateral back exercise with dumbbell on a bench.',
    descriptionCs: 'Jednoruci pritah s jednoruckou — zada.',
    muscleGroups: ['BACK', 'BICEPS'],
    difficulty: 'BEGINNER' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Opri se jednou rukou a kolenem o lavicku.',
        'Druha noha na zemi, jednorucka v ruce.',
        'Zada rovna, pohled dolu.',
        'Tahni jednorucku k boku — loket jde nahoru.',
        'Stiskni lopatku nahore.',
        'Pomalu spust.',
      ],
      commonMistakes: [
        'Rotace trupu — trup stabilni.',
        'Trhani vahy — plynuly pohyb.',
        'Zaoblena zada — neutralni pater.',
      ],
      targetMuscles: {
        primary: ['Latissimus dorsi', 'Rhomboids'],
        secondary: ['Biceps', 'Zadni deltoid'],
      },
      breathing: 'VYDECH pri tahu, NADECH pri spousteni.',
      tempo: '1-1-2 (1s tah, 1s stisk, 2s dolu)',
      warmup: '1\u00d710 s lehkou vahou na kazdou stranu.',
      tips: [
        'Tahni loktem, ne rukou.',
        'Jednorucka jde k boku, ne k hrudi.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arm Down', nameCs: 'Ruka dole', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruku dolu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rowing', nameCs: 'Pritah', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 120 }], feedback_wrong: 'Tahni loktem nahoru', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_elbow', angle_min: 40, angle_max: 70 }], feedback_wrong: 'Stiskni lopatku', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Face Pull', nameCs: 'Face pull',
    description: 'Cable rear delt and upper back exercise for posture.',
    descriptionCs: 'Pritahy k obliceji na kladce — zadni deltoidy a drzeni tela.',
    muscleGroups: ['SHOULDERS', 'BACK'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Nastav kladku na uroven hlavy, pripni provaz.',
        'Uchop provaz obouruc, dlane k sobe.',
        'Ustup dozadu, ruce propnute.',
        'Tahni provaz k obliceji — lokty jdou do stran a dozadu.',
        'V koncove pozici externe rotuj ramena (palce dozadu).',
        'Pomalu vrat zpet.',
      ],
      commonMistakes: [
        'Prilis tezka vaha — toto je cvik na techniku.',
        'Tahani dolu misto k obliceji.',
        'Chybejici externi rotace na konci.',
      ],
      targetMuscles: {
        primary: ['Zadni deltoid', 'Rhomboids'],
        secondary: ['Stredni trapezy', 'Infraspinatus'],
      },
      breathing: 'VYDECH pri tahu, NADECH pri vraceni.',
      tempo: '2-1-2',
      warmup: 'Zadny — zaradit jako zahrivaci cvik.',
      tips: [
        'Skvely cvik na zdravi ramen — zarad do kazdeho treninku.',
        'Externe rotuj na konci — palce dozadu.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Forward', nameCs: 'Ruce vpred', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce dopredu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pulling', nameCs: 'Pritah', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 120 }], feedback_wrong: 'Tahni k obliceji', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Rotated', nameCs: 'Rotace', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 100 }], feedback_wrong: 'Palce dozadu, rotuj', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Returning', nameCs: 'Navrat', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Pomalu zpet', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Pull-up', nameCs: 'Shyb',
    description: 'Bodyweight back exercise on a pull-up bar.',
    descriptionCs: 'Shyb na hrazde — zada a bicepsy.',
    muscleGroups: ['BACK', 'BICEPS'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Chyt se hrazdy nadhmatem, sirsi nez ramena.',
        'Vis volne, lopatky stazene dolu.',
        'Tahni se nahoru — brada nad hrazdu.',
        'Drz 1s nahore.',
        'Pomalu spust zpet do visu.',
      ],
      commonMistakes: [
        'Kyvani telem — ciste tahani.',
        'Neuplny rozsah — brada musi byt nad hrazdou.',
        'Prilis rychle spousteni.',
      ],
      targetMuscles: {
        primary: ['Latissimus dorsi', 'Biceps'],
        secondary: ['Rhomboids', 'Predlokti', 'Core'],
      },
      breathing: 'VYDECH nahoru, NADECH dolu.',
      tempo: '1-1-2 (1s nahoru, 1s drz, 2s dolu)',
      warmup: 'Vis na hrazde 20s + negativni shyby.',
      tips: [
        'Pokud neudelas shyb — zacni s negativnimi (jen spousteni).',
        'Odporova guma pomaha s prvnimi shyby.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Hanging', nameCs: 'Vis', rules: [{ joint: 'left_elbow', angle_min: 155, angle_max: 180 }], feedback_wrong: 'Vis, ruce propnute', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pulling', nameCs: 'Tahani', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 130 }], feedback_wrong: 'Tahni se nahoru', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_elbow', angle_min: 30, angle_max: 70 }], feedback_wrong: 'Brada nad hrazdu', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 165 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Shoulders (4)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Lateral Raise', nameCs: 'Upazovani',
    description: 'Isolation exercise for medial deltoid.',
    descriptionCs: 'Izolace stredniho deltoidu — upazovani s jednoruckami.',
    muscleGroups: ['SHOULDERS'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Stuj rovne, jednorucky po stranach tela.',
        'Mirne pokrc lokty.',
        'Zvedni ruce do stran na uroven ramen.',
        'Drz 1s nahore.',
        'Pomalu spust dolu.',
      ],
      commonMistakes: [
        'Prilis tezka vaha — svihani.',
        'Zvedani nad uroven ramen — zbytecne.',
        'Propnute lokty — drz mirne pokrcene.',
      ],
      targetMuscles: {
        primary: ['Stredni deltoid'],
        secondary: ['Horni trapezy'],
      },
      breathing: 'VYDECH pri zvedani, NADECH pri spousteni.',
      tempo: '2-1-3 (2s nahoru, 1s drz, 3s dolu)',
      warmup: '1\u00d715 s nejlehci jednoruckou.',
      tips: [
        'Vedenymi lokty, ne rukama.',
        'Predstav si, ze vylevas vodu ze sklenic.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Down', nameCs: 'Ruce dole', rules: [{ joint: 'left_shoulder', angle_min: 0, angle_max: 30 }], feedback_wrong: 'Ruce dolu podl tela', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Raising', nameCs: 'Zvedani', rules: [{ joint: 'left_shoulder', angle_min: 40, angle_max: 80 }], feedback_wrong: 'Zvedej do stran', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_shoulder', angle_min: 75, angle_max: 110 }], feedback_wrong: 'Drz na urovni ramen', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_shoulder', angle_min: 20, angle_max: 70 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Front Raise', nameCs: 'Predpazovani',
    description: 'Isolation exercise for anterior deltoid.',
    descriptionCs: 'Izolace predniho deltoidu — predpazovani s jednoruckami.',
    muscleGroups: ['SHOULDERS'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Stuj rovne, jednorucky pred stehny, dlane k telu.',
        'Mirne pokrc lokty.',
        'Zvedni jednorucky pred sebe na uroven ramen.',
        'Drz 1s nahore.',
        'Pomalu spust.',
      ],
      commonMistakes: [
        'Svihani telem.',
        'Zvedani prilis vysoko.',
        'Propnute lokty.',
      ],
      targetMuscles: {
        primary: ['Predni deltoid'],
        secondary: ['Horni pectoralis'],
      },
      breathing: 'VYDECH pri zvedani, NADECH pri spousteni.',
      tempo: '2-1-2',
      warmup: '1\u00d712 s lehkou vahou.',
      tips: [
        'Stridet ruce nebo obe zaroven.',
        'Nezvedej nad uroven ramen.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Down', nameCs: 'Ruce dole', rules: [{ joint: 'left_shoulder', angle_min: 0, angle_max: 30 }], feedback_wrong: 'Ruce dolu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Raising', nameCs: 'Zvedani', rules: [{ joint: 'left_shoulder', angle_min: 40, angle_max: 80 }], feedback_wrong: 'Zvedej pred sebe', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_shoulder', angle_min: 75, angle_max: 110 }], feedback_wrong: 'Drz na urovni ramen', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_shoulder', angle_min: 20, angle_max: 70 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Rear Delt Fly', nameCs: 'Rozpazky na zadni delty',
    description: 'Isolation exercise for posterior deltoid.',
    descriptionCs: 'Izolace zadniho deltoidu — rozpazky v predklonu.',
    muscleGroups: ['SHOULDERS', 'BACK'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Predklon se v kyccich do 45\u00b0, jednorucky pod sebou.',
        'Mirne pokrc lokty.',
        'Rozpaz ruce do stran — lokty jdou nahoru.',
        'Stiskni lopatky nahore.',
        'Pomalu spust.',
      ],
      commonMistakes: [
        'Prilis vzprimeny postoj.',
        'Pohyb z trapezu misto deltoidu.',
        'Svihani vahou.',
      ],
      targetMuscles: {
        primary: ['Zadni deltoid'],
        secondary: ['Rhomboids', 'Stredni trapezy'],
      },
      breathing: 'VYDECH pri rozpazeni, NADECH pri spousteni.',
      tempo: '2-1-2',
      warmup: '1\u00d712 s lehkou vahou.',
      tips: [
        'Lokty mirne pokrcene a fixni.',
        'Soustred se na stisk lopatek.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Hanging', nameCs: 'Vis', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 175 }, { joint: 'left_hip', angle_min: 50, angle_max: 100 }], feedback_wrong: 'Predklon, ruce dolu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Flying', nameCs: 'Rozpazeni', rules: [{ joint: 'left_shoulder', angle_min: 50, angle_max: 100 }], feedback_wrong: 'Rozpaz do stran', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_shoulder', angle_min: 80, angle_max: 120 }], feedback_wrong: 'Stiskni lopatky', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_shoulder', angle_min: 20, angle_max: 70 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Arnold Press', nameCs: 'Arnolduv tlak',
    description: 'Rotational shoulder press hitting all three deltoid heads.',
    descriptionCs: 'Rotacni tlak nad hlavu — vsechny tri hlavy deltoidu.',
    muscleGroups: ['SHOULDERS', 'TRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Sedni si, jednorucky pred oblicejem, dlane k sobe (pozice bicep curl nahore).',
        'Rozpazuj a zaroven tlac nahoru.',
        'Na vrcholu — ruce propnute, dlane dopredu.',
        'Zpet dolni cestou — stahni a zaroven rotuj dlane k sobe.',
      ],
      commonMistakes: [
        'Chybejici rotace — to je klicovy prvek.',
        'Prilis rychly pohyb — plynula rotace.',
        'Zakloneni.',
      ],
      targetMuscles: {
        primary: ['Predni deltoid', 'Stredni deltoid'],
        secondary: ['Triceps', 'Zadni deltoid'],
      },
      breathing: 'NADECH dole, VYDECH pri tlaku nahoru.',
      tempo: '2-1-2 (2s nahoru s rotaci, 1s nahore, 2s dolu)',
      warmup: '1\u00d710 s lehkou vahou.',
      tips: [
        'Rotace je plynula a soucast pohybu.',
        'Na vrcholu dlane smeruji dopredu.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Curl Position', nameCs: 'Zdvih', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 90 }, { joint: 'left_shoulder', angle_min: 50, angle_max: 90 }], feedback_wrong: 'Jednorucky pred oblicejem', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rotating Press', nameCs: 'Rotacni tlak', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Rotuj a tlac nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Lockout', nameCs: 'Nahore', rules: [{ joint: 'left_elbow', angle_min: 155, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni nahore', feedback_correct: 'Zamknuto!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 150 }], feedback_wrong: 'Rotuj zpet dolu', feedback_correct: 'Dobre!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Arms (4)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Hammer Curl', nameCs: 'Kladivovy zdvih',
    description: 'Bicep and brachialis exercise with neutral grip.',
    descriptionCs: 'Zdvih s neutralnim uchopem — biceps a brachialis.',
    muscleGroups: ['BICEPS'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Stuj rovne, jednorucky po stranach, dlane k telu (neutralni uchop).',
        'Lokty u tela.',
        'Zdvihni jednorucky smerem k ramenum — dlane zustavaji k sobe.',
        'Stiskni nahore.',
        'Pomalu spust.',
      ],
      commonMistakes: [
        'Rotace zapesti — dlane zustavaji k sobe.',
        'Svihani telem.',
        'Lokty utikaji dopredu.',
      ],
      targetMuscles: {
        primary: ['Brachialis', 'Biceps brachii'],
        secondary: ['Brachioradialis (predlokti)'],
      },
      breathing: 'VYDECH pri zdvihu, NADECH pri spousteni.',
      tempo: '2-1-2',
      warmup: '1\u00d712 s lehkou vahou.',
      tips: [
        'Skvele pro vybudovani predlokti.',
        'Stridet ruce nebo obe zaroven.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Down', nameCs: 'Ruce dole', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce dolu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Curling', nameCs: 'Zdvih', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 120 }], feedback_wrong: 'Dlane k sobe, lokty u tela', feedback_correct: 'Dobry zdvih', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_elbow', angle_min: 30, angle_max: 60 }], feedback_wrong: 'Stiskni nahore', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 160 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Tricep Pushdown', nameCs: 'Tlaky na triceps na kladce',
    description: 'Cable isolation exercise for triceps.',
    descriptionCs: 'Izolace tricepsu na horni kladce.',
    muscleGroups: ['TRICEPS'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Stuj pred horni kladkou, uchop tyc/provaz.',
        'Lokty u tela, predlokti vodorovne.',
        'Tlac madlo dolu az do propnuti.',
        'Stiskni triceps dole.',
        'Pomalu vrat do vychozi pozice.',
      ],
      commonMistakes: [
        'Lokty se hnou — musi zustat u tela.',
        'Predklon — trup vzprimeny.',
        'Prilis tezka vaha — svihani.',
      ],
      targetMuscles: {
        primary: ['Triceps brachii'],
        secondary: [],
      },
      breathing: 'VYDECH pri tlaku dolu, NADECH pri vraceni.',
      tempo: '1-1-2 (1s dolu, 1s stisk, 2s zpet)',
      warmup: '1\u00d715 s lehkou vahou.',
      tips: [
        'Lokty jsou fixni bod — pohybuje se jen predlokti.',
        'Provaz umoznuje vice rotace nez tyc.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Mid Position', nameCs: 'Stredni pozice', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 110 }], feedback_wrong: 'Lokty u tela, predlokti vodorovne', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pushing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 140, angle_max: 180 }], feedback_wrong: 'Propni ruce dolu', feedback_correct: 'Dolu!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Lockout', nameCs: 'Propnuti', rules: [{ joint: 'left_elbow', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stiskni triceps', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Returning', nameCs: 'Navrat', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 150 }], feedback_wrong: 'Pomalu zpet', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Skull Crusher', nameCs: 'Francouzsky tlak',
    description: 'Lying tricep extension with barbell or EZ bar.',
    descriptionCs: 'Francouzsky tlak vleze — triceps s cinkou.',
    muscleGroups: ['TRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Lehni si na lavici, cinka v rukou nad hrudnikem.',
        'Ruce propnute, uzky uchop.',
        'Ohybej POUZE v loktech — spust cinku k celu.',
        'Lokty smeruji ke stropu, nehybou se.',
        'Propni ruce zpet nahoru.',
      ],
      commonMistakes: [
        'Lokty se roztahuji — drz je u sebe.',
        'Pohyb v ramenech — pracuji jen lokty.',
        'Prilis rychle spousteni — kontrola!',
      ],
      targetMuscles: {
        primary: ['Triceps brachii (dlouha hlava)'],
        secondary: [],
      },
      breathing: 'NADECH pri spousteni, VYDECH pri propnuti.',
      tempo: '2-1-1 (2s dolu, 1s pauza, 1s nahoru)',
      warmup: '1\u00d712 s lehkou vahou.',
      tips: [
        'Spoustej za hlavu pro vetsi natazeni dlouhe hlavy.',
        'EZ tyc je setrnejsi pro zapesti nez rovna.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arms Extended', nameCs: 'Propnuti', rules: [{ joint: 'left_elbow', angle_min: 155, angle_max: 180 }], feedback_wrong: 'Propni ruce nahoru', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 120 }], feedback_wrong: 'Spoustej k celu, lokty fixni', feedback_correct: 'Dolu!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_elbow', angle_min: 40, angle_max: 70 }], feedback_wrong: 'Drz dole', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'CONCENTRIC', name: 'Extending', nameCs: 'Propinani', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Propni ruce nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Concentration Curl', nameCs: 'Koncentrovany zdvih',
    description: 'Seated single-arm bicep isolation curl.',
    descriptionCs: 'Koncentrovany bicepsovy zdvih vsede — maximalni izolace.',
    muscleGroups: ['BICEPS'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Sedni si na lavicku, nohy siroce.',
        'Opri loket o vnitrni stranu stehna.',
        'Jednorucka v ruce, ruka propnuta dolu.',
        'Pomalu zdvihni jednorucku k ramenu.',
        'Stiskni biceps nahore.',
        'Pomalu spust zpet.',
      ],
      commonMistakes: [
        'Pohyb v rameni — pracuje jen loket.',
        'Svihani — kontrolovany pohyb.',
        'Odtrhavani lokte od stehna.',
      ],
      targetMuscles: {
        primary: ['Biceps brachii'],
        secondary: ['Brachialis'],
      },
      breathing: 'VYDECH pri zdvihu, NADECH pri spousteni.',
      tempo: '2-2-3 (2s nahoru, 2s stisk, 3s dolu)',
      warmup: 'Zadny — pouzij lehkou vahu.',
      tips: [
        'Maximalni soustredeni na biceps.',
        'Negativni faze (spousteni) je klicova pro rust.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Arm Down', nameCs: 'Ruka dole', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruku dolu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Curling', nameCs: 'Zdvih', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 120 }], feedback_wrong: 'Zdvihej pomalu', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_elbow', angle_min: 30, angle_max: 60 }], feedback_wrong: 'Stiskni biceps', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 160 }], feedback_wrong: 'Pomalu dolu — 3 sekundy', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Legs Quads (4)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Front Squat', nameCs: 'Predni drep',
    description: 'Barbell squat with front rack position emphasizing quads.',
    descriptionCs: 'Drep s cinkou vpredu — vetsi duraz na stehna.',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'CORE'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Cinka na prednich deltoidech, lokty vysoko.',
        'Nohy na sirku ramen, spicky mirne ven.',
        'Nadechni se, zpevni core.',
        'Klesej dolu — kolena jdou dopredu pres spicky.',
        'Hrudnik vysoko, lokty nahoru.',
        'Tlac z pat zpet nahoru.',
      ],
      commonMistakes: [
        'Padajici lokty — drz je vysoko.',
        'Predklon — hrudnik nahoru.',
        'Zaoblena zada.',
      ],
      targetMuscles: {
        primary: ['Quadriceps'],
        secondary: ['Gluteus maximus', 'Core', 'Horni zada'],
      },
      breathing: 'NADECH dole, VYDECH nahoru.',
      tempo: '2-1-2',
      warmup: '2\u00d710 s prazdnou cinkou.',
      tips: [
        'Lokty co nejvys — to drzi cinku na miste.',
        'Mobilita zapesti je klicova — procvicuj.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }, { joint: 'right_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj zprimma', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Descending', nameCs: 'Klesani', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 150 }, { joint: 'left_hip', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Lokty nahoru, hrudnik vysoko', feedback_correct: 'Dobry sestup', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_knee', angle_min: 60, angle_max: 100 }, { joint: 'left_hip', angle_min: 50, angle_max: 100 }], feedback_wrong: 'Hloubka! Lokty nahoru', feedback_correct: 'Perfektni!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Ascending', nameCs: 'Stoupani', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Tlac z pat, hrudnik nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Leg Press', nameCs: 'Leg press',
    description: 'Machine compound exercise for quads, glutes, and hamstrings.',
    descriptionCs: 'Tlak nohama na stroji — stehna, hyzdE, hamstringy.',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    difficulty: 'BEGINNER' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Sedni si do stroje, zada na operu.',
        'Nohy na plosu, na sirku ramen.',
        'Odblokuj zardzku.',
        'Pomalu spoustej vahy — kolena k hrudi.',
        'Tlac nohama zpet nahoru.',
        'Nezamykej kolena uplne nahore.',
      ],
      commonMistakes: [
        'Zvedani hyzdi z opery — nebezpecne pro bedra.',
        'Zamcena kolena nahore.',
        'Prilis mala hloubka.',
      ],
      targetMuscles: {
        primary: ['Quadriceps', 'Gluteus maximus'],
        secondary: ['Hamstringy', 'Adduktory'],
      },
      breathing: 'NADECH pri spousteni, VYDECH pri tlaku.',
      tempo: '2-1-1',
      warmup: '1\u00d715 s lehkou vahou.',
      tips: [
        'Nohy vyse na plose = vice hyzdE.',
        'Nohy nize = vice stehna.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Extended', nameCs: 'Propnuti', rules: [{ joint: 'left_knee', angle_min: 150, angle_max: 175 }], feedback_wrong: 'Propni nohy (ne uplne!)', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 145 }], feedback_wrong: 'Spoustej kontrolovane', feedback_correct: 'Dolu!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_knee', angle_min: 70, angle_max: 100 }], feedback_wrong: 'Kolena k hrudi', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Tlac nohama', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Leg Extension', nameCs: 'Predkopavani',
    description: 'Machine isolation exercise for quadriceps.',
    descriptionCs: 'Izolace stehen na stroji — predkopavani.',
    muscleGroups: ['QUADRICEPS'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Sedni si do stroje, zada na operu.',
        'Polster na prednich holeni (nad kotniky).',
        'Propni nohy dopredu.',
        'Stiskni stehna nahore.',
        'Pomalu spust zpet.',
      ],
      commonMistakes: [
        'Prudke pohyby — kontrolovany rozsah.',
        'Zvedani hyzdi ze sedacky.',
        'Neuplne propnuti.',
      ],
      targetMuscles: {
        primary: ['Quadriceps'],
        secondary: [],
      },
      breathing: 'VYDECH pri propnuti, NADECH pri ohybu.',
      tempo: '1-2-2 (1s nahoru, 2s stisk, 2s dolu)',
      warmup: '1\u00d715 s lehkou vahou.',
      tips: [
        'Skvele na konec treninku jako finisher.',
        'Drz stisk nahore pro maximalni kontrakci.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Bent', nameCs: 'Ohyb', rules: [{ joint: 'left_knee', angle_min: 70, angle_max: 100 }], feedback_wrong: 'Nohy pokrcene', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Extending', nameCs: 'Propinani', rules: [{ joint: 'left_knee', angle_min: 120, angle_max: 165 }], feedback_wrong: 'Propni nohy', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stiskni stehna', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_knee', angle_min: 90, angle_max: 155 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Bulgarian Split Squat', nameCs: 'Bulharsky vypad',
    description: 'Single-leg squat with rear foot elevated on a bench.',
    descriptionCs: 'Jednonozny drep se zadni nohou na lavicce.',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Postav se zady k lavicce, krok dopredu.',
        'Poloz nart zadni nohy na lavicku.',
        'Predni noha stabilne na zemi.',
        'Klesej dolu — predni koleno do 90\u00b0.',
        'Zadni koleno temer k zemi.',
        'Tlac z predni paty nahoru.',
      ],
      commonMistakes: [
        'Prilis kratky krok — koleno pres spicku.',
        'Predklon trupu.',
        'Ztrata rovnovahy — soustred se na fixni bod.',
      ],
      targetMuscles: {
        primary: ['Quadriceps', 'Gluteus maximus'],
        secondary: ['Hamstringy', 'Core (stabilizace)'],
      },
      breathing: 'NADECH pri sestupu, VYDECH pri vystupu.',
      tempo: '2-1-2',
      warmup: '1\u00d78 na kazdou nohu bez zavazi.',
      tips: [
        'Skvely cvik na opravu asymetrii.',
        'Zacni bez zavazi, pak pridavej.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Stuj vzprimene', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Descending', nameCs: 'Klesani', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 145 }], feedback_wrong: 'Trup rovne, klesej', feedback_correct: 'Dobry sestup', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_knee', angle_min: 75, angle_max: 100 }], feedback_wrong: 'Koleno do 90\u00b0', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Ascending', nameCs: 'Stoupani', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Tlac z paty', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Legs Hams/Glutes (4)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Romanian Deadlift', nameCs: 'Rumunsky mrtvy tah',
    description: 'Hip hinge exercise emphasizing hamstrings and glutes.',
    descriptionCs: 'Mrtvy tah s durazemm na hamstringy a hyzdE — hip hinge.',
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Stuj zprimma, cinka v rukou pred stehny.',
        'Mirne pokrc kolena a zafixuj uhel.',
        'Predklanj se v kyccich — cinka jde podl nohou.',
        'Ucitis natazeni v hamstringach.',
        'Zastav, kdyz cinka je pod koleny.',
        'Vrat se nahoru — tlac boky dopredu.',
      ],
      commonMistakes: [
        'Zaoblena zada — NEUTRALNI pater!',
        'Prilis pokrcena kolena — to je klasicky mrtvy tah.',
        'Cinka daleko od tela.',
      ],
      targetMuscles: {
        primary: ['Hamstringy', 'Gluteus maximus'],
        secondary: ['Vzprimovace patere', 'Core'],
      },
      breathing: 'NADECH pri predklonu, VYDECH pri vystupu.',
      tempo: '2-1-1 (2s dolu, 1s natazeni, 1s nahoru)',
      warmup: '2\u00d710 s lehkou vahou.',
      tips: [
        'Predstav si, ze tlacis boky dozadu.',
        'Cinka jde dolu podl stehen — ne od tela.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_knee', angle_min: 150, angle_max: 175 }], feedback_wrong: 'Stuj zprimma', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Hinging', nameCs: 'Predklon', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 140 }, { joint: 'left_knee', angle_min: 140, angle_max: 170 }], feedback_wrong: 'Boky dozadu, zada rovna', feedback_correct: 'Dobry predklon', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Stretched', nameCs: 'Natazeni', rules: [{ joint: 'left_hip', angle_min: 50, angle_max: 90 }], feedback_wrong: 'Citis hamstringy?', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rising', nameCs: 'Vystup', rules: [{ joint: 'left_hip', angle_min: 90, angle_max: 155 }], feedback_wrong: 'Boky dopredu', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Leg Curl', nameCs: 'Zakopavani',
    description: 'Machine isolation exercise for hamstrings.',
    descriptionCs: 'Izolace hamstringu na stroji — zakopavani.',
    muscleGroups: ['HAMSTRINGS'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Lehni si na bricho do stroje.',
        'Polster na zadni casti holeni (nad achilovkou).',
        'Ohni kolena — tahni paty k hyzdim.',
        'Stiskni hamstringy nahore.',
        'Pomalu spust zpet.',
      ],
      commonMistakes: [
        'Zvedani hyzdi z lavice.',
        'Prudke pohyby.',
        'Neuplny rozsah pohybu.',
      ],
      targetMuscles: {
        primary: ['Hamstringy'],
        secondary: ['Lytkove svaly'],
      },
      breathing: 'VYDECH pri ohybu, NADECH pri propnuti.',
      tempo: '1-1-2',
      warmup: '1\u00d715 s lehkou vahou.',
      tips: [
        'Drz stisk nahore pro maximalni kontrakci.',
        'Pomala negativni faze je klicova.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Extended', nameCs: 'Propnuti', rules: [{ joint: 'left_knee', angle_min: 155, angle_max: 180 }], feedback_wrong: 'Propni nohy', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Curling', nameCs: 'Ohyb', rules: [{ joint: 'left_knee', angle_min: 60, angle_max: 120 }], feedback_wrong: 'Tahni paty k hyzdim', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_knee', angle_min: 30, angle_max: 65 }], feedback_wrong: 'Stiskni hamstringy', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_knee', angle_min: 90, angle_max: 160 }], feedback_wrong: 'Pomalu zpet', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Hip Thrust', nameCs: 'Hip thrust',
    description: 'Barbell hip extension for glute development.',
    descriptionCs: 'Tlak boky nahoru s cinkou — hlavni cvik na hyzdE.',
    muscleGroups: ['GLUTES', 'HAMSTRINGS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Sedni si na zem, lopatky na lavicce.',
        'Cinka na kyccich (pouzij podlozku).',
        'Nohy na zemi, kolena v 90\u00b0.',
        'Tlac boky nahoru — stiskni hyzdE.',
        'Nahore: telo tvori rovnou linii od ramen ke kolenum.',
        'Pomalu spust boky dolu.',
      ],
      commonMistakes: [
        'Hyperextenze v bedrech — neutralni pater.',
        'Prilis daleke nohy — kolena v 90\u00b0 nahore.',
        'Nedostatecny stisk hyzdi nahore.',
      ],
      targetMuscles: {
        primary: ['Gluteus maximus'],
        secondary: ['Hamstringy', 'Core'],
      },
      breathing: 'VYDECH nahoru, NADECH dolu.',
      tempo: '1-2-2 (1s nahoru, 2s stisk, 2s dolu)',
      warmup: '1\u00d715 bez cinky.',
      tips: [
        'Brada k hrudi pomaha zabranit hyperextenzi.',
        'Tlac z pat, ne ze spicek.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_hip', angle_min: 60, angle_max: 100 }], feedback_wrong: 'Boky dolu, lopatky na lavicce', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Thrusting', nameCs: 'Tlak', rules: [{ joint: 'left_hip', angle_min: 120, angle_max: 170 }], feedback_wrong: 'Tlac boky nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_knee', angle_min: 80, angle_max: 100 }], feedback_wrong: 'Stiskni hyzdE!', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 150 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Sumo Deadlift', nameCs: 'Sumo mrtvy tah',
    description: 'Wide-stance deadlift emphasizing glutes and inner thighs.',
    descriptionCs: 'Mrtvy tah v sirokem postoji — hyzdE a vnitrni stehna.',
    muscleGroups: ['GLUTES', 'HAMSTRINGS', 'QUADRICEPS', 'BACK'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Siroky postoj (1.5-2x sirka ramen), spicky ven.',
        'Uchop cinku uzkym uchopem mezi nohama.',
        'Hrudnik nahoru, zada rovna.',
        'Tlac nohama do stran a do zeme.',
        'Propni boky a kolena zaroven.',
        'Nahore stuj zprimma.',
      ],
      commonMistakes: [
        'Kolena padaji dovnitr — tlac je ven.',
        'Zaoblena zada.',
        'Zvedani cinky rukama misto nohama.',
      ],
      targetMuscles: {
        primary: ['Gluteus maximus', 'Adduktory'],
        secondary: ['Hamstringy', 'Quadriceps', 'Vzprimovace patere'],
      },
      breathing: 'NADECH dole, VYDECH nahore.',
      tempo: '1-0-2',
      warmup: '2\u00d78 s lehkou vahou.',
      tips: [
        'Siroke postoje vyzaduji mobilitu kyccich.',
        'Zacni s konvencnim mrtvym tahem nez zvladnes sumo.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj zprimma', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 140 }, { joint: 'left_knee', angle_min: 100, angle_max: 150 }], feedback_wrong: 'Kolena ven, hrudnik nahoru', feedback_correct: 'Dolu!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_hip', angle_min: 50, angle_max: 90 }, { joint: 'left_knee', angle_min: 70, angle_max: 110 }], feedback_wrong: 'Zada rovna, prsa nahoru', feedback_correct: 'Dobra pozice!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pulling', nameCs: 'Tah', rules: [{ joint: 'left_hip', angle_min: 90, angle_max: 155 }], feedback_wrong: 'Tlac nohama, boky dopredu', feedback_correct: 'Tahni!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Calves (2)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Standing Calf Raise', nameCs: 'Stojici vytahy na lytka',
    description: 'Machine exercise for gastrocnemius (calf muscle).',
    descriptionCs: 'Vytahy na lytka ve stoji na stroji.',
    muscleGroups: ['CALVES'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Postav se na stroj, ramena pod opery.',
        'Spicky na hrane podlozky, paty ve vzduchu.',
        'Zvedni se na spicky — maximalni kontrakce lytek.',
        'Drz 1-2s nahore.',
        'Pomalu klesni — paty pod uroven podlozky (natazeni).',
      ],
      commonMistakes: [
        'Neuplny rozsah — paty musi jit dolu pod podlozku.',
        'Prilis rychly pohyb — pomalu a kontrolovane.',
        'Pokrcena kolena — nohy temer propnute.',
      ],
      targetMuscles: {
        primary: ['Gastrocnemius'],
        secondary: ['Soleus'],
      },
      breathing: 'VYDECH nahoru, NADECH dolu.',
      tempo: '1-2-2 (1s nahoru, 2s stisk, 2s dolu)',
      warmup: '1\u00d720 bez zavazi.',
      tips: [
        'Plny rozsah pohybu je klicovy — jdi vysoko i nisko.',
        'Zkus ruzne pozice spicek (rovne, ven, dovnitr).',
      ],
    },
    phases: [
      { phase: 'START', name: 'Heels Down', nameCs: 'Paty dolu', rules: [{ joint: 'left_ankle', angle_min: 70, angle_max: 100 }, { joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Paty dolu pod podlozku', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rising', nameCs: 'Zvedani', rules: [{ joint: 'left_ankle', angle_min: 110, angle_max: 140 }], feedback_wrong: 'Zvedej se na spicky', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_ankle', angle_min: 130, angle_max: 155 }], feedback_wrong: 'Stiskni lytka nahore', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_ankle', angle_min: 80, angle_max: 125 }], feedback_wrong: 'Pomalu dolu, ucit natazeni', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Seated Calf Raise', nameCs: 'Sedici vytahy na lytka',
    description: 'Seated machine exercise targeting soleus muscle.',
    descriptionCs: 'Vytahy na lytka vsede — soleus.',
    muscleGroups: ['CALVES'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Sedni si do stroje, kolena pod operou.',
        'Spicky na hrane podlozky.',
        'Zvedni paty nahoru — stiskni lytka.',
        'Drz 1-2s nahore.',
        'Pomalu spust paty dolu (natazeni).',
      ],
      commonMistakes: [
        'Prilis rychle odrazeni.',
        'Neuplny rozsah dolu.',
        'Odrazeni ze spicek.',
      ],
      targetMuscles: {
        primary: ['Soleus'],
        secondary: ['Gastrocnemius'],
      },
      breathing: 'VYDECH nahoru, NADECH dolu.',
      tempo: '1-2-2',
      warmup: '1\u00d720 bez zavazi.',
      tips: [
        'Sedici pozice cilidne izoluje soleus.',
        'Vyssi pocet opakovani (15-25) funguje lepe na lytka.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Heels Down', nameCs: 'Paty dolu', rules: [{ joint: 'left_ankle', angle_min: 70, angle_max: 100 }], feedback_wrong: 'Paty dolu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rising', nameCs: 'Zvedani', rules: [{ joint: 'left_ankle', angle_min: 110, angle_max: 140 }], feedback_wrong: 'Zvedej paty', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_ankle', angle_min: 130, angle_max: 155 }], feedback_wrong: 'Stiskni lytka', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_ankle', angle_min: 80, angle_max: 125 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Core (5)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Hanging Leg Raise', nameCs: 'Zdvihy nohou ve visu',
    description: 'Advanced core exercise hanging from a pull-up bar.',
    descriptionCs: 'Zdvihy nohou ve visu na hrazde — spodni brisni svaly.',
    muscleGroups: ['CORE'],
    difficulty: 'ADVANCED' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Chyt se hrazdy nadhmatem, vis volne.',
        'Zpevni core, nestoupej telem.',
        'Zvedni propnute nohy pred sebe.',
        'Zvedej do 90\u00b0 (nebo vyse pro pokrocile).',
        'Drz 1s nahore.',
        'Pomalu spust zpet.',
      ],
      commonMistakes: [
        'Kyvani telem — vis musí byt klidny.',
        'Pokrcene nohy — propni kolena.',
        'Prilis rychle spousteni.',
      ],
      targetMuscles: {
        primary: ['Spodni rectus abdominis', 'Hip flexors'],
        secondary: ['Predlokti (uchop)', 'Serni svaly'],
      },
      breathing: 'VYDECH pri zvedani, NADECH pri spousteni.',
      tempo: '2-1-2',
      warmup: 'Kolena k hrudi 1\u00d710 jako lehci varianta.',
      tips: [
        'Zacni s pokrcenymi koleny, pak propni.',
        'Nesoupej telem — ciste zvedani nohou.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Hanging', nameCs: 'Vis', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Vis klidne, nohy dolu', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Raising', nameCs: 'Zvedani', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Zvedej nohy', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_hip', angle_min: 60, angle_max: 100 }], feedback_wrong: 'Drz nohy nahore', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_hip', angle_min: 110, angle_max: 170 }], feedback_wrong: 'Pomalu dolu, kontroluj', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Russian Twist', nameCs: 'Rusky twist',
    description: 'Seated rotational core exercise for obliques.',
    descriptionCs: 'Rotacni cvik na sikme brisni svaly vsede.',
    muscleGroups: ['CORE'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Sedni si na zem, kolena pokrcena, nohy na zemi (nebo ve vzduchu).',
        'Zaklon se na 45\u00b0, zpevni core.',
        'Ruce spojene pred hrudnikem (nebo s zavodim).',
        'Rotuj trup doleva — dotkni se rukama podlahy.',
        'Rotuj doprava.',
        'Stridej strany.',
      ],
      commonMistakes: [
        'Pohyb jen v rukach — rotuj trupem.',
        'Zaoblena zada — hrudnik ven.',
        'Prilis rychly pohyb.',
      ],
      targetMuscles: {
        primary: ['Obliques (sikme brisni)'],
        secondary: ['Rectus abdominis', 'Hip flexors'],
      },
      breathing: 'Vydech pri kazde rotaci.',
      tempo: 'Kontrolovane tempo, 15-20 opakovani na stranu.',
      warmup: 'Zadny.',
      tips: [
        'Pro vetsi vyzvu zdvihni nohy ze zeme.',
        'Drzeni medicimbalu nebo jednorucky zvysuje narocnost.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Center', nameCs: 'Stred', rules: [{ joint: 'left_hip', angle_min: 100, angle_max: 140 }], feedback_wrong: 'Zaklon na 45\u00b0, zpevni core', feedback_correct: 'Pripraven', minDurationMs: 200 },
    ],
  },
  {
    name: 'Ab Wheel Rollout', nameCs: 'Valec na bricho',
    description: 'Advanced anti-extension core exercise with ab wheel.',
    descriptionCs: 'Pokrocily cvik na core s kolikem na bricho.',
    muscleGroups: ['CORE', 'SHOULDERS'],
    difficulty: 'ADVANCED' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Klek na kolena, ruce na koliku.',
        'Zpevni core a hyzdE.',
        'Pomalu se vali dopredu — ruce jdou pred tebe.',
        'Jdi tak daleko, jak udrzis rovnAA zada.',
        'Stahni se zpet do vychozi pozice.',
      ],
      commonMistakes: [
        'Propadla zada — KRITICKE, zastavovac driv.',
        'Pohyb z kycli misto z core.',
        'Prilis daleko na zacatku.',
      ],
      targetMuscles: {
        primary: ['Rectus abdominis', 'Transverzus abdominis'],
        secondary: ['Latissimus dorsi', 'Predni deltoid'],
      },
      breathing: 'NADECH pri vyjeti, VYDECH pri navraceni.',
      tempo: '3-0-2 (3s dopredu, 0 pauza, 2s zpet)',
      warmup: 'Plank 30s.',
      tips: [
        'Zacni s kratky rozsahem a postupne prodluzuj.',
        'Hyzdé zpevnene zabranuji hyperextenzi.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Kneeling', nameCs: 'Klek', rules: [{ joint: 'left_hip', angle_min: 100, angle_max: 140 }, { joint: 'left_shoulder', angle_min: 70, angle_max: 110 }], feedback_wrong: 'Klek, ruce na koliku', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Rolling Out', nameCs: 'Vyjeti', rules: [{ joint: 'left_hip', angle_min: 150, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 140, angle_max: 180 }], feedback_wrong: 'Zpevni core, zada rovna!', feedback_correct: 'Dobry rozsah', minDurationMs: 300 },
      { phase: 'HOLD', name: 'Extended', nameCs: 'Natazeni', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Drz — nezapadni zady!', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rolling Back', nameCs: 'Navrat', rules: [{ joint: 'left_hip', angle_min: 110, angle_max: 160 }], feedback_wrong: 'Stahni se zpet', feedback_correct: 'Zpet!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Cable Woodchop', nameCs: 'Drevorubec na kladce',
    description: 'Rotational core exercise on cable machine.',
    descriptionCs: 'Rotacni cvik na core na kladce — sikme brisni svaly.',
    muscleGroups: ['CORE'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Stuj bokem ke kladce, madlo nahore.',
        'Uchop madlo obema rukama.',
        'Rotuj trup a tahni madlo sikmo dolu na druhou stranu.',
        'Pohyb jde z kycli a trupu, ne z ramen.',
        'Kontrolovane vrat zpet.',
      ],
      commonMistakes: [
        'Pohyb jen v rukach — rotuj trupem.',
        'Pohyb z ramen — sila z kycli.',
        'Nedostatecna rotace.',
      ],
      targetMuscles: {
        primary: ['Obliques', 'Transverzus abdominis'],
        secondary: ['Ramena', 'Core'],
      },
      breathing: 'VYDECH pri rotaci, NADECH pri vraceni.',
      tempo: '1-0-2',
      warmup: '1\u00d710 na kazdou stranu s lehkou vahou.',
      tips: [
        'Rotace z kycli — ne z ramen.',
        'Sleduj rukama madlo ocima pro udrzeni pozice.',
      ],
    },
    phases: [
      { phase: 'START', name: 'High Position', nameCs: 'Horni pozice', rules: [{ joint: 'left_shoulder', angle_min: 120, angle_max: 170 }], feedback_wrong: 'Madlo nahore, natocen bokem', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Chopping', nameCs: 'Sekani', rules: [{ joint: 'left_shoulder', angle_min: 30, angle_max: 90 }], feedback_wrong: 'Rotuj trupem dolu', feedback_correct: 'Sekej!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_shoulder', angle_min: 10, angle_max: 40 }], feedback_wrong: 'Drz dole', feedback_correct: 'Drz!', minDurationMs: 150 },
      { phase: 'ECCENTRIC', name: 'Returning', nameCs: 'Navrat', rules: [{ joint: 'left_shoulder', angle_min: 60, angle_max: 140 }], feedback_wrong: 'Kontrolovane zpet', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Dead Bug', nameCs: 'Mrtvy brouk',
    description: 'Supine anti-extension core exercise for deep stabilizers.',
    descriptionCs: 'Cvik na hluboky core vleze na zadech — anti-extenze.',
    muscleGroups: ['CORE'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Lehni si na zada, ruce propnute ke stropu.',
        'Kolena pokrcena do 90\u00b0 nad boky.',
        'Bedra pritlacena k podlozce (plocha zada!).',
        'Pomalu spust protilehlou ruku a nohu smerem k zemi.',
        'Vrat zpet, opakuj na druhou stranu.',
      ],
      commonMistakes: [
        'Bedra se odlepi od podlozky — KLICOVE!',
        'Prilis rychly pohyb.',
        'Zadrzovani dechu.',
      ],
      targetMuscles: {
        primary: ['Transverzus abdominis', 'Rectus abdominis'],
        secondary: ['Hip flexors', 'Quadriceps'],
      },
      breathing: 'VYDECH pri spousteni koncetin, NADECH pri navraceni.',
      tempo: '2-0-2 (2s dolu, 0 pauza, 2s zpet)',
      warmup: 'Zadny.',
      tips: [
        'Bedra MUSI zustat pritlacena — to je cely smysl cviku.',
        'Zacni jen s nohama, pak pridej ruce.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Starting Position', nameCs: 'Zakladni pozice', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 100 }], feedback_wrong: 'Leh na zadech, kolena 90\u00b0', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_hip', angle_min: 130, angle_max: 175 }], feedback_wrong: 'Spoustej nohu a ruku, bedra dole!', feedback_correct: 'Dolu!', minDurationMs: 300 },
      { phase: 'HOLD', name: 'Extended', nameCs: 'Natazeni', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Drz, bedra pritlacena', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Returning', nameCs: 'Navrat', rules: [{ joint: 'left_hip', angle_min: 90, angle_max: 150 }], feedback_wrong: 'Vrat se kontrolovane', feedback_correct: 'Zpet!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Compound (4)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Clean and Press', nameCs: 'Pritah a tlak',
    description: 'Full body explosive compound lift from floor to overhead.',
    descriptionCs: 'Komplexni explozivni cvik — z podlahy nad hlavu.',
    muscleGroups: ['FULL_BODY'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Cinka na zemi, nohy na sirku boku.',
        'Uchop cinku nadhmatem, zada rovna.',
        'Explozivne tahni cinku nahoru podl tela.',
        'Podtocsi pod cinku — chytni ji na predni deltoidy.',
        'Zpevni core a tlac cinku nad hlavu.',
        'Propni ruce nahore.',
        'Kontrolovane vrat zpet na ramena, pak na zem.',
      ],
      commonMistakes: [
        'Zaoblena zada pri tahu ze zeme.',
        'Tahani rukama misto nohama.',
        'Preskoceni faze podtoceni.',
      ],
      targetMuscles: {
        primary: ['Quadriceps', 'Gluteus maximus', 'Deltoidy', 'Trapezy'],
        secondary: ['Hamstringy', 'Triceps', 'Core', 'Predlokti'],
      },
      breathing: 'NADECH dole, VYDECH pri tlaku nad hlavu.',
      tempo: 'Explozivni tah, kontrolovany tlak.',
      warmup: '2\u00d75 s prazdnou cinkou.',
      tips: [
        'Naucte se kazdy pohyb zvlast nez je spojite.',
        'Sila jde z nohou, ne z ramen.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Floor', nameCs: 'Podlaha', rules: [{ joint: 'left_hip', angle_min: 50, angle_max: 100 }, { joint: 'left_knee', angle_min: 70, angle_max: 110 }], feedback_wrong: 'Uchop cinku, zada rovna', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'CONCENTRIC', name: 'Clean', nameCs: 'Pritah', rules: [{ joint: 'left_hip', angle_min: 140, angle_max: 180 }], feedback_wrong: 'Explozivne nahoru', feedback_correct: 'Tahni!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Rack', nameCs: 'U ramen', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 90 }], feedback_wrong: 'Cinka na ramenech', feedback_correct: 'Pripravit na tlak!', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Press Up', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni nad hlavu', feedback_correct: 'Zamknuto!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Farmers Walk', nameCs: 'Farmaruv pochod',
    description: 'Loaded carry exercise for grip, core, and full body stability.',
    descriptionCs: 'Noseni tezkeho zavazi — grip, core, celotElova stabilita.',
    muscleGroups: ['CORE', 'SHOULDERS', 'BACK'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Zdvihni tezke jednorucky/kettlebelly z podlahy (jako mrtvY tah).',
        'Stuj zprimma, ramena dozadu a dolu.',
        'Kratke, rychle kroky dopredu.',
        'Core zpevneny, nedejej se.',
        'Chod stanovenou vzdalenost (20-40m).',
        'Poloz zavazi kontrolovane dolu.',
      ],
      commonMistakes: [
        'Predklon — stuj zprimma.',
        'Prilis dlouhe kroky.',
        'Povoleny core — telo se houPE.',
      ],
      targetMuscles: {
        primary: ['Predlokti (grip)', 'Trapezy', 'Core'],
        secondary: ['Deltoidy', 'Quadriceps', 'Gluteus maximus'],
      },
      breathing: 'Pravidelne dychej, nezadrzuj dech.',
      tempo: 'Rychle kratke kroky, 20-40m na set.',
      warmup: 'Zadny — zarad po hlavnich cvicech.',
      tips: [
        'Skvele pro grip strength a celkovou kondici.',
        'Ramena dozadu a dolu — neupad do predklonu.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Standing Loaded', nameCs: 'Stoj se zavazim', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj zprimma, ramena dozadu', feedback_correct: 'Vyjdi!', minDurationMs: 500 },
    ],
  },
  {
    name: 'Turkish Get-Up', nameCs: 'Turecky vstavan',
    description: 'Complex full body stability exercise from floor to standing.',
    descriptionCs: 'Komplexni cvik stability — z lehu do stoje se zavazim nad hlavou.',
    muscleGroups: ['FULL_BODY'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Lehni si na zada, kettlebell v prave ruce nad hrudnikem.',
        'Propni pravou ruku — zamkni nad sebou.',
        'Pokrc pravou nohu.',
        'Zvedni se na levy loket, pak na levou ruku.',
        'Zvedni boky do mostu.',
        'Protahni levou nohu dozadu pod sebe — klek.',
        'Vstan do stoje.',
        'Vrat se stejnou cestou zpet.',
      ],
      commonMistakes: [
        'Ztrata zamceni ruky — ruka propnuta po celou dobu.',
        'Preskoceni kroku — kazdy krok je dulezity.',
        'Ztrata kontroly nad zavazim.',
      ],
      targetMuscles: {
        primary: ['Core', 'Deltoidy', 'Gluteus maximus'],
        secondary: ['Trapezy', 'Quadriceps', 'Hamstringy'],
      },
      breathing: 'Dychej plynule pri kazdem kroku.',
      tempo: 'Pomalu — kazdy krok je kontrolovany.',
      warmup: '1\u00d72 na kazdou stranu bez zavazi.',
      tips: [
        'Zacni bez zavazi — naucn se pohyb.',
        'Sleduj zavazi pohledem po celou dobu.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Lying', nameCs: 'Leh', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Lehni si, zavazi nad sebou', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'CONCENTRIC', name: 'Rising', nameCs: 'Vstavani', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 150 }], feedback_wrong: 'Krok po kroku nahoru', feedback_correct: 'Pokracuj!', minDurationMs: 500 },
      { phase: 'HOLD', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj zprimma, ruka zamcena', feedback_correct: 'Nahore!', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Descending', nameCs: 'Klesani', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 150 }], feedback_wrong: 'Pomalu zpet dolu', feedback_correct: 'Kontrola!', minDurationMs: 500 },
    ],
  },
  {
    name: 'Thruster', nameCs: 'Thruster',
    description: 'Front squat into overhead press — full body power exercise.',
    descriptionCs: 'Predni drep priamo do tlaku nad hlavu — celotElovy silovy cvik.',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'SHOULDERS', 'TRICEPS'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Cinka na prednich deltoidech (front rack pozice).',
        'Prove drep — stehna paralelne nebo nize.',
        'Z dolni pozice explozivne vstaN.',
        'Vyuzij momentum k tlaku cinky nad hlavu.',
        'Propni ruce nahore.',
        'Spust cinku zpet na ramena a ihned dalsi rep.',
      ],
      commonMistakes: [
        'Oddeleny drep a tlak — musi byt plynuly.',
        'Padajici lokty v drepu.',
        'Nezasazeni exploze z nohou.',
      ],
      targetMuscles: {
        primary: ['Quadriceps', 'Gluteus maximus', 'Deltoidy'],
        secondary: ['Triceps', 'Core', 'Hamstringy'],
      },
      breathing: 'NADECH pri sestupu, VYDECH pri tlaku nahoru.',
      tempo: 'Plynuly — drep prichazi do tlaku bez pauzy.',
      warmup: '2\u00d75 s prazdnou cinkou.',
      tips: [
        'Sila jde z nohou — ne z ramen.',
        'Skvely cvik pro CrossFit a HIIT.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Rack', nameCs: 'U ramen', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 90 }, { joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Cinka na ramenech, stuj', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Squatting', nameCs: 'Drep', rules: [{ joint: 'left_knee', angle_min: 70, angle_max: 110 }, { joint: 'left_hip', angle_min: 60, angle_max: 110 }], feedback_wrong: 'Drep hloubeji, lokty nahoru', feedback_correct: 'Dolu!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Drive', nameCs: 'Odraz', rules: [{ joint: 'left_knee', angle_min: 140, angle_max: 180 }], feedback_wrong: 'Explozivne nahoru z nohou', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Lockout', nameCs: 'Zamceni', rules: [{ joint: 'left_elbow', angle_min: 155, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni nad hlavu', feedback_correct: 'Zamknuto!', minDurationMs: 200 },
    ],
  },

  // ────────────────────────────────────────────────────────────
  // NEW — Stretching (4)
  // ────────────────────────────────────────────────────────────
  {
    name: 'Hip Flexor Stretch', nameCs: 'Protazeni bedernich ohybacu',
    description: 'Static stretch for hip flexors and psoas.',
    descriptionCs: 'Staticke protazeni bedernich ohybacu (hip flexors).',
    muscleGroups: ['QUADRICEPS', 'CORE'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Klek na jedno koleno (vypada pozice).',
        'Predni noha v 90\u00b0 pred tebou.',
        'Tlac boky mirne dopredu.',
        'Ucitis natazeni v predni casti kyccle zadni nohy.',
        'Drz 30-60s, pak vymen stranu.',
      ],
      commonMistakes: [
        'Prilis velky predklon — trup vzprimeny.',
        'Prilis agresivni tlak — jemne, postupne.',
        'Zadrzovani dechu.',
      ],
      targetMuscles: {
        primary: ['Iliopsoas (bederni ohybac)'],
        secondary: ['Rectus femoris', 'Core'],
      },
      breathing: 'Pomale hluboKE dechy. Vydech = hloubeni protazeni.',
      tempo: 'Vydrz 30-60s na kazdou stranu.',
      warmup: 'Zadny — pouzij jako soucas cool-down.',
      tips: [
        'Idealni po treninku nohou.',
        'Zpevni hyzdE zadni nohy pro hlubsi protazeni.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Lunge Hold', nameCs: 'Vypad', rules: [{ joint: 'left_knee', angle_min: 80, angle_max: 100 }, { joint: 'left_hip', angle_min: 100, angle_max: 150 }], feedback_wrong: 'Klek, boky dopredu', feedback_correct: 'Drz a dychej', minDurationMs: 5000 },
    ],
  },
  {
    name: 'Cat-Cow', nameCs: 'Kocka-krava',
    description: 'Spinal mobility exercise alternating flexion and extension.',
    descriptionCs: 'Mobilita patere — stridani zaobleni a prohnuti.',
    muscleGroups: ['CORE', 'BACK'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Na vsech ctyrech — ruce pod rameny, kolena pod boky.',
        'KOCKA: Zaobli zada nahoru, brada k hrudi.',
        'KRAVA: Prohni zada dolu, hlavu nahoru.',
        'Stridej poMALU a plynule.',
        'Opakuj 10-15x.',
      ],
      commonMistakes: [
        'Prilis rychly pohyb — pomalu a vedome.',
        'Pohyb jen v bedrech — cela pater.',
        'Zadrzovani dechu.',
      ],
      targetMuscles: {
        primary: ['Vzprimovace patere', 'Rectus abdominis'],
        secondary: ['Core', 'Ramena'],
      },
      breathing: 'NADECH pri prohnuti (krava), VYDECH pri zaobleni (kocka).',
      tempo: 'Pomalu, 3-4s na kazdy pohyb.',
      warmup: 'Zadny — toto je zahrivaci cvik.',
      tips: [
        'Idealni na zacatku treninku pro mobilitu patere.',
        'Soustred se na kazdy obratel.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Tabletop', nameCs: 'Na ctyrech', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 100 }, { joint: 'left_shoulder', angle_min: 80, angle_max: 100 }], feedback_wrong: 'Na vsech ctyrech, neutralni pater', feedback_correct: 'Dychej a pohybuj se', minDurationMs: 2000 },
    ],
  },
  {
    name: 'Worlds Greatest Stretch', nameCs: 'Nejlepsi protazeni na svete',
    description: 'Dynamic full-body mobility stretch combining multiple movements.',
    descriptionCs: 'Dynamicky celotElovy stretch — kombinace vice pohybu.',
    muscleGroups: ['FULL_BODY'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Vykroc do vypadu dopredu.',
        'Poloz ruku stejne strany na zem uvnitr nohy.',
        'Druhou rukou se natahni ke stropu — rotace trupu.',
        'Drz 2-3s, pak poloz ruku zpet.',
        'Propni predni nohu — natazeni hamstringu.',
        'Vrat se do stoje. Opakuj na druhou stranu.',
      ],
      commonMistakes: [
        'Preskoceni kroku — kazda cast je dulezita.',
        'Nedostatecna rotace trupu.',
        'Prilis rychly pohyb.',
      ],
      targetMuscles: {
        primary: ['Hip flexors', 'Hamstringy', 'Hrudni pater (rotace)'],
        secondary: ['Adduktory', 'Lytka', 'Ramena'],
      },
      breathing: 'Plynule dychej, vydech pri hlubeni pozice.',
      tempo: 'Pomalu, 3-5s na kazdou pozici.',
      warmup: 'Zadny — toto JE warmup.',
      tips: [
        'Idealni pred kazdym treninkem.',
        'Otevre kyccle, hrudni pater i ramena.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Lunge', nameCs: 'Vypad', rules: [{ joint: 'left_knee', angle_min: 80, angle_max: 100 }, { joint: 'left_hip', angle_min: 80, angle_max: 120 }], feedback_wrong: 'Vypad dopredu, ruka na zem', feedback_correct: 'Rotuj a dychej', minDurationMs: 3000 },
    ],
  },
  {
    name: 'Foam Roll IT Band', nameCs: 'Valeni IT pasu',
    description: 'Self-myofascial release for iliotibial band with foam roller.',
    descriptionCs: 'Uvolneni IT pasu (vnejsi stehno) penovym valcem.',
    muscleGroups: ['QUADRICEPS', 'GLUTES'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Lehni si na bok, penovy valec pod vnejsim stehnem.',
        'Horni noha pred telem na zemi pro stabilitu.',
        'Pomalu se val od kolene k boku.',
        'Na bolestivych mistech zastav na 20-30s.',
        'Opakuj na druhe strane.',
      ],
      commonMistakes: [
        'Prilis rychle valeni.',
        'Valeni primo po kosti.',
        'Zadrzovani dechu pri bolesti.',
      ],
      targetMuscles: {
        primary: ['IT band (iliotibialny pas)'],
        secondary: ['Vastus lateralis', 'Gluteus medius'],
      },
      breathing: 'Hluboce a pravidelne — pomaha uvolnit svaly.',
      tempo: 'Pomalu, 1-2 minuty na stranu.',
      warmup: 'Zadny — pouzij po treninku.',
      tips: [
        'Bolest je normalni — postupne se zmirni.',
        'Nevalej primo na koleni nebo na kosti kyccle.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Rolling', nameCs: 'Valeni', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Bok na valci, pomale valeni', feedback_correct: 'Vydrzej a dychej', minDurationMs: 5000 },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// Bodyweight exercises (6 existing + 6 new = 12)
// ────────────────────────────────────────────────────────────
export const bodyweightExercises = [
  // EXISTING 6 (preserved exactly)
  {
    name: 'Push-up', nameCs: 'Klik',
    description: 'Bodyweight push exercise targeting chest, shoulders, and triceps.',
    descriptionCs: 'Klik — prsa, ramena, tricepsy. Bez vybaveni.',
    muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS', 'CORE'],
    difficulty: 'BEGINNER' as const,
    category: 'compound',
    instructions: {
      steps: ['Lehni si na bricho, ruce pod rameny.', 'Zatlac se do plank pozice — telo rovna linie.', 'Pomalu spoustej hrudnik k zemi (lokty 45\u00b0).', 'Tlac zpet nahoru.'],
      commonMistakes: ['Propadle boky.', 'Lokty 90\u00b0 od tela.', 'Neuplny rozsah.'],
      targetMuscles: { primary: ['Pectoralis major'], secondary: ['Triceps', 'Predni deltoid', 'Core'] },
      breathing: 'NADECH dolu, VYDECH nahoru.',
      tempo: '2-1-1',
      warmup: '1\u00d710 lehkych kliku na kolenou.',
      tips: ['Pro snazsi variantu klek na kolena.', 'Drz core zpevneny.'],
    },
    phases: [
      { phase: 'START', name: 'Plank', nameCs: 'Plank', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 70, angle_max: 140 }], feedback_wrong: 'Kontroluj sestup', feedback_correct: 'Dolu', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Tlac', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Bodyweight Squat', nameCs: 'Drep bez vahy',
    description: 'Bodyweight squat for legs and glutes.',
    descriptionCs: 'Drep bez vybaveni — nohy, hyzdE, core.',
    muscleGroups: ['QUADRICEPS', 'GLUTES'],
    difficulty: 'BEGINNER' as const,
    category: 'compound',
    instructions: {
      steps: ['Stoj na sirku ramen.', 'Klesni dolu — kycle dozadu, kolena ven.', 'Stehna paralelne se zemi.', 'Tlac z pat zpet nahoru.'],
      commonMistakes: ['Kolena dovnitr.', 'Melka hloubka.', 'Zada zaoblena.'],
      targetMuscles: { primary: ['Quadriceps', 'Gluteus maximus'], secondary: ['Core', 'Hamstringy'] },
      breathing: 'NADECH dolu, VYDECH nahoru.',
      tempo: '2-1-2',
      warmup: '10 drepu s vlastni vahou.',
      tips: ['Ruce pred telem pro rovnovahu.', 'Pohled dopredu.'],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Down', nameCs: 'Dolu', rules: [{ joint: 'left_knee', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Klesej', feedback_correct: 'Dolu', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Up', nameCs: 'Nahoru', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Tlac', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Glute Bridge', nameCs: 'Glute bridge',
    description: 'Hip thrust on the ground for glutes.',
    descriptionCs: 'Most na hyzdE — leh na zadech, zvedani panve.',
    muscleGroups: ['GLUTES', 'HAMSTRINGS', 'CORE'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: ['Lehni si na zada, kolena pokrcena.', 'Chodidla na zemi pod koleny.', 'Zvedni panev nahoru — stiskni hyzdE.', 'Drz 1s nahore, pak pomalu dolu.'],
      commonMistakes: ['Hyperextenze v zadech.', 'Neuplny rozsah.'],
      targetMuscles: { primary: ['Gluteus maximus'], secondary: ['Hamstringy', 'Core'] },
      breathing: 'VYDECH nahoru, NADECH dolu.',
      tempo: '2-1-2',
      warmup: 'Zadny.',
      tips: ['Stiskni hyzdE tak silne, jak jen umis.'],
    },
    phases: [
      { phase: 'START', name: 'Down', nameCs: 'Dolu', rules: [{ joint: 'left_hip', angle_min: 90, angle_max: 130 }], feedback_wrong: 'Lehni si', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Up', nameCs: 'Nahoru', rules: [{ joint: 'left_hip', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Stiskni hyzdE', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Mountain Climbers', nameCs: 'Horolezec',
    description: 'Cardio core exercise from plank position.',
    descriptionCs: 'Kardio cvik v plank pozici — stridani kolen k hrudi.',
    muscleGroups: ['CORE', 'SHOULDERS', 'QUADRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'accessory',
    instructions: {
      steps: ['Zacni v high plank pozici.', 'Pritahni jedno koleno k hrudi.', 'Rychle vymen nohy.', 'Pokracuj v rychlem tempu.'],
      commonMistakes: ['Zvednuty zadek.', 'Pomale tempo.'],
      targetMuscles: { primary: ['Core', 'Hip flexors'], secondary: ['Ramena', 'Quadriceps'] },
      breathing: 'Pravidelne, rychle.',
      tempo: 'Rychle tempo, 30-45s serie.',
      warmup: 'Zadny.',
      tips: ['Drz boky nizko.', 'Zacni pomalu, zrychluj.'],
    },
    phases: [
      { phase: 'START', name: 'Plank', nameCs: 'Plank', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Plank pozice', feedback_correct: 'Pripraven', minDurationMs: 200 },
    ],
  },
  {
    name: 'Burpees', nameCs: 'Burpees',
    description: 'Full body cardio explosive exercise.',
    descriptionCs: 'Plnotelovy kardio cvik — drep, plank, klik, vyskok.',
    muscleGroups: ['FULL_BODY'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: ['Stoj.', 'Drep — ruce na zem.', 'Vyhod nohy dozadu do plank.', 'Klik (volitelne).', 'Skoc nohy zpet k rukam.', 'Vyskok s rukama nad hlavou.'],
      commonMistakes: ['Propadla zada v planku.', 'Bez vyskoku.'],
      targetMuscles: { primary: ['Plne telo'], secondary: [] },
      breathing: 'Pravidelne.',
      tempo: 'Stale tempo, 30-60s serie.',
      warmup: '5 pomalych burpees.',
      tips: ['Zacni bez kliku/vyskoku jako varianta.'],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj', feedback_correct: 'Pripraven', minDurationMs: 200 },
    ],
  },
  {
    name: 'Jumping Jacks', nameCs: 'Jumping Jacks',
    description: 'Full body warm-up cardio.',
    descriptionCs: 'Klasicky rozcvicovaci kardio cvik.',
    muscleGroups: ['FULL_BODY'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: ['Stoj, ruce u boku.', 'Vyskoc — nohy do stran, ruce nad hlavu.', 'Vrat se zpet do stoje.', 'Opakuj rytmicky.'],
      commonMistakes: ['Prilis pomale tempo.'],
      targetMuscles: { primary: ['Plne telo'], secondary: [] },
      breathing: 'Pravidelne.',
      tempo: 'Rychle, 30-60s serie.',
      warmup: 'Zadny — toto je warm-up.',
      tips: ['Skvele pro zahrati na zacatku treninku.'],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj', feedback_correct: 'Pripraven', minDurationMs: 200 },
    ],
  },

  // NEW 6 bodyweight exercises
  {
    name: 'Dips', nameCs: 'Dipy',
    description: 'Bodyweight push exercise for chest and triceps on parallel bars.',
    descriptionCs: 'Kliky na bradlech — prsa a tricepsy.',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Uchop se bradel, ruce propnute, telo ve vzduchu.',
        'Mirne se predklon (vice prsa) nebo stuj vzprimene (vice triceps).',
        'Pomalu spoustej telo dolu — lokty do 90\u00b0.',
        'Tlac zpet nahoru do propnuti.',
      ],
      commonMistakes: [
        'Prilis hluboky sestup — lokty max 90\u00b0 pro zacatecniky.',
        'Ramena k usim — stahni lopatky dolu.',
        'Kyvani telem.',
      ],
      targetMuscles: {
        primary: ['Pectoralis major (spodni cast)', 'Triceps'],
        secondary: ['Predni deltoid', 'Core'],
      },
      breathing: 'NADECH dolu, VYDECH nahoru.',
      tempo: '2-1-1',
      warmup: 'Drz se nahore 10s. Negativni dipy (jen spousteni).',
      tips: [
        'Predklon = vice prsa. Vzprimeny = vice triceps.',
        'Pokud je tezke — pouzij odporovou gumu.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_elbow', angle_min: 155, angle_max: 180 }], feedback_wrong: 'Propni ruce nahore', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 70, angle_max: 130 }], feedback_wrong: 'Kontroluj sestup', feedback_correct: 'Dolu', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 95 }], feedback_wrong: 'Lokty 90\u00b0', feedback_correct: 'Dole!', minDurationMs: 150 },
      { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Tlac nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Pike Push-up', nameCs: 'Klik ve strise',
    description: 'Bodyweight shoulder press alternative in pike position.',
    descriptionCs: 'Klik ve strise — alternativa tlaku na ramena bez zavazi.',
    muscleGroups: ['SHOULDERS', 'TRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Zacni v pozici otoceneho V — boky vysoko, ruce a nohy na zemi.',
        'Hlava smeruje k zemi.',
        'Ohybej lokty — hlava klesne mezi ruce.',
        'Tlac zpet nahoru.',
      ],
      commonMistakes: [
        'Prilis nizke boky — nejedna se o klik.',
        'Lokty do stran — drz je u tela.',
        'Nedostatecny rozsah.',
      ],
      targetMuscles: {
        primary: ['Predni deltoid', 'Stredni deltoid'],
        secondary: ['Triceps', 'Horni prsni'],
      },
      breathing: 'NADECH dolu, VYDECH nahoru.',
      tempo: '2-1-1',
      warmup: '1\u00d78 klasickych kliku.',
      tips: [
        'Nohy na vyvysene podlozce zvysuji narocnost.',
        'Skvela priprava na rucni stoj kliky.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Pike', nameCs: 'Stris', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }, { joint: 'left_hip', angle_min: 60, angle_max: 100 }], feedback_wrong: 'Boky vysoko, ruce propnute', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_elbow', angle_min: 70, angle_max: 130 }], feedback_wrong: 'Hlava mezi ruce', feedback_correct: 'Dolu', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 80 }], feedback_wrong: 'Hlava temer u zeme', feedback_correct: 'Dole!', minDurationMs: 150 },
      { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Tlac nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Pistol Squat', nameCs: 'Pistolovy drep',
    description: 'Single-leg bodyweight squat requiring strength and balance.',
    descriptionCs: 'Jednonozny drep — sila, rovnovaha, mobilita.',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'CORE'],
    difficulty: 'ADVANCED' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Stuj na jedne noze, druhou propni pred sebe.',
        'Ruce pred telem pro rovnovahu.',
        'Pomalu klesej na jedne noze — druha zustava ve vzduchu.',
        'Klesni co nejhloubeji.',
        'Tlac z paty zpet nahoru.',
      ],
      commonMistakes: [
        'Koleno pada dovnitr.',
        'Ztrata rovnovahy — soustred se na fixni bod.',
        'Nedostatecna hloubka.',
      ],
      targetMuscles: {
        primary: ['Quadriceps', 'Gluteus maximus'],
        secondary: ['Core', 'Hamstringy', 'Hip flexors (zdvizena noha)'],
      },
      breathing: 'NADECH dolu, VYDECH nahoru.',
      tempo: '3-1-2',
      warmup: '1\u00d710 klasickych drepu na kazdou nohu.',
      tips: [
        'Zacni s drZEnim lavicky pro podporu.',
        'Mobilita kotniku je klicova.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stuj na jedne noze', feedback_correct: 'Pripraven', minDurationMs: 300 },
      { phase: 'ECCENTRIC', name: 'Descending', nameCs: 'Klesani', rules: [{ joint: 'left_knee', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Pomalu klesej, rovnovaha', feedback_correct: 'Dolu!', minDurationMs: 300 },
      { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_knee', angle_min: 40, angle_max: 80 }], feedback_wrong: 'Drz dole', feedback_correct: 'Drz!', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Ascending', nameCs: 'Stoupani', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Tlac z paty nahoru', feedback_correct: 'Nahoru!', minDurationMs: 300 },
    ],
  },
  {
    name: 'Superman', nameCs: 'Superman',
    description: 'Prone back extension exercise for erector spinae.',
    descriptionCs: 'Zapazeni vleze na briss — vzprimovace patere.',
    muscleGroups: ['BACK', 'GLUTES'],
    difficulty: 'BEGINNER' as const,
    category: 'accessory',
    instructions: {
      steps: [
        'Lehni si na bricho, ruce natazene pred sebe.',
        'Zaroven zdvihni ruce, hrudnik a nohy od zeme.',
        'Drz 2-3s nahore.',
        'Pomalu spust zpet.',
      ],
      commonMistakes: [
        'Trhany pohyb — plynuly zdvih.',
        'Zakloneni hlavy — pohled na zem.',
        'Prilis vysoky zdvih.',
      ],
      targetMuscles: {
        primary: ['Vzprimovace patere', 'Gluteus maximus'],
        secondary: ['Zadni deltoid', 'Hamstringy'],
      },
      breathing: 'VYDECH pri zdvihu, NADECH pri spousteni.',
      tempo: '1-2-1 (1s nahoru, 2s drz, 1s dolu)',
      warmup: 'Zadny.',
      tips: [
        'Skvely cvik pro zdravi zad a drzeni tela.',
        'Varianta: stridat protilehle ruce a nohy.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Lying', nameCs: 'Leh', rules: [{ joint: 'left_hip', angle_min: 170, angle_max: 180 }], feedback_wrong: 'Leh na brisse, ruce pred sebe', feedback_correct: 'Pripraven', minDurationMs: 200 },
      { phase: 'CONCENTRIC', name: 'Rising', nameCs: 'Zdvih', rules: [{ joint: 'left_hip', angle_min: 155, angle_max: 175 }], feedback_wrong: 'Zdvihni ruce i nohy', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      { phase: 'HOLD', name: 'Top', nameCs: 'Nahore', rules: [{ joint: 'left_hip', angle_min: 155, angle_max: 175 }], feedback_wrong: 'Drz nahore', feedback_correct: 'Drz!', minDurationMs: 500 },
      { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spousteni', rules: [{ joint: 'left_hip', angle_min: 170, angle_max: 180 }], feedback_wrong: 'Pomalu dolu', feedback_correct: 'Kontrola!', minDurationMs: 200 },
    ],
  },
  {
    name: 'Bear Crawl', nameCs: 'Medvedi lez',
    description: 'Quadruped locomotion exercise for full body coordination.',
    descriptionCs: 'Plizeni po ctyrech — koordinace, core, ramena.',
    muscleGroups: ['CORE', 'SHOULDERS', 'QUADRICEPS'],
    difficulty: 'INTERMEDIATE' as const,
    category: 'compound',
    instructions: {
      steps: [
        'Na vsech ctyrech — ruce pod rameny, kolena pod boky.',
        'Zdvihni kolena 5cm nad zem.',
        'Pohybuj se dopredu — protilehla ruka a noha zaroven.',
        'Drz boky nizko a stabilni.',
        'Pokracuj 10-20m.',
      ],
      commonMistakes: [
        'Boky se houpou ze strany na stranu.',
        'Kolena prilis vysoko.',
        'Pohyb stejne strany zaroven (ne protilehle).',
      ],
      targetMuscles: {
        primary: ['Core', 'Deltoidy'],
        secondary: ['Quadriceps', 'Hip flexors', 'Triceps'],
      },
      breathing: 'Pravidelne dychej.',
      tempo: 'Pomalu a kontrolovane, 10-20m.',
      warmup: 'Zadny — skvely jako warmup.',
      tips: [
        'Kratke kroky = lepsi forma.',
        'Drz boky co nejstabilnejsi.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Crawl Position', nameCs: 'Pozice', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 110 }, { joint: 'left_shoulder', angle_min: 70, angle_max: 110 }], feedback_wrong: 'Kolena nad zemi, telo nizko', feedback_correct: 'Lez!', minDurationMs: 500 },
    ],
  },
  {
    name: 'Wall Sit', nameCs: 'Sed u zdi',
    description: 'Isometric quad exercise holding a sitting position against a wall.',
    descriptionCs: 'Izometricky drep u zdi — vydrz.',
    muscleGroups: ['QUADRICEPS', 'GLUTES'],
    difficulty: 'BEGINNER' as const,
    category: 'isolation',
    instructions: {
      steps: [
        'Opri se zady o zed.',
        'Sesun se dolu do pozice sedu — stehna paralelne se zemi.',
        'Kolena v 90\u00b0, nohy na sirku boku.',
        'Drz po stanovenou dobu.',
      ],
      commonMistakes: [
        'Kolena pred spickami.',
        'Prilis vysoka pozice — stehna musi byt paralelne.',
        'Ruce na stehnech (podvadeni).',
      ],
      targetMuscles: {
        primary: ['Quadriceps'],
        secondary: ['Gluteus maximus', 'Hamstringy'],
      },
      breathing: 'Pravidelne dychej, nezadrzuj.',
      tempo: 'Vydrz: 30-60s zacatecnici, 60-120s pokrocili.',
      warmup: 'Zadny.',
      tips: [
        'Ruce pred telem nebo na hrudi — ne na stehnech.',
        'Pro vyzvu drz jednorucky v rukou.',
      ],
    },
    phases: [
      { phase: 'START', name: 'Sitting', nameCs: 'Sed', rules: [{ joint: 'left_knee', angle_min: 80, angle_max: 100 }, { joint: 'left_hip', angle_min: 80, angle_max: 100 }], feedback_wrong: 'Stehna paralelne, zada u zdi', feedback_correct: 'Drz!', minDurationMs: 5000 },
    ],
  },
];

// ────────────────────────────────────────────────────────────
// Equipment map for ALL exercises
// ────────────────────────────────────────────────────────────
export const equipmentMap: Record<string, string[]> = {
  // Existing equipment exercises
  'Barbell Squat': ['barbell'],
  'Bench Press': ['barbell', 'bench'],
  'Deadlift': ['barbell'],
  'Bicep Curl': ['dumbbell'],
  'Overhead Press': ['barbell'],
  'Barbell Row': ['barbell'],
  'Plank': [],
  'Lunges': [],

  // Existing bodyweight
  'Push-up': [],
  'Bodyweight Squat': [],
  'Glute Bridge': [],
  'Mountain Climbers': [],
  'Burpees': [],
  'Jumping Jacks': [],

  // New — Chest
  'Incline Dumbbell Press': ['dumbbell', 'bench'],
  'Dumbbell Fly': ['dumbbell', 'bench'],
  'Cable Crossover': ['cable'],
  'Decline Push-up': [],

  // New — Back
  'Lat Pulldown': ['machine'],
  'Seated Cable Row': ['cable'],
  'Dumbbell Row': ['dumbbell'],
  'Pull-up': ['pull_up_bar'],
  'Face Pull': ['cable'],

  // New — Shoulders
  'Lateral Raise': ['dumbbell'],
  'Front Raise': ['dumbbell'],
  'Rear Delt Fly': ['dumbbell'],
  'Arnold Press': ['dumbbell'],

  // New — Arms
  'Hammer Curl': ['dumbbell'],
  'Tricep Pushdown': ['cable'],
  'Skull Crusher': ['barbell', 'bench'],
  'Concentration Curl': ['dumbbell'],

  // New — Legs Quads
  'Front Squat': ['barbell'],
  'Leg Press': ['machine'],
  'Leg Extension': ['machine'],
  'Bulgarian Split Squat': [],

  // New — Legs Hams/Glutes
  'Romanian Deadlift': ['barbell'],
  'Leg Curl': ['machine'],
  'Hip Thrust': ['barbell', 'bench'],
  'Sumo Deadlift': ['barbell'],

  // New — Calves
  'Standing Calf Raise': ['machine'],
  'Seated Calf Raise': ['machine'],

  // New — Core
  'Hanging Leg Raise': ['pull_up_bar'],
  'Russian Twist': [],
  'Ab Wheel Rollout': ['ab_wheel'],
  'Cable Woodchop': ['cable'],
  'Dead Bug': [],

  // New — Compound
  'Clean and Press': ['barbell'],
  'Farmers Walk': ['kettlebell'],
  'Turkish Get-Up': ['kettlebell'],
  'Thruster': ['barbell'],

  // New — Bodyweight
  'Dips': ['pull_up_bar'],
  'Pike Push-up': [],
  'Pistol Squat': [],
  'Superman': [],
  'Bear Crawl': [],
  'Wall Sit': [],

  // New — Stretching
  'Hip Flexor Stretch': [],
  'Cat-Cow': [],
  'Worlds Greatest Stretch': [],
  'Foam Roll IT Band': ['foam_roller'],

  // Legacy entry from seed.ts
  'High Knees': [],
};
