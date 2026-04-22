import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymReviewDto } from './dto/create-gym-review.dto';

@Injectable()
export class GymFinderService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.gymReview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async create(userId: string, dto: CreateGymReviewDto) {
    return this.prisma.gymReview.create({
      data: {
        userId,
        gymName: dto.gymName,
        address: dto.address,
        lat: dto.lat,
        lng: dto.lng,
        rating: dto.rating,
        equipment: dto.equipment ?? [],
        notes: dto.notes,
      },
    });
  }

  async getNearby(lat: number, lng: number, radiusKm: number) {
    const reviews = await this.prisma.gymReview.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      take: 100,
      include: { user: { select: { id: true, name: true } } },
    });

    return reviews
      .map((r) => ({
        ...r,
        distance: this.haversine(lat, lng, r.lat!, r.lng!),
      }))
      .filter((r) => r.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  private haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
