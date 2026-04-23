import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBundleDto } from './dto/create-bundle.dto';

@Injectable()
export class BundlesService {
  private readonly logger = new Logger(BundlesService.name);

  constructor(private prisma: PrismaService) {}

  async getUser(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { isAdmin: true },
    });
  }

  async list() {
    return (this.prisma as any).bundle.findMany({
      where: { isPublic: true },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getOne(id: string) {
    const bundle = await (this.prisma as any).bundle.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
    if (!bundle) throw new NotFoundException('Bundle not found');
    return bundle;
  }

  async create(userId: string, dto: CreateBundleDto) {
    return (this.prisma as any).bundle.create({
      data: {
        creatorId: userId,
        name: dto.name,
        description: dto.description ?? null,
        priceXP: dto.priceXP ?? 0,
        giftable: dto.giftable ?? false,
        isPublic: true,
        items: dto.items.map((item) => ({
          itemType: item.itemType,
          itemId: item.itemId,
        })),
      },
    });
  }

  async purchase(userId: string, bundleId: string) {
    return (this.prisma as any).$transaction(async (tx: any) => {
      const bundle = await tx.bundle.findUnique({
        where: { id: bundleId },
      });
      if (!bundle) throw new NotFoundException('Bundle not found');

      // Duplicate check inside transaction
      const existing = await tx.bundlePurchase.findFirst({
        where: { bundleId, userId },
      });
      if (existing) throw new ConflictException('Already purchased');

      if (bundle.priceXP > 0) {
        const progress = await tx.userProgress.findUnique({
          where: { userId },
        });
        if (!progress || progress.totalXP < bundle.priceXP) {
          throw new BadRequestException('Not enough XP');
        }

        await tx.userProgress.update({
          where: { userId },
          data: { totalXP: { decrement: bundle.priceXP } },
        });
      }

      return tx.bundlePurchase.create({
        data: { bundleId, userId },
      });
    });
  }
}
