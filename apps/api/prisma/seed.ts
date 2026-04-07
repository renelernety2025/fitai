import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fitai.com' },
    update: { passwordHash },
    create: {
      email: 'admin@fitai.com',
      passwordHash,
      name: 'Admin',
      level: 'ADVANCED',
      isAdmin: true,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'demo@fitai.com' },
    update: { passwordHash },
    create: {
      email: 'demo@fitai.com',
      passwordHash,
      name: 'Demo User',
      level: 'BEGINNER',
    },
  });

  const video1 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      thumbnailUrl: 'https://picsum.photos/seed/yoga/640/360',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Morning Yoga Flow',
      description: 'A gentle 20-minute yoga flow to start your day with energy and focus. Perfect for beginners looking to build flexibility and mindfulness.',
      category: 'YOGA',
      difficulty: 'BEGINNER',
      durationSeconds: 1200,
      thumbnailUrl: 'https://picsum.photos/seed/yoga/640/360',
      s3RawKey: 'raw/yoga-morning.mp4',
      isPublished: true,
    },
  });

  const video2 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {
      thumbnailUrl: 'https://picsum.photos/seed/cardio/640/360',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'HIIT Cardio Blast',
      description: 'High-intensity 15-minute cardio workout. No equipment needed. Burn calories fast with this intermediate-level session.',
      category: 'CARDIO',
      difficulty: 'INTERMEDIATE',
      durationSeconds: 900,
      thumbnailUrl: 'https://picsum.photos/seed/cardio/640/360',
      s3RawKey: 'raw/hiit-cardio.mp4',
      isPublished: true,
    },
  });

  const video3 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Full Body Strength',
      description: 'Build muscle and endurance with this 30-minute strength training session. Dumbbells recommended but bodyweight alternatives shown.',
      category: 'STRENGTH',
      difficulty: 'ADVANCED',
      durationSeconds: 1800,
      thumbnailUrl: 'https://picsum.photos/seed/strength/640/360',
      s3RawKey: 'raw/full-body-strength.mp4',
      isPublished: true,
    },
  });

  // ── Exercises ──
  const exercises = [
    {
      name: 'Barbell Squat', nameCs: 'Dřep s činkou',
      description: 'Compound lower body exercise targeting quads, glutes, and core.',
      descriptionCs: 'Základní cvik na dolní tělo — stehna, hýždě, core.',
      muscleGroups: ['QUADRICEPS', 'GLUTES', 'CORE'],
      difficulty: 'INTERMEDIATE' as const,
      category: 'compound',
      instructions: {
        steps: [
          'Postav se pod činku v racku, nohy na šířku ramen.',
          'Polož činku na horní část trapézů (ne na krk!).',
          'Odejdi od racku — 2 kroky dozadu.',
          'Špičky mírně ven (15-30°), váha na celé plosce.',
          'Nadechni se, zpevni core a začni klesat.',
          'Tlač kolena ven směrem za špičky.',
          'Klesej dokud stehna nejsou paralelně se zemí (nebo níže).',
          'Krátká pauza dole, pak výdech a tlač ze země přes paty.',
          'Narovnej se do výchozí pozice. Opakuj.',
        ],
        commonMistakes: [
          'Kolena padají dovnitř — aktivně je tlač ven.',
          'Zaoblená záda — drž hrudník nahoru, pohled dopředu.',
          'Zvedání pat — váha musí zůstat na celé plosce.',
          'Nedostatečná hloubka — stehna musí být alespoň paralelně.',
          'Příliš rychlý sestup — kontroluj pohyb (2 sekundy dolů).',
        ],
        targetMuscles: {
          primary: ['Quadriceps (přední stehna)', 'Gluteus maximus (velký hýžďový)'],
          secondary: ['Core (břišní svaly)', 'Hamstringy (zadní stehna)', 'Adduktory (vnitřní stehna)', 'Vzpřimovače páteře'],
        },
        breathing: 'NADECH při sestupu (zpevni core), VÝDECH při výstupu (nejvyšší úsilí).',
        tempo: '2-1-2 (2s sestup, 1s výdrž dole, 2s výstup)',
        warmup: 'Zahřívací set: 2×15 repů s prázdnou činkou (20kg). Pak 1×10 s 50% váhy.',
        tips: [
          'Tlač z pat, ne ze špiček.',
          'Představ si, že si sedáš na židli za tebou.',
          'Hrudník nahoru, pohled dopředu — ne dolů.',
          'Core zpevněný po celou dobu pohybu.',
        ],
      },
      phases: [
        { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }, { joint: 'right_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Narovnej se do vzpřímené pozice', feedback_correct: 'Připraven', minDurationMs: 300 },
        { phase: 'ECCENTRIC', name: 'Descending', nameCs: 'Klesání', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 150 }, { joint: 'left_hip', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Kolena za špičky, záda rovná', feedback_correct: 'Dobrý sestup', minDurationMs: 200 },
        { phase: 'HOLD', name: 'Bottom', nameCs: 'Spodní pozice', rules: [{ joint: 'left_knee', angle_min: 70, angle_max: 100 }, { joint: 'left_hip', angle_min: 60, angle_max: 100 }], feedback_wrong: 'Jdi hlouběji, stehna paralelně', feedback_correct: 'Perfektní hloubka!', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Ascending', nameCs: 'Stoupání', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 150 }], feedback_wrong: 'Tlač z pat, kolena ven', feedback_correct: 'Dobrý výstup', minDurationMs: 200 },
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
        steps: ['Lehni si na lavici, oči pod činkou.', 'Uchop činku o trochu šířeji než ramena.', 'Stáhni lopatky k sobě a dolů — vytvoř "oblouk" v horní části zad.', 'Zvedni činku z racku, ruce propnuté nad hrudníkem.', 'Nadechni se a pomalu spouštěj činku k dolní části hrudníku.', 'Lehce se dotkni hrudi (nesklápěj!).', 'Výdech a tlač činku zpět nahoru — mírně dozadu k očím.'],
        commonMistakes: ['Odrážení činky od hrudi — kontrolovaný dotek.', 'Zvedání hýždí z lavice — boky musí zůstat dole.', 'Lokty příliš daleko od těla (90°) — drž je v 45° úhlu.', 'Nerovnoměrný tlak — obě ruce stejně.'],
        targetMuscles: { primary: ['Pectoralis major (velký prsní sval)'], secondary: ['Přední deltoid (rameno)', 'Triceps'] },
        breathing: 'NADECH při spouštění, VÝDECH při tlaku nahoru.',
        tempo: '2-1-1 (2s dolů, 1s dotek, 1s nahoru)',
        warmup: '2×15 repů s prázdnou činkou. 1×10 s 50% váhy.',
        tips: ['Lopatky stažené — stabilní základ.', 'Nohy pevně na zemi.', 'Představ si, že ohýbáš činku do tvaru U.'],
      },
      phases: [
        { phase: 'START', name: 'Arms Extended', nameCs: 'Vzpažení', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }, { joint: 'right_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce', feedback_correct: 'Připraven', minDurationMs: 300 },
        { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spouštění', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Kontrolovaně spouštěj', feedback_correct: 'Dobrý sestup', minDurationMs: 200 },
        { phase: 'HOLD', name: 'Chest', nameCs: 'U hrudi', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 90 }], feedback_wrong: 'Dotkni se hrudi', feedback_correct: 'Dole!', minDurationMs: 150 },
        { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 150 }], feedback_wrong: 'Tlač rovnoměrně', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      ],
    },
    {
      name: 'Deadlift', nameCs: 'Mrtvý tah',
      description: 'Full body compound lift targeting posterior chain.',
      descriptionCs: 'Komplexní cvik na záda, hýždě a zadní stehna.',
      muscleGroups: ['BACK', 'HAMSTRINGS', 'GLUTES', 'CORE'],
      difficulty: 'ADVANCED' as const,
      category: 'compound',
      instructions: {
        steps: ['Postav se k čince, nohy na šířku boků, činka nad středem chodidla.', 'Předkloň se v kyčlích (ne v zádech!), uchop činku nadhmatem.', 'Stáhni lopatky, hrudník nahoru, záda ROVNÁ.', 'Nadechni se, zpevni core.', 'Tlač nohama do země — činka jde nahoru podél nohou.', 'Vzpřim se, boky dopředu, ramena dozadu.', 'Nahoře: stůj zpříma, nezaklánět se.', 'Kontrolovaně spusť činku dolů — kyčle dozadu, pak ohni kolena.'],
        commonMistakes: ['Zaoblená záda — KRITICKÉ! Záda musí být neutrální po celou dobu.', 'Činka daleko od těla — musí jít podél nohou.', 'Trhání činky — plynulý, kontrolovaný pohyb.', 'Hyperextenze nahoře — stůj rovně, nezaklánět.'],
        targetMuscles: { primary: ['Vzpřimovače páteře', 'Gluteus maximus', 'Hamstringy'], secondary: ['Trapézy', 'Předloktí (úchop)', 'Core', 'Quadriceps'] },
        breathing: 'NADECH dole (zpevnit core), VÝDECH nahoře.',
        tempo: '1-0-2 (1s nahoru, 0 pauza, 2s kontrolovaně dolů)',
        warmup: '2×10 rumunský mrtvý tah s lehkou váhou. 1×5 s 50% váhy.',
        tips: ['Záda VŽDY rovná — raději menší váha s perfektní formou.', 'Činka jde podél nohou — ne od těla.', 'Začni pohyb nohama, ne zády.'],
      },
      phases: [
        { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stůj zpříma', feedback_correct: 'Připraven', minDurationMs: 300 },
        { phase: 'ECCENTRIC', name: 'Hinging', nameCs: 'Předklon', rules: [{ joint: 'left_hip', angle_min: 80, angle_max: 140 }, { joint: 'left_knee', angle_min: 140, angle_max: 170 }], feedback_wrong: 'Záda rovná, ohýbej v kyčlích', feedback_correct: 'Dobrý předklon', minDurationMs: 200 },
        { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_hip', angle_min: 50, angle_max: 90 }], feedback_wrong: 'Prsa nahoru, záda neutrální', feedback_correct: 'Dobrá pozice!', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Pulling', nameCs: 'Tah', rules: [{ joint: 'left_hip', angle_min: 90, angle_max: 150 }], feedback_wrong: 'Tlač boky dopředu', feedback_correct: 'Táhni!', minDurationMs: 200 },
      ],
    },
    {
      name: 'Bicep Curl', nameCs: 'Bicepsový zdvih',
      description: 'Isolation exercise for biceps.',
      descriptionCs: 'Izolovaný cvik na bicepsy.',
      muscleGroups: ['BICEPS'],
      difficulty: 'BEGINNER' as const,
      category: 'isolation',
      instructions: {
        steps: ['Postav se rovně, jednoručky v rukou, dlaně dopředu.', 'Lokty u těla — nepohybuj jimi!', 'Pomalu zdvihni činky směrem k ramenům.', 'Stiskni biceps nahoře (1s výdrž).', 'Pomalu spusť zpět dolů — kontrolovaně, ne pádem.'],
        commonMistakes: ['Švihání tělem — stůj pevně, pracuje jen předloktí.', 'Lokty utíkají dopředu — drž je u boků.', 'Příliš rychlé spouštění — negativní fáze je důležitá.', 'Nepropnutí rukou dole — plný rozsah pohybu.'],
        targetMuscles: { primary: ['Biceps brachii'], secondary: ['Brachialis', 'Předloktí'] },
        breathing: 'VÝDECH při zdvihu, NADECH při spouštění.',
        tempo: '2-1-3 (2s nahoru, 1s stisk, 3s dolů — důraz na negativní fázi)',
        warmup: '1×15 s lehkou váhou.',
        tips: ['Lokty = fixní bod, nehýbej jimi.', 'Kontroluj negativní fázi (spouštění) — tam roste sval.', 'Alternativně střídat ruce pro lepší soustředění.'],
      },
      phases: [
        { phase: 'START', name: 'Arms Down', nameCs: 'Ruce dole', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce dolů', feedback_correct: 'Připraven', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Curling', nameCs: 'Zdvih', rules: [{ joint: 'left_elbow', angle_min: 50, angle_max: 120 }], feedback_wrong: 'Lokty u těla, nešvihej', feedback_correct: 'Dobrý zdvih', minDurationMs: 200 },
        { phase: 'HOLD', name: 'Top', nameCs: 'Nahoře', rules: [{ joint: 'left_elbow', angle_min: 30, angle_max: 60 }], feedback_wrong: 'Stiskni biceps nahoře', feedback_correct: 'Drž!', minDurationMs: 150 },
        { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spouštění', rules: [{ joint: 'left_elbow', angle_min: 90, angle_max: 160 }], feedback_wrong: 'Pomalu dolů, kontroluj', feedback_correct: 'Dobrý sestup', minDurationMs: 200 },
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
        steps: ['Uchop činku nadhmatem na šířku ramen.', 'Zvedni ji do pozice u ramen (činka se dotýká klíčních kostí).', 'Nadechni se, zpevni core a hýždě.', 'Tlač činku rovně nad hlavu — hlava se uhne dozadu.', 'Propni ruce nahoře, činka nad středem hlavy.', 'Kontrolovaně spusť zpět k ramenům.'],
        commonMistakes: ['Zaklánění — drž trup vzpřímený, zpevni core.', 'Tlak dopředu místo nahoru — činka jde rovně.', 'Lokty příliš vzadu — drž je mírně vpředu.', 'Nezamčené ruce nahoře — propni úplně.'],
        targetMuscles: { primary: ['Přední a střední deltoid'], secondary: ['Triceps', 'Horní trapéz', 'Core (stabilizace)'] },
        breathing: 'NADECH dole, VÝDECH při tlaku nahoru.',
        tempo: '1-1-2 (1s nahoru, 1s nahoře, 2s dolů)',
        warmup: '2×15 s prázdnou činkou.',
        tips: ['Zpevni hýždě — stabilita celého těla.', 'Dívej se dopředu, ne nahoru.', 'Činka jde rovně — nejkratší cesta.'],
      },
      phases: [
        { phase: 'START', name: 'Rack', nameCs: 'U ramen', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 100 }, { joint: 'left_shoulder', angle_min: 60, angle_max: 100 }], feedback_wrong: 'Činka u ramen', feedback_correct: 'Připraven', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Tlač rovně nahoru', feedback_correct: 'Nahoru!', minDurationMs: 200 },
        { phase: 'HOLD', name: 'Lockout', nameCs: 'Nahoře', rules: [{ joint: 'left_elbow', angle_min: 155, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce nahoře', feedback_correct: 'Zamknuto!', minDurationMs: 200 },
        { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spouštění', rules: [{ joint: 'left_elbow', angle_min: 80, angle_max: 150 }], feedback_wrong: 'Kontrolovaně dolů', feedback_correct: 'Dobrý sestup', minDurationMs: 200 },
      ],
    },
    {
      name: 'Barbell Row', nameCs: 'Přítahy v předklonu',
      description: 'Compound back exercise targeting lats and rhomboids.',
      descriptionCs: 'Záda — široký sval a mezilopatkové svaly.',
      muscleGroups: ['BACK', 'BICEPS'],
      difficulty: 'INTERMEDIATE' as const,
      category: 'compound',
      instructions: {
        steps: ['Uchop činku nadhmatem, mírně šířeji než ramena.', 'Předkloň se v kyčlích do cca 45° — záda ROVNÁ.', 'Ruce visí dolů, mírně pokrčené lokty.', 'Táhni činku k dolní části hrudníku / břichu.', 'Stiskni lopatky k sobě nahoře (1s výdrž).', 'Kontrolovaně spusť dolů.'],
        commonMistakes: ['Zaoblená záda — neutrální páteř po celou dobu.', 'Trhání činky — plynulý tah, ne švih.', 'Příliš vzpřímený postoj — předklon musí být dostatečný (45°).', 'Lokty příliš daleko od těla.'],
        targetMuscles: { primary: ['Latissimus dorsi (široký zádový)', 'Rhomboids (mezilopatkové)'], secondary: ['Biceps', 'Zadní deltoid', 'Vzpřimovače páteře'] },
        breathing: 'VÝDECH při tahu nahoru, NADECH při spouštění.',
        tempo: '1-1-2 (1s tah, 1s stisk, 2s dolů)',
        warmup: '2×15 s lehkou váhou nebo prázdnou činkou.',
        tips: ['Táhni lokty dozadu, ne ruce.', 'Představ si, že mačkáš tužku mezi lopatkami.', 'Záda musí být rovná — jako při mrtvém tahu.'],
      },
      phases: [
        { phase: 'START', name: 'Hinged', nameCs: 'Předklon', rules: [{ joint: 'left_hip', angle_min: 60, angle_max: 100 }, { joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Předkloň se, ruce propnuté', feedback_correct: 'Připraven', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Rowing', nameCs: 'Přítah', rules: [{ joint: 'left_elbow', angle_min: 60, angle_max: 120 }], feedback_wrong: 'Táhni k břichu, lokty dozadu', feedback_correct: 'Táhni!', minDurationMs: 200 },
        { phase: 'HOLD', name: 'Squeeze', nameCs: 'Stisk', rules: [{ joint: 'left_elbow', angle_min: 40, angle_max: 70 }], feedback_wrong: 'Stiskni lopatky k sobě', feedback_correct: 'Drž!', minDurationMs: 150 },
        { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spouštění', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Pomalu dolů', feedback_correct: 'Kontrola!', minDurationMs: 200 },
      ],
    },
    {
      name: 'Plank', nameCs: 'Plank',
      description: 'Isometric core stabilization exercise.',
      descriptionCs: 'Izometrický cvik na stabilizaci trupu.',
      muscleGroups: ['CORE', 'SHOULDERS'],
      difficulty: 'BEGINNER' as const,
      category: 'accessory',
      instructions: {
        steps: ['Lehni si na břicho, předloktí na zem (lokty pod rameny).', 'Zvedni tělo — opora na předloktích a špičkách.', 'Tělo tvoří ROVNOU linii: hlava-ramena-boky-paty.', 'Zpevni břicho (jako bys čekal ránu do břicha).', 'Stáhni hýždě.', 'Drž pozici po stanovenou dobu.'],
        commonMistakes: ['Propadlá záda — zpevni core, nezvedej hlavu.', 'Zvednutý zadek — boky v linii s rameny.', 'Zadržování dechu — dýchej normálně.', 'Pohled nahoru — krk neutrální, dívej se na zem.'],
        targetMuscles: { primary: ['Rectus abdominis (přímý břišní)', 'Transverzus abdominis (hluboký stabilizátor)'], secondary: ['Přední deltoid', 'Quadriceps', 'Gluteus'] },
        breathing: 'Dýchej normálně — nezadržuj dech! Krátké pravidelné nádechy a výdechy.',
        tempo: 'Výdrž: 30-60s pro začátečníky, 60-120s pro pokročilé.',
        warmup: 'Žádný speciální warm-up. Začni kratší výdrží.',
        tips: ['Méně je více — 30s s perfektní formou > 2min se špatnou.', 'Zkus varianty: boční plank, plank s dotykem ramene.'],
      },
      phases: [
        { phase: 'START', name: 'Hold', nameCs: 'Výdrž', rules: [{ joint: 'left_hip', angle_min: 160, angle_max: 180 }, { joint: 'left_shoulder', angle_min: 70, angle_max: 110 }], feedback_wrong: 'Boky v linii, nezvedej zadek', feedback_correct: 'Perfektní plank!', minDurationMs: 1000 },
      ],
    },
    {
      name: 'Lunges', nameCs: 'Výpady',
      description: 'Unilateral leg exercise for quads, glutes, and balance.',
      descriptionCs: 'Výpady vpřed — stehna, hýždě, stabilita.',
      muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
      difficulty: 'BEGINNER' as const,
      category: 'accessory',
      instructions: {
        steps: ['Postav se rovně, nohy u sebe.', 'Vykroč jednou nohou dopředu (velký krok).', 'Sniž tělo dolů — obě kolena do 90°.', 'Zadní koleno se téměř dotkne země.', 'Přední koleno nepřesahuje špičku.', 'Odraz z přední paty a vrať se do stoje.', 'Opakuj s druhou nohou (střídej).'],
        commonMistakes: ['Koleno přes špičku — krok musí být dostatečně dlouhý.', 'Úzký postoj — nohy na šířku boků, ne za sebou.', 'Předklon trupu — drž se vzpřímeně.', 'Odraz ze špičky — tlač z paty.'],
        targetMuscles: { primary: ['Quadriceps', 'Gluteus maximus'], secondary: ['Hamstringy', 'Adduktory', 'Core (stabilizace)'] },
        breathing: 'NADECH při sestupu, VÝDECH při výstupu.',
        tempo: '2-1-1 (2s dolů, 1s dole, 1s nahoru)',
        warmup: '1×10 výpady bez závaží na každou nohu.',
        tips: ['Skvělý cvik pro opravu asymetrií mezi nohama.', 'Varianta: bulharský výpad (zadní noha na lavičce) pro větší výzvu.'],
      },
      phases: [
        { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }, { joint: 'right_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stůj rovně', feedback_correct: 'Připraven', minDurationMs: 300 },
        { phase: 'ECCENTRIC', name: 'Stepping', nameCs: 'Výkrok', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 150 }], feedback_wrong: 'Koleno za špičku, trup rovně', feedback_correct: 'Dobrý výkrok', minDurationMs: 200 },
        { phase: 'HOLD', name: 'Bottom', nameCs: 'Dole', rules: [{ joint: 'left_knee', angle_min: 80, angle_max: 100 }], feedback_wrong: 'Koleno do 90°, zadní koleno k zemi', feedback_correct: 'Perfektní pozice!', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Pushing', nameCs: 'Výstup', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 160 }], feedback_wrong: 'Odraz z přední paty', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      ],
    },
  ];

  // Equipment map for existing + bodyweight exercises (Section E)
  const equipmentMap: Record<string, string[]> = {
    'Barbell Squat': ['barbell'],
    'Bench Press': ['barbell', 'bench'],
    'Deadlift': ['barbell'],
    'Bicep Curl': ['dumbbell'],
    'Overhead Press': ['barbell'],
    'Barbell Row': ['barbell'],
    'Plank': [],
    'Lunges': [],
    'Push-up': [],
    'Bodyweight Squat': [],
    'Glute Bridge': [],
    'Mountain Climbers': [],
    'Burpees': [],
    'Jumping Jacks': [],
    'High Knees': [],
  };

  // Bodyweight exercises for home / travel / quick workouts (Section E)
  const bodyweightExercises = [
    {
      name: 'Push-up', nameCs: 'Klik',
      description: 'Bodyweight push exercise targeting chest, shoulders, and triceps.',
      descriptionCs: 'Klik — prsa, ramena, tricepsy. Bez vybavení.',
      muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS', 'CORE'],
      difficulty: 'BEGINNER' as const,
      category: 'compound',
      instructions: {
        steps: ['Lehni si na břicho, ruce pod rameny.', 'Zatlač se do plank pozice — tělo rovná linie.', 'Pomalu spouštěj hrudník k zemi (lokty 45°).', 'Tlač zpět nahoru.'],
        commonMistakes: ['Propadlé boky.', 'Lokty 90° od těla.', 'Neúplný rozsah.'],
        targetMuscles: { primary: ['Pectoralis major'], secondary: ['Triceps', 'Přední deltoid', 'Core'] },
        breathing: 'NADECH dolů, VÝDECH nahoru.',
        tempo: '2-1-1',
        warmup: '1×10 lehkých kliků na kolenou.',
        tips: ['Pro snazší variantu klečte na kolenech.', 'Drž core zpevněný.'],
      },
      phases: [
        { phase: 'START', name: 'Plank', nameCs: 'Plank', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Propni ruce', feedback_correct: 'Připraven', minDurationMs: 200 },
        { phase: 'ECCENTRIC', name: 'Lowering', nameCs: 'Spouštění', rules: [{ joint: 'left_elbow', angle_min: 70, angle_max: 140 }], feedback_wrong: 'Kontroluj sestup', feedback_correct: 'Dolů', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Pressing', nameCs: 'Tlak', rules: [{ joint: 'left_elbow', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Tlač', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      ],
    },
    {
      name: 'Bodyweight Squat', nameCs: 'Dřep bez váhy',
      description: 'Bodyweight squat for legs and glutes.',
      descriptionCs: 'Dřep bez vybavení — nohy, hýždě, core.',
      muscleGroups: ['QUADRICEPS', 'GLUTES'],
      difficulty: 'BEGINNER' as const,
      category: 'compound',
      instructions: {
        steps: ['Stoj na šířku ramen.', 'Klesni dolů — kyčle dozadu, kolena ven.', 'Stehna paralelně se zemí.', 'Tlač z pat zpět nahoru.'],
        commonMistakes: ['Kolena dovnitř.', 'Mělká hloubka.', 'Záda zaoblená.'],
        targetMuscles: { primary: ['Quadriceps', 'Gluteus maximus'], secondary: ['Core', 'Hamstringy'] },
        breathing: 'NADECH dolů, VÝDECH nahoru.',
        tempo: '2-1-2',
        warmup: '10 dřepů s vlastní vahou.',
        tips: ['Ruce před tělem pro rovnováhu.', 'Pohled dopředu.'],
      },
      phases: [
        { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stůj', feedback_correct: 'Připraven', minDurationMs: 200 },
        { phase: 'ECCENTRIC', name: 'Down', nameCs: 'Dolů', rules: [{ joint: 'left_knee', angle_min: 80, angle_max: 140 }], feedback_wrong: 'Klesej', feedback_correct: 'Dolů', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Up', nameCs: 'Nahoru', rules: [{ joint: 'left_knee', angle_min: 100, angle_max: 170 }], feedback_wrong: 'Tlač', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      ],
    },
    {
      name: 'Glute Bridge', nameCs: 'Glute bridge',
      description: 'Hip thrust on the ground for glutes.',
      descriptionCs: 'Most na hýždě — leh na zádech, zvedání pánve.',
      muscleGroups: ['GLUTES', 'HAMSTRINGS', 'CORE'],
      difficulty: 'BEGINNER' as const,
      category: 'isolation',
      instructions: {
        steps: ['Lehni si na záda, kolena pokrčená.', 'Chodidla na zemi pod koleny.', 'Zvedni pánev nahoru — stiskni hýždě.', 'Drž 1s nahoře, pak pomalu dolů.'],
        commonMistakes: ['Hyperextenze v zádech.', 'Neúplný rozsah.'],
        targetMuscles: { primary: ['Gluteus maximus'], secondary: ['Hamstringy', 'Core'] },
        breathing: 'VÝDECH nahoru, NADECH dolů.',
        tempo: '2-1-2',
        warmup: 'Žádný.',
        tips: ['Stiskni hýždě tak silně, jak jen umíš.'],
      },
      phases: [
        { phase: 'START', name: 'Down', nameCs: 'Dolů', rules: [{ joint: 'left_hip', angle_min: 90, angle_max: 130 }], feedback_wrong: 'Lehni si', feedback_correct: 'Připraven', minDurationMs: 200 },
        { phase: 'CONCENTRIC', name: 'Up', nameCs: 'Nahoru', rules: [{ joint: 'left_hip', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Stiskni hýždě', feedback_correct: 'Nahoru!', minDurationMs: 200 },
      ],
    },
    {
      name: 'Mountain Climbers', nameCs: 'Horolezec',
      description: 'Cardio core exercise from plank position.',
      descriptionCs: 'Kardio cvik v plank pozici — střídání kolen k hrudi.',
      muscleGroups: ['CORE', 'SHOULDERS', 'QUADRICEPS'],
      difficulty: 'INTERMEDIATE' as const,
      category: 'accessory',
      instructions: {
        steps: ['Začni v high plank pozici.', 'Přitáhni jedno koleno k hrudi.', 'Rychle vyměň nohy.', 'Pokračuj v rychlém tempu.'],
        commonMistakes: ['Zvednutý zadek.', 'Pomalé tempo.'],
        targetMuscles: { primary: ['Core', 'Hip flexors'], secondary: ['Ramena', 'Quadriceps'] },
        breathing: 'Pravidelně, rychle.',
        tempo: 'Rychlé tempo, 30-45s série.',
        warmup: 'Žádný.',
        tips: ['Drž boky nízko.', 'Začni pomalu, zrychluj.'],
      },
      phases: [
        { phase: 'START', name: 'Plank', nameCs: 'Plank', rules: [{ joint: 'left_elbow', angle_min: 150, angle_max: 180 }], feedback_wrong: 'Plank pozice', feedback_correct: 'Připraven', minDurationMs: 200 },
      ],
    },
    {
      name: 'Burpees', nameCs: 'Burpees',
      description: 'Full body cardio explosive exercise.',
      descriptionCs: 'Plnotělový kardio cvik — dřep, plank, klik, výskok.',
      muscleGroups: ['FULL_BODY'],
      difficulty: 'ADVANCED' as const,
      category: 'compound',
      instructions: {
        steps: ['Stoj.', 'Dřep — ruce na zem.', 'Vyhoď nohy dozadu do plank.', 'Klik (volitelně).', 'Skoč nohy zpět k rukám.', 'Výskok s rukama nad hlavou.'],
        commonMistakes: ['Propadlá záda v planku.', 'Bez výskoku.'],
        targetMuscles: { primary: ['Plné tělo'], secondary: [] },
        breathing: 'Pravidelně.',
        tempo: 'Stálé tempo, 30-60s série.',
        warmup: '5 pomalých burpees.',
        tips: ['Začni bez kliku/výskoku jako varianta.'],
      },
      phases: [
        { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stůj', feedback_correct: 'Připraven', minDurationMs: 200 },
      ],
    },
    {
      name: 'Jumping Jacks', nameCs: 'Jumping Jacks',
      description: 'Full body warm-up cardio.',
      descriptionCs: 'Klasický rozcvičovací kardio cvik.',
      muscleGroups: ['FULL_BODY'],
      difficulty: 'BEGINNER' as const,
      category: 'accessory',
      instructions: {
        steps: ['Stoj, ruce u boků.', 'Vyskoč — nohy do stran, ruce nad hlavu.', 'Vrať se zpět do stoje.', 'Opakuj rytmicky.'],
        commonMistakes: ['Příliš pomalé tempo.'],
        targetMuscles: { primary: ['Plné tělo'], secondary: [] },
        breathing: 'Pravidelně.',
        tempo: 'Rychlé, 30-60s série.',
        warmup: 'Žádný — toto je warm-up.',
        tips: ['Skvělé pro zahřátí na začátku tréninku.'],
      },
      phases: [
        { phase: 'START', name: 'Standing', nameCs: 'Stoj', rules: [{ joint: 'left_knee', angle_min: 160, angle_max: 180 }], feedback_wrong: 'Stůj', feedback_correct: 'Připraven', minDurationMs: 200 },
      ],
    },
  ];

  for (const ex of [...exercises, ...bodyweightExercises]) {
    const equipment = equipmentMap[ex.name] ?? [];
    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: { phases: ex.phases, instructions: (ex as any).instructions, category: (ex as any).category, equipment },
      create: { ...(ex as any), equipment },
    });
  }

  // ── Workout Plan Templates ──
  const allExercises = await prisma.exercise.findMany();
  const exByName = (name: string) => allExercises.find((e) => e.name === name)!;

  // Push/Pull/Legs
  const pplPlan = await prisma.workoutPlan.upsert({
    where: { id: '00000000-0000-0000-0001-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000001',
      name: 'Push/Pull/Legs', nameCs: 'Push/Pull/Legs',
      description: 'Classic 3-day split', type: 'PUSH_PULL_LEGS',
      difficulty: 'INTERMEDIATE', isTemplate: true, daysPerWeek: 3,
    },
  });

  const pplDays = [
    { name: 'Push Day', nameCs: 'Push den', exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, rest: 120 },
      { name: 'Overhead Press', sets: 3, reps: 10, rest: 90 },
    ]},
    { name: 'Pull Day', nameCs: 'Pull den', exercises: [
      { name: 'Deadlift', sets: 3, reps: 5, rest: 180 },
      { name: 'Barbell Row', sets: 4, reps: 8, rest: 90 },
      { name: 'Bicep Curl', sets: 3, reps: 12, rest: 60 },
    ]},
    { name: 'Leg Day', nameCs: 'Leg den', exercises: [
      { name: 'Barbell Squat', sets: 4, reps: 8, rest: 120 },
      { name: 'Lunges', sets: 3, reps: 10, rest: 90 },
    ]},
  ];

  for (let i = 0; i < pplDays.length; i++) {
    const day = pplDays[i];
    const dbDay = await prisma.workoutDay.upsert({
      where: { workoutPlanId_dayIndex: { workoutPlanId: pplPlan.id, dayIndex: i } },
      update: {},
      create: { workoutPlanId: pplPlan.id, dayIndex: i, name: day.name, nameCs: day.nameCs },
    });
    for (let j = 0; j < day.exercises.length; j++) {
      const ex = day.exercises[j];
      const exercise = exByName(ex.name);
      await prisma.plannedExercise.upsert({
        where: { workoutDayId_orderIndex: { workoutDayId: dbDay.id, orderIndex: j } },
        update: {},
        create: { workoutDayId: dbDay.id, exerciseId: exercise.id, orderIndex: j, targetSets: ex.sets, targetReps: ex.reps, restSeconds: ex.rest },
      });
    }
  }

  // Full Body
  await prisma.workoutPlan.upsert({
    where: { id: '00000000-0000-0000-0001-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000002',
      name: 'Full Body', nameCs: 'Celé tělo',
      description: 'Full body workout 3x per week', type: 'FULL_BODY',
      difficulty: 'BEGINNER', isTemplate: true, daysPerWeek: 3,
      days: {
        create: [{
          dayIndex: 0, name: 'Full Body A', nameCs: 'Celé tělo A',
          plannedExercises: {
            create: [
              { exerciseId: exByName('Barbell Squat').id, orderIndex: 0, targetSets: 3, targetReps: 10, restSeconds: 90 },
              { exerciseId: exByName('Bench Press').id, orderIndex: 1, targetSets: 3, targetReps: 10, restSeconds: 90 },
              { exerciseId: exByName('Barbell Row').id, orderIndex: 2, targetSets: 3, targetReps: 10, restSeconds: 90 },
              { exerciseId: exByName('Plank').id, orderIndex: 3, targetSets: 3, targetReps: 1, restSeconds: 60 },
            ],
          },
        }],
      },
    },
  });

  // Upper/Lower
  await prisma.workoutPlan.upsert({
    where: { id: '00000000-0000-0000-0001-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000003',
      name: 'Upper/Lower', nameCs: 'Horní/Dolní',
      description: 'Upper lower split 4x per week', type: 'UPPER_LOWER',
      difficulty: 'INTERMEDIATE', isTemplate: true, daysPerWeek: 4,
      days: {
        create: [
          { dayIndex: 0, name: 'Upper', nameCs: 'Horní tělo', plannedExercises: { create: [
            { exerciseId: exByName('Bench Press').id, orderIndex: 0, targetSets: 4, targetReps: 8, restSeconds: 120 },
            { exerciseId: exByName('Barbell Row').id, orderIndex: 1, targetSets: 4, targetReps: 8, restSeconds: 90 },
            { exerciseId: exByName('Overhead Press').id, orderIndex: 2, targetSets: 3, targetReps: 10, restSeconds: 90 },
            { exerciseId: exByName('Bicep Curl').id, orderIndex: 3, targetSets: 3, targetReps: 12, restSeconds: 60 },
          ]}},
          { dayIndex: 1, name: 'Lower', nameCs: 'Dolní tělo', plannedExercises: { create: [
            { exerciseId: exByName('Barbell Squat').id, orderIndex: 0, targetSets: 4, targetReps: 8, restSeconds: 120 },
            { exerciseId: exByName('Deadlift').id, orderIndex: 1, targetSets: 3, targetReps: 5, restSeconds: 180 },
            { exerciseId: exByName('Lunges').id, orderIndex: 2, targetSets: 3, targetReps: 10, restSeconds: 90 },
          ]}},
        ],
      },
    },
  });

  // ── Education Lessons (Section D) ──
  const lessons = [
    {
      slug: 'progressive-overload',
      title: 'Progressive Overload',
      titleCs: 'Progresivní zatížení',
      category: 'technique',
      body: 'Progressive overload is the principle of gradually increasing weight, reps, or volume.',
      bodyCs: 'Progresivní zatížení je princip postupného zvyšování váhy, repů nebo objemu. Bez tohoto principu se nezlepšíš. Cíl: každý týden o 1-2.5kg víc, nebo o 1 rep víc. Alternativy: víc setů, kratší pauzy, lepší forma. Klíč je KONZISTENCE — malé zlepšení každý týden = obrovský pokrok za rok.',
      durationMin: 3,
    },
    {
      slug: 'recovery-basics',
      title: 'Recovery Basics',
      titleCs: 'Základy regenerace',
      category: 'recovery',
      body: 'Recovery is when growth happens.',
      bodyCs: 'Sval neroste v gym, ale při odpočinku. Tři pilíře regenerace: 1) SPÁNEK — 7-9 hodin, ideálně chladná místnost, žádné obrazovky před spaním. 2) VÝŽIVA — protein 1.6-2.2g/kg váhy denně, dostatek sacharidů pro energii. 3) ODPOČINEK — alespoň 1 den volna mezi tréninkem stejné svalové skupiny. Bez regenerace nepřijde progres, jen vyhoření.',
      durationMin: 4,
    },
    {
      slug: 'protein-intake',
      title: 'Protein Intake',
      titleCs: 'Příjem proteinů',
      category: 'nutrition',
      body: 'Protein is essential for muscle growth.',
      bodyCs: 'Pro růst svalů potřebuješ 1.6-2.2g proteinu na kg tělesné váhy. Příklad: 75kg člověk = 120-165g proteinu denně. Zdroje: kuřecí (23g/100g), vajíčka (6g/kus), tvaroh (12g/100g), proteinový prášek (20-25g/scoop), tuňák (25g/100g). Rozděl příjem do 4-5 jídel po 30-40g — tělo lépe využije.',
      durationMin: 4,
    },
    {
      slug: 'mind-muscle-connection',
      title: 'Mind-Muscle Connection',
      titleCs: 'Mind-muscle connection',
      category: 'technique',
      body: 'Focus on the muscle you are working.',
      bodyCs: 'Mind-muscle connection znamená vědomě cítit sval, který pracuje. Místo přemýšlení "zvedám činku" mysli "stahuji biceps". Tento mentální fokus aktivuje víc svalových vláken a vede k lepšímu růstu. Tipy: 1) Použij menší váhu na začátku. 2) Pomalu provádej negativní fázi (3 sekundy dolů). 3) Stiskni sval nahoře (1s peak contraction). 4) Soustřeď se — žádné odbíhání myšlenek.',
      durationMin: 3,
    },
    {
      slug: 'sleep-and-gains',
      title: 'Sleep and Gains',
      titleCs: 'Spánek a růst svalů',
      category: 'recovery',
      body: 'Sleep is when most muscle protein synthesis happens.',
      bodyCs: 'Během spánku tělo produkuje testosteron a růstový hormon — klíčové pro růst svalů. Studie ukazují že nedostatek spánku (méně než 6h) snižuje sílu o 11% a růst svalů o 60%! Doporučení: 7-9 hodin denně, jdi spát ve stejnou dobu, vyhni se kofeinu po 14:00, ložnice tmavá a chladná (18-20°C).',
      durationMin: 4,
    },
    {
      slug: 'rpe-explained',
      title: 'RPE Explained',
      titleCs: 'Co je RPE',
      category: 'technique',
      body: 'Rate of Perceived Exertion is a 1-10 scale of effort.',
      bodyCs: 'RPE (Rate of Perceived Exertion) je škála 1-10 jak těžké bylo cvičení. RPE 10 = absolutní selhání, neudělal bys už ani jeden rep. RPE 9 = 1 rep v rezervě. RPE 8 = 2 repy v rezervě. Pro hypertrofii cvič na RPE 7-9, pro sílu RPE 8-10. RPE 6 a méně = příliš lehké, nestačí na progres. Sleduj RPE — pomáhá ti vidět zda potřebuješ přidat váhu.',
      durationMin: 3,
    },
    {
      slug: 'compound-vs-isolation',
      title: 'Compound vs Isolation',
      titleCs: 'Compound vs izolační cviky',
      category: 'technique',
      body: 'Understand the difference between compound and isolation exercises.',
      bodyCs: 'COMPOUND cviky aktivují více svalových skupin současně (dřep, mrtvý tah, bench press). Dej je vždy na začátek tréninku — největší síla, nejvíc svalů. IZOLAČNÍ cviky cílí jeden sval (bicepsový zdvih, triceps extension). Patří na konec — doladění slabých míst. Pravidlo: 70% času na compound, 30% na isolation.',
      durationMin: 3,
    },
    {
      slug: 'avoiding-injury',
      title: 'Avoiding Injury',
      titleCs: 'Jak se vyhnout zranění',
      category: 'mindset',
      body: 'Form first, weight second.',
      bodyCs: 'Nejčastější chyby vedoucí ke zranění: 1) FORMA před váhou — raději 50kg perfektně než 100kg s katastrofální technikou. 2) ZAHŘÍVÁNÍ — vždy 2-3 lehčí sety před pracovní vahou. 3) POSLOUCHEJ TĚLO — bolest v kloubech = STOP, sval únava = pokračuj. 4) PROGRESE postupně — max +2.5kg za týden na compound. 5) ODPOČÍVEJ — přetrénování = zranění.',
      durationMin: 5,
    },
  ];

  for (const lesson of lessons) {
    await prisma.educationLesson.upsert({
      where: { slug: lesson.slug },
      update: { bodyCs: lesson.bodyCs, titleCs: lesson.titleCs },
      create: lesson,
    });
  }

  // ── Glossary terms ──
  const glossary = [
    { term: '1RM', termCs: '1RM (One Rep Max)', definition: '', definitionCs: 'Maximální váha kterou jsi schopen zvednout právě jednou s perfektní formou. Základ pro výpočet pracovních vah.', category: 'strength' },
    { term: 'RPE', termCs: 'RPE', definition: '', definitionCs: 'Rate of Perceived Exertion. Škála 1-10 jak těžké cvičení bylo. RPE 10 = absolutní selhání.', category: 'training' },
    { term: 'AMRAP', termCs: 'AMRAP', definition: '', definitionCs: 'As Many Reps As Possible. Set ve kterém uděláš co nejvíc opakování s danou váhou.', category: 'training' },
    { term: 'Compound', termCs: 'Compound cvik', definition: '', definitionCs: 'Cvik který zapojuje více kloubů a svalových skupin (dřep, mrtvý tah, bench press).', category: 'exercise' },
    { term: 'Isolation', termCs: 'Izolační cvik', definition: '', definitionCs: 'Cvik který izoluje jeden sval (bicepsový zdvih, leg extension).', category: 'exercise' },
    { term: 'Hypertrofie', termCs: 'Hypertrofie', definition: '', definitionCs: 'Růst svalových vláken. Hlavní cíl pro budování svalové hmoty. Optimální rep range 6-12.', category: 'goals' },
    { term: 'Deload', termCs: 'Deload', definition: '', definitionCs: 'Týden s nižším objemem (50%) a intenzitou (70%) pro regeneraci. Doporučeno každý 4-6. týden.', category: 'recovery' },
    { term: 'Progresivní zatížení', termCs: 'Progresivní zatížení', definition: '', definitionCs: 'Postupné zvyšování zátěže v čase. Bez něj se nezlepšíš.', category: 'training' },
    { term: 'Mind-muscle connection', termCs: 'Mind-muscle connection', definition: '', definitionCs: 'Vědomé soustředění na sval, který pracuje. Vede k lepší aktivaci svalových vláken.', category: 'technique' },
    { term: 'Tempo', termCs: 'Tempo', definition: '', definitionCs: 'Rychlost provedení cviku. Notace 2-1-2 = 2s eccentric, 1s pauza, 2s concentric.', category: 'technique' },
    { term: 'Failure', termCs: 'Selhání svalů', definition: '', definitionCs: 'Bod kdy už nemůžeš udělat další rep s dobrou formou. Trénink do selhání = max stimulus, ale i max únava.', category: 'training' },
    { term: 'Volume', termCs: 'Objem', definition: '', definitionCs: 'Celková práce v setu/tréninku/týdnu. Vzorec: sety × repy × váha. Klíčový faktor pro hypertrofii.', category: 'training' },
    { term: 'Rest pause', termCs: 'Rest-pause', definition: '', definitionCs: 'Technika: set do selhání, 15s pauza, pokračuj. Zvyšuje intenzitu bez zvýšení váhy.', category: 'technique' },
    { term: 'Drop set', termCs: 'Drop set', definition: '', definitionCs: 'Po setu okamžitě snížíš váhu o 20-30% a pokračuješ. Skvělé pro hypertrofii.', category: 'technique' },
    { term: 'Eccentric', termCs: 'Eccentric (negativní)', definition: '', definitionCs: 'Spouštěcí fáze cviku. Sval se prodlužuje pod zátěží. Důležité pro růst.', category: 'technique' },
    { term: 'Concentric', termCs: 'Concentric (pozitivní)', definition: '', definitionCs: 'Zvedací fáze cviku. Sval se zkracuje pod zátěží.', category: 'technique' },
  ];

  for (const term of glossary) {
    await prisma.glossaryTerm.upsert({
      where: { termCs: term.termCs },
      update: { definitionCs: term.definitionCs },
      create: term,
    });
  }

  console.log('Seed complete:', {
    users: [admin.email, user.email],
    videos: [video1.title, video2.title, video3.title],
    exercises: exercises.length,
    plans: 3,
    lessons: lessons.length,
    glossary: glossary.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
