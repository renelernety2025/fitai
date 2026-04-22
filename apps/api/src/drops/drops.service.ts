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
    const drop = await (this.prisma as any).drop.findUnique({
      where: { id: dropId },
    });
    if (!drop) throw new NotFoundException('Drop not found');

    const now = new Date();
    if (new Date(drop.releaseDate) > now) {
      throw new BadRequestException('Drop not yet released');
    }
    if (new Date(drop.endDate) <= now) {
      throw new BadRequestException('Drop has ended');
    }
    if (drop.remainingEditions <= 0) {
      throw new ConflictException('Sold out');
    }

    const existing = await (
      this.prisma as any
    ).dropPurchase.findFirst({
      where: { dropId, userId },
    });
    if (existing) throw new ConflictException('Already purchased');

    const progress = await this.prisma.userProgress.findUnique({
      where: { userId },
    });
    if (!progress || progress.totalXP < drop.priceXP) {
      throw new BadRequestException('Not enough XP');
    }

    const editionNumber =
      drop.totalEditions - drop.remainingEditions + 1;

    const [purchase] = await this.prisma.$transaction([
      (this.prisma as any).dropPurchase.create({
        data: { dropId, userId, editionNumber },
      }),
      (this.prisma as any).drop.update({
        where: { id: dropId },
        data: { remainingEditions: { decrement: 1 } },
      }),
      this.prisma.userProgress.update({
        where: { userId },
        data: { totalXP: { decrement: drop.priceXP } },
      }),
    ]);

    return purchase;
  }

  async myPurchases(userId: string) {
    return (this.prisma as any).dropPurchase.findMany({
      where: { userId },
      include: { drop: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
