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

  async list() {
    return (this.prisma as any).bundle.findMany({
      where: { isPublic: true },
      include: {
        items: true,
        user: {
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
        items: true,
        user: {
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
        userId,
        name: dto.name,
        description: dto.description ?? null,
        priceXP: dto.priceXP ?? 0,
        giftable: dto.giftable ?? false,
        isPublic: true,
        items: {
          create: dto.items.map((item) => ({
            itemType: item.itemType,
            itemId: item.itemId,
          })),
        },
      },
      include: { items: true },
    });
  }

  async purchase(userId: string, bundleId: string) {
    const bundle = await (this.prisma as any).bundle.findUnique({
      where: { id: bundleId },
      include: { items: true },
    });
    if (!bundle) throw new NotFoundException('Bundle not found');

    const existing = await (
      this.prisma as any
    ).bundlePurchase.findFirst({
      where: { bundleId, userId },
    });
    if (existing) throw new ConflictException('Already purchased');

    if (bundle.priceXP > 0) {
      const progress = await this.prisma.userProgress.findUnique({
        where: { userId },
      });
      if (!progress || progress.totalXP < bundle.priceXP) {
        throw new BadRequestException('Not enough XP');
      }

      const [purchase] = await this.prisma.$transaction([
        (this.prisma as any).bundlePurchase.create({
          data: { bundleId, userId },
        }),
        this.prisma.userProgress.update({
          where: { userId },
          data: { totalXP: { decrement: bundle.priceXP } },
        }),
      ]);
      return purchase;
    }

    return (this.prisma as any).bundlePurchase.create({
      data: { bundleId, userId },
    });
  }
}
