import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGearDto } from './dto/create-gear.dto';
import { UpdateGearDto } from './dto/update-gear.dto';
import { GearReviewDto } from './dto/gear-review.dto';

@Injectable()
export class GearService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    return this.prisma.gearItem.findMany({
      where: { userId, isActive: true },
      include: {
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateGearDto) {
    return this.prisma.gearItem.create({
      data: {
        userId,
        category: dto.category as any,
        brand: dto.brand,
        model: dto.model,
        purchaseDate: dto.purchaseDate
          ? new Date(dto.purchaseDate)
          : undefined,
        priceKc: dto.priceKc,
        maxSessions: dto.maxSessions,
      },
    });
  }

  async update(userId: string, gearId: string, dto: UpdateGearDto) {
    const item = await this.findOwnedOrThrow(userId, gearId);

    return this.prisma.gearItem.update({
      where: { id: gearId },
      data: {
        ...(dto.category && { category: dto.category as any }),
        ...(dto.brand && { brand: dto.brand }),
        ...(dto.model && { model: dto.model }),
        ...(dto.purchaseDate && {
          purchaseDate: new Date(dto.purchaseDate),
        }),
        ...(dto.priceKc !== undefined && { priceKc: dto.priceKc }),
        ...(dto.maxSessions !== undefined && {
          maxSessions: dto.maxSessions,
        }),
      },
    });
  }

  async remove(userId: string, gearId: string) {
    await this.findOwnedOrThrow(userId, gearId);

    await this.prisma.gearItem.update({
      where: { id: gearId },
      data: { isActive: false },
    });
    return { ok: true };
  }

  async review(userId: string, gearId: string, dto: GearReviewDto) {
    const item = await this.prisma.gearItem.findUnique({
      where: { id: gearId },
    });
    if (!item) throw new NotFoundException('Gear not found');

    return this.prisma.gearReview.upsert({
      where: {
        gearItemId_userId: { gearItemId: gearId, userId },
      },
      update: { rating: dto.rating, text: dto.text },
      create: {
        gearItemId: gearId,
        userId,
        rating: dto.rating,
        text: dto.text,
      },
    });
  }

  async incrementSession(userId: string, gearId: string) {
    await this.findOwnedOrThrow(userId, gearId);

    return this.prisma.gearItem.update({
      where: { id: gearId },
      data: { sessionCount: { increment: 1 } },
    });
  }

  private async findOwnedOrThrow(userId: string, gearId: string) {
    const item = await this.prisma.gearItem.findUnique({
      where: { id: gearId },
    });
    if (!item) throw new NotFoundException('Gear not found');
    if (item.userId !== userId) {
      throw new ForbiddenException('Not your gear');
    }
    return item;
  }
}
