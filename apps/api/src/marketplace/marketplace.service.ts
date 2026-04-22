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
      take: 50,
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

    await this.prisma.$transaction(async (tx) => {
      if (listing.priceXP > 0) {
        const progress = await tx.userProgress.findUnique({
          where: { userId },
        });
        const xp = progress?.totalXP ?? 0;
        if (xp < listing.priceXP) {
          throw new BadRequestException('Not enough XP');
        }
        await tx.userProgress.update({
          where: { userId },
          data: { totalXP: { decrement: listing.priceXP } },
        });
      }

      await tx.marketplacePurchase.create({
        data: { userId, listingId, xpPaid: listing.priceXP },
      });

      await tx.marketplaceListing.update({
        where: { id: listingId },
        data: { downloads: { increment: 1 } },
      });
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

    let newCount: number;
    let newRating: number;

    if (purchased.userRating !== null) {
      // Re-rating: replace old rating in aggregate
      const oldRating = purchased.userRating;
      newCount = listing.ratingCount;
      const totalSum = listing.rating * listing.ratingCount;
      newRating = (totalSum - oldRating + rating) / newCount;
    } else {
      // First rating
      newCount = listing.ratingCount + 1;
      newRating =
        (listing.rating * listing.ratingCount + rating) / newCount;
    }

    await this.prisma.marketplacePurchase.update({
      where: { userId_listingId: { userId, listingId } },
      data: { userRating: rating },
    });

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
