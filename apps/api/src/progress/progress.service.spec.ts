import { ProgressService } from './progress.service';

function makePrismaMock(existing: Record<string, unknown> | null) {
  return {
    userProgress: {
      findUnique: jest.fn().mockResolvedValue(existing),
      create: jest.fn().mockResolvedValue({
        userId: 'u1',
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastWorkoutDate: null,
        totalSessions: 0,
        totalMinutes: 0,
      }),
      update: jest.fn().mockResolvedValue({}),
    },
  };
}

const baseProgress = {
  userId: 'u1',
  totalXP: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: null as Date | null,
  totalSessions: 0,
  totalMinutes: 0,
};

const session = (over: Partial<{ durationSeconds: number; accuracyScore: number; completedFullVideo: boolean }> = {}) => ({
  durationSeconds: 600,
  accuracyScore: 0,
  completedFullVideo: false,
  ...over,
});

describe('ProgressService.updateProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-02T12:00:00Z'));
  });
  afterEach(() => jest.useRealTimers());

  it('awards 10 XP per full minute', async () => {
    const prisma = makePrismaMock({ ...baseProgress });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress('u1', session({ durationSeconds: 599 }));
    // 9 full minutes = 90 XP, first workout → streak 1, multiplier 1
    expect(result.xpGained).toBe(90);
  });

  it('adds +20 XP for accuracy >= 80 and +50 for full video', async () => {
    const prisma = makePrismaMock({ ...baseProgress });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress(
      'u1',
      session({ durationSeconds: 600, accuracyScore: 80, completedFullVideo: true }),
    );
    expect(result.xpGained).toBe(100 + 20 + 50);
  });

  it('does not add accuracy bonus below 80', async () => {
    const prisma = makePrismaMock({ ...baseProgress });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress('u1', session({ accuracyScore: 79 }));
    expect(result.xpGained).toBe(100);
  });

  it('starts streak at 1 on first workout', async () => {
    const prisma = makePrismaMock({ ...baseProgress });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress('u1', session());
    expect(result.currentStreak).toBe(1);
  });

  it('increments streak on consecutive-day workout', async () => {
    const prisma = makePrismaMock({
      ...baseProgress,
      currentStreak: 1,
      lastWorkoutDate: new Date('2026-07-01T18:00:00Z'),
    });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress('u1', session());
    expect(result.currentStreak).toBe(2);
  });

  it('keeps streak unchanged on same-day workout', async () => {
    const prisma = makePrismaMock({
      ...baseProgress,
      currentStreak: 3,
      lastWorkoutDate: new Date('2026-07-02T06:00:00Z'),
    });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress('u1', session());
    expect(result.currentStreak).toBe(3);
  });

  it('resets streak to 1 after 2+ days off', async () => {
    const prisma = makePrismaMock({
      ...baseProgress,
      currentStreak: 7,
      longestStreak: 7,
      lastWorkoutDate: new Date('2026-06-29T18:00:00Z'),
    });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress('u1', session());
    expect(result.currentStreak).toBe(1);
  });

  it.each([
    [1, 1],
    [2, 1.5],
    [4, 1.5],
    [5, 2],
    [9, 2],
    [10, 3],
  ])('streak %i applies multiplier %s', async (streakAfter, multiplier) => {
    const prisma = makePrismaMock({
      ...baseProgress,
      currentStreak: streakAfter - 1,
      lastWorkoutDate: streakAfter > 1 ? new Date('2026-07-01T18:00:00Z') : null,
    });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress('u1', session({ durationSeconds: 600 }));
    expect(result.xpGained).toBe(Math.round(100 * multiplier));
  });

  it('flags levelUp when crossing a threshold and preserves longestStreak', async () => {
    const prisma = makePrismaMock({
      ...baseProgress,
      totalXP: 150,
      currentStreak: 2,
      longestStreak: 9,
      lastWorkoutDate: new Date('2026-06-29T18:00:00Z'), // 3 days ago → reset to 1
    });
    const svc = new ProgressService(prisma as never);
    const result = await svc.updateProgress('u1', session({ durationSeconds: 600 }));
    // 100 XP * 1 (streak reset to 1) → 250 total → level 2
    expect(result.levelUp).toBe(true);
    expect(result.totalXP).toBe(250);
    const updateArg = prisma.userProgress.update.mock.calls[0][0];
    expect(updateArg.data.longestStreak).toBe(9);
  });

  it('creates a progress row for a new user', async () => {
    const prisma = makePrismaMock(null);
    const svc = new ProgressService(prisma as never);
    await svc.updateProgress('u1', session());
    expect(prisma.userProgress.create).toHaveBeenCalledWith({ data: { userId: 'u1' } });
  });
});
