---
name: add-exercise
description: Add a new exercise to FitAI with all required metadata — phases, angle rules, coaching hints, breathing cues, key focus, common corrections, muscle feel, motivation lines, and deviation thresholds. Use when user asks to add an exercise (e.g., "přidej dřep s činkou", "add romanian deadlift").
---

# Add Exercise Skill

FitAI exercises need structured metadata so pose detection, coaching, and the UI all work together. Use this template every time.

## Where exercises live

- **Exercise data:** `apps/api/prisma/exercises-data.ts` → `exercises` + `bodyweightExercises` + `equipmentMap` arrays (seed.ts imports from here)
- **Exercise list for UI:** `apps/mobile/src/constants/exercises.ts` → `EXERCISE_LIST`
- **Coaching phrases per exercise:** `apps/mobile/src/lib/coaching-phrases.ts` (reuse generic pool + add exercise-specific)
- **Pose validation rules:** `apps/web/src/lib/feedback-engine.ts` → JOINT_MAP + checkpoint logic (LOCKED — do not touch without explicit permission)

## Required fields per exercise

```ts
{
  // Identity
  name: 'barbell-squat',                    // kebab-case id
  nameCs: 'Dřep s činkou',                  // Czech display name
  category: 'compound',                     // compound | accessory | isolation
  muscleGroups: ['quads', 'glutes', 'core'],
  difficulty: 'intermediate',               // beginner | intermediate | advanced
  equipment: ['barbell', 'rack'],

  // Pose detection — phases define a full rep
  phases: [
    {
      name: 'start',
      angleRules: {
        kneeAngle: { min: 160, max: 180 },     // standing
        hipAngle: { min: 160, max: 180 },
      },
    },
    {
      name: 'eccentric',                        // descending
      angleRules: {
        kneeAngle: { min: 120, max: 160 },
        hipAngle: { min: 120, max: 160 },
      },
    },
    {
      name: 'bottom',                           // hold
      angleRules: {
        kneeAngle: { min: 85, max: 110 },       // parallel or below
        hipAngle: { min: 85, max: 110 },
      },
    },
    {
      name: 'concentric',                       // rising
      angleRules: {
        kneeAngle: { min: 110, max: 160 },
        hipAngle: { min: 110, max: 160 },
      },
    },
  ],

  // Coaching (Czech, 100% lowercase except proper names)
  coachingHints: {
    setup: ['nohy na šířku ramen', 'špičky mírně vytočené', 'činka na trapézech'],
    breathing: ['nádech dolů', 'výdech nahoru'],
    keyFocus: ['koleno sleduje špičku', 'záda rovná', 'hrudník nahoru'],
    tempo: '2-1-2',                          // eccentric - hold - concentric (seconds)
    warmup: '2 sady s 50% váhy',
  },

  // Per-exercise corrections (specific, not generic)
  corrections: {
    kneeValgus: 'koleno vybočuje dovnitř — tlač ho ven',
    roundedBack: 'záda se kulatí — hrudník výš',
    shallowDepth: 'nejdeš dost hluboko — stehno do paraleli',
    heelLift: 'odlepuješ paty — tlač přes celou nohu',
  },

  // Muscle feel descriptions (for coaching narration)
  muscleFeel: 'Měl bys cítit zapojení přední strany stehen a hýždí. Pokud cítíš víc kříž, zkus posunout váhu na paty.',

  // Motivation lines (rotate between sets)
  motivation: [
    'držíš to skvěle',
    'ještě dvě opakování',
    'tohle je tvoje silná stránka',
  ],

  // Deviation thresholds (when to trigger safety alerts)
  deviationLimits: {
    kneeAngleMax: 180,       // full extension OK
    kneeAngleMin: 70,        // too deep = knee stress
    backAngleMin: 140,       // lower than this = rounded back warning
    asymmetryDeg: 15,        // left vs right knee angle delta
  },
}
```

## Checklist when adding a new exercise

- [ ] Added to `exercises` or `bodyweightExercises` in `apps/api/prisma/exercises-data.ts`
- [ ] Added to `equipmentMap` in same file
- [ ] Added to `EXERCISE_LIST` in `apps/mobile/src/constants/exercises.ts`
- [ ] All 4 phases defined (start, eccentric, bottom/hold, concentric)
- [ ] Angle rules cover min/max for each tracked joint
- [ ] Czech `nameCs`, coaching hints, corrections all in Czech
- [ ] 3+ motivation lines so coaching doesn't repeat
- [ ] Deviation limits set (or explicit comment "no safety checks needed")
- [ ] If new muscle group → add to muscle_groups enum in Prisma
- [ ] Run `npx prisma db push --accept-data-loss` (NEVER `migrate dev` — production has no migration history)
- [ ] Test on mobile dev build: pose detection + coaching voice should work end-to-end

## Tone for Czech coaching

- Direct, friendly, second-person singular (tykání)
- Max 12 words per phrase (TTS latency + user attention)
- No English loanwords unless technical (RPE, 1RM are OK)
- Safety alerts are imperative: "pozor, tlač koleno ven" not "bylo by dobré..."
- Praise is specific: "skvělá hloubka" not just "dobře"
