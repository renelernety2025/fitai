import { BadRequestException } from '@nestjs/common';
import { PaidChallengesService } from './paid-challenges.service';

function makeService(over: { debitCount?: number; entryFeeXP?: number } = {}) {
  const challenge = {
    id: 'c1',
    status: 'OPEN',
    maxParticipants: 100,
    entryFeeXP: over.entryFeeXP ?? 100,
  };
  const tx = {
    userProgress: {
      updateMany: jest.fn().mockResolvedValue({ count: over.debitCount ?? 1 }),
    },
    paidChallenge: { update: jest.fn().mockResolvedValue({}) },
    paidChallengeEntry: { create: jest.fn().mockResolvedValue({ id: 'e1' }) },
  };
  const prisma = {
    paidChallenge: { findUnique: jest.fn().mockResolvedValue(challenge) },
    paidChallengeEntry: {
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn((cb: (t: unknown) => unknown) => cb(tx)),
  };
  return { svc: new PaidChallengesService(prisma as never), tx };
}

describe('PaidChallengesService.join — atomic XP debit', () => {
  it('debits the entry fee with a gte balance filter', async () => {
    const { svc, tx } = makeService();
    await svc.join('u1', 'c1');
    expect(tx.userProgress.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', totalXP: { gte: 100 } },
      data: { totalXP: { decrement: 100 } },
    });
  });

  it('throws Not enough XP and creates no entry when debit matches 0 rows', async () => {
    const { svc, tx } = makeService({ debitCount: 0 });
    await expect(svc.join('u1', 'c1')).rejects.toThrow(BadRequestException);
    expect(tx.paidChallenge.update).not.toHaveBeenCalled(); // pot untouched
    expect(tx.paidChallengeEntry.create).not.toHaveBeenCalled();
  });

  it('skips the debit entirely for a free challenge', async () => {
    const { svc, tx } = makeService({ entryFeeXP: 0 });
    await svc.join('u1', 'c1');
    expect(tx.userProgress.updateMany).not.toHaveBeenCalled();
    expect(tx.paidChallengeEntry.create).toHaveBeenCalled();
  });
});
