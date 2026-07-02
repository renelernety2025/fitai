import { avg, calcRecoveryScore, calcRecoveryScoreSmart, classifyRecovery } from './ai-insights.helpers';

describe('avg', () => {
  it('averages numeric values of a key', () => {
    expect(avg([{ x: 2 }, { x: 4 }], 'x')).toBe(3);
  });

  it('ignores non-numeric values and returns null when none are numeric', () => {
    expect(avg([{ x: 2 }, { x: null }, { x: 'bad' }], 'x')).toBe(2);
    expect(avg([{ x: null }], 'x')).toBeNull();
    expect(avg([], 'x' as never)).toBeNull();
  });
});

describe('calcRecoveryScore', () => {
  it('returns neutral 60 with no check-ins', () => {
    expect(calcRecoveryScore([])).toBe(60);
  });

  it('scores a well-rested athlete high', () => {
    const score = calcRecoveryScore([{ sleepHours: 8.5, energy: 5, soreness: 1, stress: 1 }]);
    // 50 + min(20,12) + 16 + 12 + 10 = 100
    expect(score).toBe(100);
  });

  it('scores an exhausted athlete low', () => {
    const score = calcRecoveryScore([{ sleepHours: 4, energy: 1, soreness: 5, stress: 5 }]);
    // 50 - 15 - 16 - 12 - 10 = -3 → clamped to 0
    expect(score).toBe(0);
  });

  it('clamps sleep contribution to [-15, +20]', () => {
    const short = calcRecoveryScore([{ sleepHours: 0 }]);
    expect(short).toBe(35); // 50 - 15
    const long = calcRecoveryScore([{ sleepHours: 12 }]);
    expect(long).toBe(70); // 50 + 20
  });

  it('always returns 0-100 integers', () => {
    for (const c of [
      [{ sleepHours: 10, energy: 5, soreness: 1, stress: 1 }],
      [{ sleepHours: 2, energy: 1, soreness: 5, stress: 5 }],
      [{ energy: 3 }],
    ]) {
      const s = calcRecoveryScore(c);
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
});

describe('calcRecoveryScoreSmart', () => {
  const checkIns = [{ sleepHours: 7, energy: 4, soreness: 2, stress: 2 }];

  it('falls back to self-reported when no wearable data', () => {
    const result = calcRecoveryScoreSmart(checkIns, []);
    expect(result.source).toBe('self-reported');
    expect(result.score).toBe(calcRecoveryScore(checkIns));
    expect(result.hrv).toBeNull();
    expect(result.restingHR).toBeNull();
  });

  it('uses wearables when HRV is present', () => {
    const result = calcRecoveryScoreSmart(checkIns, [
      { dataType: 'hrv', value: 55 },
      { dataType: 'sleep', value: 8 },
      { dataType: 'resting_hr', value: 55 },
    ]);
    expect(result.source).toBe('wearables');
    expect(result.hrv).toBe(55);
    expect(result.restingHR).toBe(55);
    expect(result.sleepHours).toBe(8);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('prefers wearable sleep over self-reported sleep', () => {
    const selfReported = calcRecoveryScoreSmart(checkIns, [{ dataType: 'sleep', value: 3 }]);
    const wellSlept = calcRecoveryScoreSmart(checkIns, [{ dataType: 'sleep', value: 9 }]);
    expect(wellSlept.score).toBeGreaterThan(selfReported.score);
    expect(selfReported.sleepHours).toBe(3);
  });

  it('averages multiple wearable points per type', () => {
    const result = calcRecoveryScoreSmart([], [
      { dataType: 'hrv', value: 40 },
      { dataType: 'hrv', value: 60 },
    ]);
    expect(result.hrv).toBe(50);
  });
});

describe('classifyRecovery', () => {
  it.each([
    [95, 5, 'fresh'],
    [80, 5, 'fresh'],
    [79, 5, 'normal'],
    [55, 5, 'normal'],
    [54, 5, 'fatigued'],
    [35, 5, 'fatigued'],
    [34, 5, 'overreached'],
    [0, 5, 'overreached'],
  ])('score %i with %i sessions → %s', (score, sessions, expected) => {
    expect(classifyRecovery(score, sessions)).toBe(expected);
  });

  it('low session count keeps low scores at fatigued instead of overreached', () => {
    expect(classifyRecovery(20, 2)).toBe('fatigued');
    expect(classifyRecovery(20, 3)).toBe('overreached');
  });
});
