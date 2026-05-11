import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChallengeDuelDto } from './dto/challenge-duel.dto';

const DURATION_MS: Record<string, number> = {
  HOUR_1: 3_600_000,
  HOUR_6: 21_600_000,
  HOUR_24: 86_400_000,
  HOUR_48: 172_800_000,
  WEEK: 604_800_000,
};

const USER_SELECT = { id: true, name: true, avatarUrl: true };

@Injectable()
export class DuelsService {
  constructor(private prisma: PrismaService) {}

  async challenge(userId: string, dto: ChallengeDuelDto) {
    if (userId === dto.challengedId) {
      throw new BadRequestException('Cannot challenge yourself');
    }

    const endsAtMs = DURATION_MS[dto.duration];
    if (!endsAtMs) {
      throw new BadRequestException('Invalid duration');
    }

    return (this.prisma as any).$transaction(async (tx: any) => {
      const target = await tx.user.findUnique({
        where: { id: dto.challengedId },
      });
      if (!target) throw new NotFoundException('User not found');

      const progress = await tx.userProgress.findUnique({
        where: { userId },
      });
      if (!progress || progress.totalXP < dto.xpBet) {
        throw new BadRequestException('Not enough XP');
      }

      await tx.userProgress.update({
        where: { userId },
        data: { totalXP: { decrement: dto.xpBet } },
      });

      return tx.duel.create({
        data: {
          challengerId: userId,
          challengedId: dto.challengedId,
          type: dto.type as any,
          metric: dto.metric,
          duration: dto.duration as any,
          xpBet: dto.xpBet,
          status: 'PENDING',
        },
        include: {
          challenger: { select: USER_SELECT },
          challenged: { select: USER_SELECT },
        },
      });
    });
  }

  async accept(userId: string, duelId: string) {
    const duel = await this.findDuelOrThrow(duelId);
    if (duel.challengedId !== userId) {
      throw new ForbiddenException('Only challenged user can accept');
    }
    if (duel.status !== 'PENDING') {
      throw new BadRequestException('Duel is not pending');
    }

    return (this.prisma as any).$transaction(async (tx: any) => {
      const progress = await tx.userProgress.findUnique({
        where: { userId },
      });
      if (!progress || progress.totalXP < duel.xpBet) {
        throw new BadRequestException('Not enough XP');
      }

      await tx.userProgress.update({
        where: { userId },
        data: { totalXP: { decrement: duel.xpBet } },
      });

      const ms = DURATION_MS[duel.duration] || 86_400_000;
      const now = new Date();

      return tx.duel.update({
        where: { id: duelId },
        data: {
          status: 'ACTIVE',
          startedAt: now,
          endsAt: new Date(now.getTime() + ms),
        },
        include: {
          challenger: { select: USER_SELECT },
          challenged: { select: USER_SELECT },
        },
      });
    });
  }

  async decline(userId: string, duelId: string) {
    const duel = await this.findDuelOrThrow(duelId);
    if (duel.challengedId !== userId) {
      throw new ForbiddenException('Only challenged user can decline');
    }
    if (duel.status !== 'PENDING') {
      throw new BadRequestException('Duel is not pending');
    }

    await this.prisma.duel.update({
      where: { id: duelId },
      data: { status: 'DECLINED' },
    });

    // Refund challenger's escrowed XP
    if (duel.xpBet > 0) {
      await this.prisma.userProgress.update({
        where: { userId: duel.challengerId },
        data: { totalXP: { increment: duel.xpBet } },
      });
    }

    return { message: 'Duel declined', refundedXP: duel.xpBet };
  }

  async submitScore(userId: string, duelId: string, score: number) {
    if (score > 10000) {
      throw new BadRequestException('Score too high');
    }

    const duel = await this.findDuelOrThrow(duelId);
    if (duel.status !== 'ACTIVE') {
      throw new BadRequestException('Duel is not active');
    }

    const isChallenger = duel.challengerId === userId;
    const isChallenged = duel.challengedId === userId;
    if (!isChallenger && !isChallenged) {
      throw new ForbiddenException('Not a participant');
    }

    return (this.prisma as any).$transaction(async (tx: any) => {
      // Re-read inside transaction to prevent double-payout when both participants submit concurrently.
      const fresh = await tx.duel.findUnique({ where: { id: duelId } });
      if (!fresh || fresh.status !== 'ACTIVE') {
        return fresh; // already settled by the other participant
      }

      const data: Record<string, any> = isChallenger
        ? { challengerScore: { increment: score } }
        : { challengedScore: { increment: score } };

      const isExpired = fresh.endsAt && fresh.endsAt < new Date();
      if (isExpired) {
        data.status = 'COMPLETED';
        const winnerId = this.computeWinner(fresh, isChallenger, score);
        data.winnerId = winnerId;

        if (winnerId) {
          await tx.userProgress.update({
            where: { userId: winnerId },
            data: { totalXP: { increment: fresh.xpBet * 2 } },
          });
        } else {
          await tx.userProgress.update({
            where: { userId: fresh.challengerId },
            data: { totalXP: { increment: fresh.xpBet } },
          });
          await tx.userProgress.update({
            where: { userId: fresh.challengedId },
            data: { totalXP: { increment: fresh.xpBet } },
          });
        }
      }

      return tx.duel.update({
        where: { id: duelId },
        data,
        include: {
          challenger: { select: USER_SELECT },
          challenged: { select: USER_SELECT },
        },
      });
    });
  }

  async getActive(userId: string) {
    return this.prisma.duel.findMany({
      where: {
        OR: [{ challengerId: userId }, { challengedId: userId }],
        status: { in: ['PENDING', 'ACTIVE'] },
      },
      include: {
        challenger: { select: USER_SELECT },
        challenged: { select: USER_SELECT },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getHistory(userId: string) {
    return this.prisma.duel.findMany({
      where: {
        OR: [{ challengerId: userId }, { challengedId: userId }],
        status: 'COMPLETED',
      },
      include: {
        challenger: { select: USER_SELECT },
        challenged: { select: USER_SELECT },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private async findDuelOrThrow(duelId: string) {
    const duel = await this.prisma.duel.findUnique({
      where: { id: duelId },
    });
    if (!duel) throw new NotFoundException('Duel not found');
    return duel;
  }

  private computeWinner(
    duel: any,
    isChallenger: boolean,
    newScore: number,
  ): string | null {
    const cScore = isChallenger
      ? duel.challengerScore + newScore
      : duel.challengerScore;
    const dScore = isChallenger
      ? duel.challengedScore
      : duel.challengedScore + newScore;

    if (cScore > dScore) return duel.challengerId;
    if (dScore > cScore) return duel.challengedId;
    return null;
  }
}
