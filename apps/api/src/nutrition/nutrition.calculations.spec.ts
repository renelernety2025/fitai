import { calculateNutritionTargets } from './nutrition.calculations';

const base = { age: 30, weightKg: 80, heightCm: 180, daysPerWeek: 4, goal: 'GENERAL' };

describe('calculateNutritionTargets', () => {
  it('computes Mifflin-St Jeor BMR with activity multiplier', () => {
    // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    // 4 days/week → 1.55 → TDEE 2759
    const t = calculateNutritionTargets(base);
    expect(t.dailyKcal).toBe(2759);
  });

  it.each([
    [0, 1.2],
    [3, 1.375],
    [5, 1.55],
    [6, 1.725],
    [7, 1.9],
  ])('daysPerWeek %i uses multiplier %s', (days, mult) => {
    const t = calculateNutritionTargets({ ...base, daysPerWeek: days });
    expect(t.dailyKcal).toBe(Math.round(1780 * mult));
  });

  it('WEIGHT_LOSS applies 0.8 deficit', () => {
    const t = calculateNutritionTargets({ ...base, goal: 'WEIGHT_LOSS' });
    expect(t.dailyKcal).toBe(Math.round(1780 * 1.55 * 0.8));
  });

  it.each(['HYPERTROPHY', 'STRENGTH'])('%s applies 1.1 surplus', (goal) => {
    const t = calculateNutritionTargets({ ...base, goal });
    expect(t.dailyKcal).toBe(Math.round(1780 * 1.55 * 1.1));
  });

  it('protein = 2 g/kg bodyweight', () => {
    expect(calculateNutritionTargets(base).dailyProteinG).toBe(160);
    expect(calculateNutritionTargets({ ...base, weightKg: 62.4 }).dailyProteinG).toBe(125);
  });

  it('fat = 25% of kcal, carbs are the remainder', () => {
    const t = calculateNutritionTargets(base);
    expect(t.dailyFatG).toBe(Math.round((t.dailyKcal * 0.25) / 9));
    expect(t.dailyCarbsG).toBe(Math.round((t.dailyKcal - t.dailyProteinG * 4 - t.dailyFatG * 9) / 4));
  });

  it('falls back to 75 kg / 175 cm / 30 y for missing measurements', () => {
    const t = calculateNutritionTargets({ daysPerWeek: 0, goal: 'GENERAL' });
    // BMR = 750 + 1093.75 - 150 + 5 = 1698.75 → *1.2 = 2038.5 → 2039 (banker-free rounding)
    expect(t.dailyKcal).toBe(Math.round((10 * 75 + 6.25 * 175 - 5 * 30 + 5) * 1.2));
    expect(t.dailyProteinG).toBe(150);
  });
});
