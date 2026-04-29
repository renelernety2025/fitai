import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaidChallengeDto } from './dto/create-paid-challenge.dto';

const USER_SELECT = { id: true, name: true, avatarUrl: true };

@Injectable()
export class PaidChallengesService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.paidChallenge.findMany({
      where: { status: { in: ['OPEN', 'ACTIVE'] } },
      include: {
        createdBy: { select: USER_SELECT },
        _count: { select: { participants: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async detail(id: string) {
    const challenge = await this.prisma.paidChallenge.findUnique({
      where: { id },
      include: {
        createdBy: { select: USER_SELECT },
        winner: { select: USER_SELECT },
        participants: {
          include: { user: { select: USER_SELECT } },
          orderBy: { currentScore: 'desc' },
        },
      },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async create(userId: string, dto: CreatePaidChallengeDto) {
    return this.prisma.paidChallenge.create({
      data: {
        name: dto.name,
        description: dto.description,
        entryFeeXP: dto.entryFeeXP,
        potXP: 0,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        metric: dto.metric,
        maxParticipants: dto.maxParticipants ?? 100,
        status: 'OPEN',
        createdById: userId,
      },
    });
  }

  async join(userId: string, challengeId: string) {
    const challenge = await this.findOrThrow(challengeId);

    if (challenge.status !== 'OPEN') {
      throw new BadRequestException('Challenge is not open');
    }

    const count = await this.prisma.paidChallengeEntry.count({
      where: { challengeId },
    });
    if (count >= challenge.maxParticipants) {
      throw new BadRequestException('Challenge is full');
    }

    const existing = await this.prisma.paidChallengeEntry.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    });
    if (existing) {
      throw new BadRequestException('Already joined');
    }

    return (this.prisma as any).$transaction(async (tx: any) => {
      if (challenge.entryFeeXP > 0) {
        const progress = await tx.userProgress.findUnique({
          where: { userId },
        });
        if (!progress || progress.totalXP < challenge.entryFeeXP) {
          throw new BadRequestException('Not enough XP');
        }
        await tx.userProgress.update({
          where: { userId },
          data: { totalXP: { decrement: challenge.entryFeeXP } },
        });
      }

      await tx.paidChallenge.update({
        where: { id: challengeId },
        data: { potXP: { increment: challenge.entryFeeXP } },
      });

      return tx.paidChallengeEntry.create({
        data: { challengeId, userId, paid: true },
      });
    });
  }

  async complete(userId: string, challengeId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin only');
    }

    const challenge = await this.findOrThrow(challengeId);
    if (challenge.status === 'COMPLETED') {
      throw new BadRequestException('Already completed');
    }

    const topEntry = await this.prisma.paidChallengeEntry.findFirst({
      where: { challengeId },
      orderBy: { currentScore: 'desc' },
    });

    return (this.prisma as any).$transaction(async (tx: any) => {
      const winnerId = topEntry?.userId ?? null;

      if (winnerId && challenge.potXP > 0) {
        await tx.userProgress.update({
          where: { userId: winnerId },
          data: { totalXP: { increment: challenge.potXP } },
        });
      }

      return tx.paidChallenge.update({
        where: { id: challengeId },
        data: { status: 'COMPLETED', winnerId },
        include: {
          winner: { select: USER_SELECT },
          _count: { select: { participants: true } },
        },
      });
    });
  }

  private async findOrThrow(id: string) {
    const c = await this.prisma.paidChallenge.findUnique({
      where: { id },
    });
    if (!c) throw new NotFoundException('Challenge not found');
    return c;
  }
}
