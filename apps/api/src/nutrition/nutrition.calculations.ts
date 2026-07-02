export interface NutritionProfileInput {
  age?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  daysPerWeek: number;
  goal: string;
}

export interface NutritionTargets {
  dailyKcal: number;
  dailyProteinG: number;
  dailyCarbsG: number;
  dailyFatG: number;
}

/** Mifflin-St Jeor BMR + activity multiplier → recommended daily targets */
export function calculateNutritionTargets(profile: NutritionProfileInput): NutritionTargets {
  const weight = profile.weightKg ?? 75;
  const height = profile.heightCm ?? 175;
  const age = profile.age ?? 30;
  // Assume male formula (no gender field yet)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  // Standard Mifflin-St Jeor discrete activity multipliers
  const d = profile.daysPerWeek;
  const activity = d === 0 ? 1.2 : d <= 3 ? 1.375 : d <= 5 ? 1.55 : d <= 6 ? 1.725 : 1.9;
  let tdee = bmr * activity;

  // Goal adjustment
  if (profile.goal === 'WEIGHT_LOSS') tdee *= 0.8;
  else if (profile.goal === 'HYPERTROPHY' || profile.goal === 'STRENGTH') tdee *= 1.1;

  const kcal = Math.round(tdee);
  const proteinG = Math.round(weight * 2);
  const fatG = Math.round((kcal * 0.25) / 9);
  const carbsG = Math.round((kcal - proteinG * 4 - fatG * 9) / 4);
  return { dailyKcal: kcal, dailyProteinG: proteinG, dailyCarbsG: carbsG, dailyFatG: fatG };
}
