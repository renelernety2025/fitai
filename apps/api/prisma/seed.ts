import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { exercises, bodyweightExercises, equipmentMap } from './exercises-data';
import { seedPromoCards } from './promo-seed';

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

  await seedPromoCards(prisma);

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
