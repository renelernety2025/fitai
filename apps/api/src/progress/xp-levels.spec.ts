import { getLevelForXP, XP_LEVELS } from './xp-levels';

describe('XP_LEVELS', () => {
  it('has 5 ascending levels starting at 0 XP', () => {
    expect(XP_LEVELS).toHaveLength(5);
    expect(XP_LEVELS[0].minXP).toBe(0);
    for (let i = 1; i < XP_LEVELS.length; i++) {
      expect(XP_LEVELS[i].minXP).toBeGreaterThan(XP_LEVELS[i - 1].minXP);
      expect(XP_LEVELS[i].level).toBe(XP_LEVELS[i - 1].level + 1);
    }
  });
});

describe('getLevelForXP', () => {
  it.each([
    [0, 1, 'Začátečník'],
    [199, 1, 'Začátečník'],
    [200, 2, 'Pokročilý'],
    [499, 2, 'Pokročilý'],
    [500, 3, 'Expert'],
    [999, 3, 'Expert'],
    [1000, 4, 'Mistr'],
    [1999, 4, 'Mistr'],
    [2000, 5, 'Legenda'],
    [1000000, 5, 'Legenda'],
  ])('%i XP → level %i (%s)', (xp, level, name) => {
    const result = getLevelForXP(xp);
    expect(result.level).toBe(level);
    expect(result.name).toBe(name);
  });

  it('falls back to level 1 for negative XP', () => {
    expect(getLevelForXP(-50).level).toBe(1);
  });
});
