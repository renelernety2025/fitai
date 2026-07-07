import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DropsService {
  private readonly logger = new Logger(DropsService.name);

  constructor(private prisma: PrismaService) {}

  async list() {
    const now = new Date();
    return (this.prisma as any).drop.findMany({
      where: {
        OR: [
          { endDate: { gt: now } },
          { releaseDate: { gt: now } },
        ],
      },
      orderBy: { releaseDate: 'asc' },
    });
  }

  async getOne(userId: string, id: string) {
    const drop = await (this.prisma as any).drop.findUnique({
      where: { id },
    });
    if (!drop) throw new NotFoundException('Drop not found');

    const myPurchase = await (
      this.prisma as any
    ).dropPurchase.findFirst({
      where: { dropId: id, userId },
    });

    return {
      ...drop,
      purchased: !!myPurchase,
      editionNumber: myPurchase?.editionNumber ?? null,
    };
  }

  async purchase(userId: string, dropId: string) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      // Read inside transaction
      const drop = await tx.drop.findUnique({ where: { id: dropId } });
      if (!drop) throw new NotFoundException('Drop not found');

      const now = new Date();
      if (now < new Date(drop.releaseDate)) {
        throw new BadRequestException('Drop not released yet');
      }
      if (now > new Date(drop.endDate)) {
        throw new BadRequestException('Drop has ended');
      }
      if (drop.remainingEditions <= 0) {
        throw new BadRequestException('Sold out');
      }

      // Check duplicate
      const existing = await tx.dropPurchase.findUnique({
        where: { dropId_userId: { dropId, userId } },
      });
      if (existing) throw new ConflictException('Already purchased');

      // Atomic XP debit — the gte filter makes the balance check and the
      // decrement a single conditional write. Without it, two concurrent
      // purchases of DIFFERENT drops could both pass a separate balance read
      // and drive totalXP negative (TOCTOU). count===0 == insufficient funds.
      if (drop.priceXP > 0) {
        const debit = await tx.userProgress.updateMany({
          where: { userId, totalXP: { gte: drop.priceXP } },
          data: { totalXP: { decrement: drop.priceXP } },
        });
        if (debit.count === 0) throw new BadRequestException('Not enough XP');
      }

      // Atomic stock decrement — if sold out here, the whole transaction
      // (including the XP debit above) rolls back.
      const updated = await tx.drop.updateMany({
        where: { id: dropId, remainingEditions: { gt: 0 } },
        data: { remainingEditions: { decrement: 1 } },
      });
      if (updated.count === 0) throw new BadRequestException('Sold out');

      // Get updated drop for edition number
      const updatedDrop = await tx.drop.findUnique({
        where: { id: dropId },
      });
      const editionNumber =
        drop.totalEditions - updatedDrop.remainingEditions;

      // Create purchase
      return tx.dropPurchase.create({
        data: { dropId, userId, editionNumber },
      });
    });
  }

  async myPurchases(userId: string) {
    return (this.prisma as any).dropPurchase.findMany({
      where: { userId },
      include: { drop: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
