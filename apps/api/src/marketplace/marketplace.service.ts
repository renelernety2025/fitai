import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async browse(filters: {
    type?: string;
    sort?: string;
    search?: string;
  }) {
    const where: any = { isPublished: true };
    if (filters.type) where.type = filters.type;
    if (filters.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }

    const orderBy = this.buildOrderBy(filters.sort);

    return this.prisma.marketplaceListing.findMany({
      where,
      orderBy,
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async getDetail(id: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async create(userId: string, dto: CreateListingDto) {
    return this.prisma.marketplaceListing.create({
      data: {
        authorId: userId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        planId: dto.planId,
        priceXP: dto.priceXP ?? 0,
        tags: dto.tags ?? [],
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateListingDto) {
    const listing = await this.findOwned(userId, id);
    return this.prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: {
        title: dto.title,
        description: dto.description,
        priceXP: dto.priceXP,
        tags: dto.tags,
      },
    });
  }

  async purchase(userId: string, listingId: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });
    if (!listing || !listing.isPublished) {
      throw new NotFoundException('Listing not found');
    }

    const existing = await this.prisma.marketplacePurchase.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });
    if (existing) {
      throw new BadRequestException('Already purchased');
    }

    if (listing.priceXP > 0) {
      const progress = await this.prisma.userProgress.findUnique({
        where: { userId },
      });
      const xp = progress?.totalXP ?? 0;
      if (xp < listing.priceXP) {
        throw new BadRequestException('Not enough XP');
      }
      await this.prisma.userProgress.update({
        where: { userId },
        data: { totalXP: { decrement: listing.priceXP } },
      });
    }

    await this.prisma.marketplacePurchase.create({
      data: { userId, listingId, xpPaid: listing.priceXP },
    });

    await this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { downloads: { increment: 1 } },
    });

    return { success: true, xpPaid: listing.priceXP };
  }

  async rate(userId: string, listingId: string, rating: number) {
    const purchased = await this.prisma.marketplacePurchase.findUnique({
      where: { userId_listingId: { userId, listingId } },
    });
    if (!purchased) {
      throw new BadRequestException('Must purchase before rating');
    }

    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException();

    const newCount = listing.ratingCount + 1;
    const newRating =
      (listing.rating * listing.ratingCount + rating) / newCount;

    await this.prisma.marketplaceListing.update({
      where: { id: listingId },
      data: {
        rating: Math.round(newRating * 10) / 10,
        ratingCount: newCount,
      },
    });

    return { rating: newRating, ratingCount: newCount };
  }

  async softDelete(userId: string, id: string) {
    const listing = await this.findOwned(userId, id);
    await this.prisma.marketplaceListing.update({
      where: { id: listing.id },
      data: { isPublished: false },
    });
    return { deleted: true };
  }

  private async findOwned(userId: string, id: string) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.authorId !== userId) throw new ForbiddenException();
    return listing;
  }

  private buildOrderBy(sort?: string) {
    switch (sort) {
      case 'popular': return { downloads: 'desc' as const };
      case 'rating': return { rating: 'desc' as const };
      case 'newest': return { createdAt: 'desc' as const };
      case 'price': return { priceXP: 'asc' as const };
      default: return { createdAt: 'desc' as const };
    }
  }
}
