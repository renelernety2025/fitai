import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return (this.prisma as any).wishlist.findMany({
      where: { userId },
      orderBy: { addedAt: 'desc' },
    });
  }

  async add(userId: string, itemType: string, itemId: string) {
    const existing = await (
      this.prisma as any
    ).wishlist.findFirst({
      where: { userId, itemType, itemId },
    });
    if (existing) throw new ConflictException('Already in wishlist');

    return (this.prisma as any).wishlist.create({
      data: { userId, itemType, itemId },
    });
  }

  async remove(userId: string, id: string) {
    const item = await (this.prisma as any).wishlist.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Wishlist item not found');
    if (item.userId !== userId) {
      throw new ForbiddenException('Not your wishlist item');
    }
    await (this.prisma as any).wishlist.delete({
      where: { id },
    });
    return { deleted: true };
  }

  async count(itemType: string, itemId: string) {
    const total = await (this.prisma as any).wishlist.count({
      where: { itemType, itemId },
    });
    return { itemType, itemId, count: total };
  }
}
