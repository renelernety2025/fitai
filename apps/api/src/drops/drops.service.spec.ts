import { BadRequestException, ConflictException } from '@nestjs/common';
import { DropsService } from './drops.service';

const FUTURE = '2999-01-01T00:00:00Z';
const PAST = '2000-01-01T00:00:00Z';

function makeTx(over: { debitCount?: number; stockCount?: number; existing?: unknown } = {}) {
  const drop = {
    id: 'd1',
    priceXP: 100,
    remainingEditions: 5,
    totalEditions: 10,
    releaseDate: PAST,
    endDate: FUTURE,
  };
  return {
    drop: {
      findUnique: jest
        .fn()
        .mockResolvedValueOnce(drop) // initial read
        .mockResolvedValue({ ...drop, remainingEditions: 4 }), // post-decrement
      updateMany: jest.fn().mockResolvedValue({ count: over.stockCount ?? 1 }),
    },
    dropPurchase: {
      findUnique: jest.fn().mockResolvedValue(over.existing ?? null),
      create: jest.fn().mockResolvedValue({ id: 'p1' }),
    },
    userProgress: {
      updateMany: jest.fn().mockResolvedValue({ count: over.debitCount ?? 1 }),
    },
  };
}

function makeService(tx: ReturnType<typeof makeTx>) {
  const prisma = { $transaction: jest.fn((cb: (t: unknown) => unknown) => cb(tx)) };
  return new DropsService(prisma as never);
}

describe('DropsService.purchase — atomic XP debit', () => {
  it('debits XP with a gte balance filter (single conditional write)', async () => {
    const tx = makeTx();
    await makeService(tx).purchase('u1', 'd1');
    expect(tx.userProgress.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', totalXP: { gte: 100 } },
      data: { totalXP: { decrement: 100 } },
    });
  });

  it('throws Not enough XP and creates no purchase when debit matches 0 rows', async () => {
    const tx = makeTx({ debitCount: 0 });
    await expect(makeService(tx).purchase('u1', 'd1')).rejects.toThrow(BadRequestException);
    expect(tx.drop.updateMany).not.toHaveBeenCalled(); // stock untouched
    expect(tx.dropPurchase.create).not.toHaveBeenCalled();
  });

  it('debits XP before touching stock (fail-fast ordering)', async () => {
    const tx = makeTx();
    await makeService(tx).purchase('u1', 'd1');
    const debitOrder = tx.userProgress.updateMany.mock.invocationCallOrder[0];
    const stockOrder = tx.drop.updateMany.mock.invocationCallOrder[0];
    expect(debitOrder).toBeLessThan(stockOrder);
  });

  it('rejects duplicate purchase before any debit', async () => {
    const tx = makeTx({ existing: { id: 'p0' } });
    await expect(makeService(tx).purchase('u1', 'd1')).rejects.toThrow(ConflictException);
    expect(tx.userProgress.updateMany).not.toHaveBeenCalled();
  });

  it('throws Sold out (rolls back) when stock decrement matches 0 rows', async () => {
    const tx = makeTx({ stockCount: 0 });
    await expect(makeService(tx).purchase('u1', 'd1')).rejects.toThrow('Sold out');
    expect(tx.dropPurchase.create).not.toHaveBeenCalled();
  });
});
