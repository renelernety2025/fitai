export interface TodayAction {
  type: 'streak' | 'recovery' | 'comeback' | 'nutrition' | 'default';
  headline: string;
  rationale: string;
  ctaLabel: string;
  ctaLink: string;
}

interface ActionContext {
  currentStreak: number;
  daysSinceLastWorkout: number | null;
  todaySoreness: number | null;
  yesterdayKcal: number | null;
  dailyKcalGoal: number | null;
  hasWorkoutToday: boolean;
  firstName: string;
}

export function determineTodayAction(ctx: ActionContext): TodayAction {
  // 1. Streak at risk
  if (ctx.currentStreak > 3 && !ctx.hasWorkoutToday) {
    return {
      type: 'streak',
      headline: `Neztrat ${ctx.currentStreak}denni streak!`,
      rationale: 'Staci 5 minut — micro-workout udrzi serii.',
      ctaLabel: 'Micro-workout',
      ctaLink: '/micro-workout',
    };
  }

  // 2. High soreness
  if (ctx.todaySoreness != null && ctx.todaySoreness >= 4) {
    return {
      type: 'recovery',
      headline: 'Dej si recovery den',
      rationale: 'Svaly potrebuji odpocinek — foam rolling nebo prochazka.',
      ctaLabel: 'Zalogovat habits',
      ctaLink: '/habity',
    };
  }

  // 3. Long absence
  if (ctx.daysSinceLastWorkout != null && ctx.daysSinceLastWorkout >= 3) {
    return {
      type: 'comeback',
      headline: `${ctx.daysSinceLastWorkout} dni bez treninku — cas zacit!`,
      rationale: 'Zacni lehcim treninkem, telo si rychle zvykne.',
      ctaLabel: 'Zacit trenink',
      ctaLink: '/gym',
    };
  }

  // 4. Low nutrition
  if (
    ctx.yesterdayKcal != null &&
    ctx.dailyKcalGoal != null &&
    ctx.dailyKcalGoal > 0 &&
    ctx.yesterdayKcal < ctx.dailyKcalGoal * 0.7
  ) {
    return {
      type: 'nutrition',
      headline: `Vcera jen ${Math.round(ctx.yesterdayKcal)} kcal — dopln bilkoviny`,
      rationale: `Cil je ${Math.round(ctx.dailyKcalGoal)} kcal. Nedostatecny prijem brzdi regeneraci.`,
      ctaLabel: 'Otevrit vyzivu',
      ctaLink: '/vyziva',
    };
  }

  // 5. Default
  return {
    type: 'default',
    headline: `${ctx.firstName}, dnes je tvuj den!`,
    rationale: 'Konzistence je klic. Kazdy trenink se pocita.',
    ctaLabel: 'Zacit trenink',
    ctaLink: '/gym',
  };
}
