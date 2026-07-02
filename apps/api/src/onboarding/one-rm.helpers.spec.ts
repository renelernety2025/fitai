import { estimate1RM, workingWeightFromGoal } from './one-rm.helpers';

describe('estimate1RM (Epley)', () => {
  it('returns 0 for non-positive reps or weight', () => {
    expect(estimate1RM(100, 0)).toBe(0);
    expect(estimate1RM(100, -1)).toBe(0);
    expect(estimate1RM(0, 5)).toBe(0);
    expect(estimate1RM(-10, 5)).toBe(0);
  });

  it('returns the weight itself for a single rep', () => {
    expect(estimate1RM(120, 1)).toBe(120);
  });

  it('applies Epley formula with rounding', () => {
    // 100 × (1 + 5/30) = 116.67 → 117
    expect(estimate1RM(100, 5)).toBe(117);
    // 80 × (1 + 10/30) = 106.67 → 107
    expect(estimate1RM(80, 10)).toBe(107);
    // 60 × (1 + 30/30) = 120
    expect(estimate1RM(60, 30)).toBe(120);
  });
});

describe('workingWeightFromGoal', () => {
  it('STRENGTH → 85% 1RM rounded to 2.5, 5 reps', () => {
    // 100 * 0.85 = 85 → 85/2.5=34 → 85
    expect(workingWeightFromGoal(100, 'STRENGTH')).toEqual({ weight: 85, reps: 5 });
  });

  it('HYPERTROPHY → 72% 1RM, 10 reps', () => {
    // 100 * 0.72 = 72 → round(28.8)*2.5 = 72.5
    expect(workingWeightFromGoal(100, 'HYPERTROPHY')).toEqual({ weight: 72.5, reps: 10 });
  });

  it('ENDURANCE → 60% 1RM, 15 reps', () => {
    expect(workingWeightFromGoal(100, 'ENDURANCE')).toEqual({ weight: 60, reps: 15 });
  });

  it('unknown goal → 65% 1RM, 12 reps', () => {
    expect(workingWeightFromGoal(100, 'WEIGHT_LOSS')).toEqual({ weight: 65, reps: 12 });
  });

  it('always returns multiples of 2.5 kg', () => {
    for (const oneRM of [37, 61, 83, 111, 147]) {
      for (const goal of ['STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'OTHER']) {
        const { weight } = workingWeightFromGoal(oneRM, goal);
        expect(weight % 2.5).toBe(0);
      }
    }
  });
});
