import type { DailyBriefExercise, DailyBriefMood } from './ai-insights.helpers';

export interface SplitTemplate {
  title: string;
  exercises: DailyBriefExercise[];
}

export function getRotatingSplits(rpe: number): SplitTemplate[] {
  return [
    {
      title: 'Push (hrudník + ramena + triceps)',
      exercises: [
        { name: 'Bench Press', nameCs: 'Bench press', sets: 4, reps: '5-8', weightKg: null, rpe, restSeconds: 150, rationale: 'Hlavní compound — vytváří sílu' },
        { name: 'Overhead Press', nameCs: 'Tlaky nad hlavu', sets: 3, reps: '6-8', weightKg: null, rpe, restSeconds: 120, rationale: 'Ramena — stability + síla' },
        { name: 'Incline DB Press', nameCs: 'Šikmé tlaky s činkami', sets: 3, reps: '8-10', weightKg: null, rpe: rpe - 1, restSeconds: 90, rationale: 'Horní hrudník — objem' },
        { name: 'Triceps Pushdown', nameCs: 'Triceps na kladce', sets: 3, reps: '10-12', weightKg: null, rpe: rpe - 1, restSeconds: 60, rationale: 'Izolace — pump' },
      ],
    },
    {
      title: 'Pull (záda + biceps)',
      exercises: [
        { name: 'Deadlift', nameCs: 'Mrtvý tah', sets: 3, reps: '5', weightKg: null, rpe, restSeconds: 180, rationale: 'Total body síla' },
        { name: 'Pull-up', nameCs: 'Shyby', sets: 4, reps: '6-8', weightKg: null, rpe, restSeconds: 120, rationale: 'Široká záda' },
        { name: 'Barbell Row', nameCs: 'Veslování s činkou', sets: 3, reps: '8-10', weightKg: null, rpe: rpe - 1, restSeconds: 90, rationale: 'Tloušťka středu zad' },
        { name: 'Barbell Curl', nameCs: 'Bicepsové zdvihy', sets: 3, reps: '10', weightKg: null, rpe: rpe - 1, restSeconds: 60, rationale: 'Biceps' },
      ],
    },
    {
      title: 'Legs (nohy + jádro)',
      exercises: [
        { name: 'Back Squat', nameCs: 'Dřep s činkou', sets: 4, reps: '5-6', weightKg: null, rpe, restSeconds: 180, rationale: 'King of legs' },
        { name: 'Romanian Deadlift', nameCs: 'Rumunský mrtvý tah', sets: 3, reps: '8', weightKg: null, rpe: rpe - 1, restSeconds: 120, rationale: 'Hamstringy + glutea' },
        { name: 'Walking Lunge', nameCs: 'Chůze s výpady', sets: 3, reps: '12/noha', weightKg: null, rpe: rpe - 1, restSeconds: 90, rationale: 'Unilaterální stability' },
        { name: 'Plank', nameCs: 'Plank', sets: 3, reps: '45s', weightKg: null, rpe: 6, restSeconds: 45, rationale: 'Core endurance' },
      ],
    },
  ];
}

export function getRecoverySplit(): SplitTemplate {
  return {
    title: 'Aktivní regenerace',
    exercises: [
      { name: 'Light Cardio', nameCs: 'Lehké kardio', sets: 1, reps: '20 min', weightKg: null, rpe: 4, restSeconds: 0, rationale: 'Krevní oběh, žádná zátěž' },
      { name: 'Mobility Flow', nameCs: 'Mobility flow', sets: 1, reps: '10 min', weightKg: null, rpe: 3, restSeconds: 0, rationale: 'Otevři kyčle a ramena' },
      { name: 'Foam Roll', nameCs: 'Foam roller', sets: 1, reps: '10 min', weightKg: null, rpe: 2, restSeconds: 0, rationale: 'Self-massage' },
    ],
  };
}

export const HEADLINE_MAP: Record<DailyBriefMood, string> = {
  push: 'Dnes přidáme. Recovery je tvůj parťák.',
  maintain: 'Drž tempo. Konzistence vyhrává.',
  recover: 'Dnes regenerace. Zítra zase tlačíme.',
};
