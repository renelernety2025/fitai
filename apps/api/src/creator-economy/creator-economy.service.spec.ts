import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatorEconomyService } from './creator-economy.service';

function makeMocks(over: { debitCount?: number; creator?: Record<string, unknown> | null } = {}) {
  const creator =
    over.creator === null
      ? null
      : {
          userId: 'creator1',
          isApproved: true,
          subscriptionPriceXP: 500,
          ...over.creator,
        };
  const prisma = {
    creatorProfile: {
      findUnique: jest.fn().mockResolvedValue(creator),
      update: jest.fn().mockReturnValue({ op: 'profileUpdate' }),
    },
    creatorSubscription: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue({ op: 'subCreate' }),
      update: jest.fn().mockReturnValue({ op: 'subUpdate' }),
    },
    creatorTip: {
      create: jest.fn().mockReturnValue({ op: 'tipCreate' }),
    },
    userProgress: {
      updateMany: jest.fn().mockResolvedValue({ count: over.debitCount ?? 1 }),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({ name: 'Tester' }),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };
  const notify = { create: jest.fn().mockResolvedValue(undefined) };
  return { prisma, notify, svc: new CreatorEconomyService(prisma as never, notify as never) };
}

describe('CreatorEconomyService.subscribe — atomic XP debit', () => {
  it('debits with a gte balance filter in a single updateMany', async () => {
    const { prisma, svc } = makeMocks();
    const result = await svc.subscribe('user1', 'creator1');
    expect(prisma.userProgress.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user1', totalXP: { gte: 500 } },
      data: { totalXPSpent: { increment: 500 } },
    });
    expect(result).toEqual({ subscribed: true, xpDeducted: 500 });
  });

  it('throws BadRequest when balance is insufficient (count=0) and writes nothing', async () => {
    const { prisma, svc } = makeMocks({ debitCount: 0 });
    await expect(svc.subscribe('user1', 'creator1')).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.creatorSubscription.create).not.toHaveBeenCalled();
  });

  it('rejects self-subscription before touching the balance', async () => {
    const { prisma, svc } = makeMocks();
    await expect(svc.subscribe('user1', 'user1')).rejects.toThrow(BadRequestException);
    expect(prisma.userProgress.updateMany).not.toHaveBeenCalled();
  });

  it('rejects unknown or unapproved creators', async () => {
    const { svc } = makeMocks({ creator: null });
    await expect(svc.subscribe('user1', 'creator1')).rejects.toThrow(NotFoundException);
    const { svc: svc2 } = makeMocks({ creator: { isApproved: false } });
    await expect(svc2.subscribe('user1', 'creator1')).rejects.toThrow(NotFoundException);
  });

  it('credits the creator 70% of the price inside the transaction', async () => {
    const { prisma, svc } = makeMocks();
    await svc.subscribe('user1', 'creator1');
    expect(prisma.creatorProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalXPEarned: { increment: 350 },
          subscriberCount: { increment: 1 },
        }),
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});

describe('CreatorEconomyService.tip — atomic XP debit', () => {
  it('debits the exact tip amount with gte filter', async () => {
    const { prisma, svc } = makeMocks();
    const result = await svc.tip('user1', 'creator1', 200, 'great content');
    expect(prisma.userProgress.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user1', totalXP: { gte: 200 } },
      data: { totalXPSpent: { increment: 200 } },
    });
    expect(result).toEqual({ tipped: true, xpDeducted: 200 });
  });

  it('throws BadRequest on insufficient balance without crediting the creator', async () => {
    const { prisma, svc } = makeMocks({ debitCount: 0 });
    await expect(svc.tip('user1', 'creator1', 200)).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.creatorTip.create).not.toHaveBeenCalled();
  });

  it('rejects self-tips before touching the balance', async () => {
    const { prisma, svc } = makeMocks();
    await expect(svc.tip('user1', 'user1', 100)).rejects.toThrow(BadRequestException);
    expect(prisma.userProgress.updateMany).not.toHaveBeenCalled();
  });

  it('credits the creator floor(70%) of the tip', async () => {
    const { prisma, svc } = makeMocks();
    await svc.tip('user1', 'creator1', 333);
    expect(prisma.creatorProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ totalXPEarned: { increment: 233 } }),
      }),
    );
  });
});
