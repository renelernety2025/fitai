import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  private readonly logger = new Logger(ExperiencesService.name);

  constructor(private prisma: PrismaService) {}

  async list(filters: {
    category?: string;
    difficulty?: string;
    minPrice?: number;
    maxPrice?: number;
    date?: string;
    search?: string;
  }) {
    const where: any = {
      dateTime: { gte: new Date() },
    };
    if (filters.category) where.category = filters.category;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.date) {
      const d = new Date(filters.date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.dateTime = { gte: d, lt: next };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.priceKc = {};
      if (filters.minPrice !== undefined) where.priceKc.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.priceKc.lte = filters.maxPrice;
    }
    return (this.prisma as any).experience.findMany({
      where,
      include: {
        trainer: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: { dateTime: 'asc' },
      take: 50,
    });
  }

  async getOne(id: string) {
    const exp = await (this.prisma as any).experience.findUnique({
      where: { id },
      include: {
        trainer: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { bookings: true } },
      },
    });
    if (!exp) throw new NotFoundException('Experience not found');
    return exp;
  }

  async create(userId: string, dto: CreateExperienceDto) {
    const trainer = await (this.prisma as any).trainerProfile.findUnique({
      where: { userId },
    });
    if (!trainer) {
      throw new ForbiddenException('You must be a trainer to create experiences');
    }
    return (this.prisma as any).experience.create({
      data: {
        trainerId: trainer.id,
        title: dto.title,
        description: dto.description,
        locationAddress: dto.locationAddress,
        locationLat: dto.locationLat ?? null,
        locationLng: dto.locationLng ?? null,
        dateTime: new Date(dto.dateTime),
        durationMinutes: dto.durationMinutes,
        capacity: dto.capacity,
        priceXP: dto.priceXP ?? 0,
        priceKc: dto.priceKc ?? 0,
        difficulty: dto.difficulty ?? null,
        category: dto.category,
        cancellationPolicy: dto.cancellationPolicy ?? null,
        photos: dto.photos ?? [],
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateExperienceDto) {
    const exp = await this.getOwnExperience(userId, id);
    const data: any = { ...dto };
    if (dto.dateTime) data.dateTime = new Date(dto.dateTime);
    return (this.prisma as any).experience.update({
      where: { id: exp.id },
      data,
    });
  }

  async book(userId: string, experienceId: string) {
    const exp = await (this.prisma as any).experience.findUnique({
      where: { id: experienceId },
      include: { _count: { select: { bookings: true } } },
    });
    if (!exp) throw new NotFoundException('Experience not found');
    if (exp._count.bookings >= exp.capacity) {
      throw new ConflictException('Experience is full');
    }
    const existing = await (this.prisma as any).experienceBooking.findFirst({
      where: { userId, experienceId },
    });
    if (existing) throw new ConflictException('Already booked');
    return (this.prisma as any).experienceBooking.create({
      data: { userId, experienceId },
    });
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.getOwnBooking(userId, bookingId);
    return (this.prisma as any).experienceBooking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    });
  }

  async checkin(userId: string, bookingId: string) {
    const booking = await this.getOwnBooking(userId, bookingId);
    return (this.prisma as any).experienceBooking.update({
      where: { id: booking.id },
      data: { status: 'CHECKED_IN', checkedInAt: new Date() },
    });
  }

  async review(
    userId: string,
    bookingId: string,
    rating: number,
    reviewText?: string,
  ) {
    const booking = await this.getOwnBooking(userId, bookingId);
    if (booking.status !== 'CHECKED_IN') {
      throw new BadRequestException('Must check in before reviewing');
    }
    return (this.prisma as any).experienceBooking.update({
      where: { id: booking.id },
      data: { rating, reviewText: reviewText ?? null },
    });
  }

  async myBookings(userId: string) {
    return (this.prisma as any).experienceBooking.findMany({
      where: { userId },
      include: {
        experience: {
          include: {
            trainer: {
              include: {
                user: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── helpers ──

  private async getOwnExperience(userId: string, id: string) {
    const exp = await (this.prisma as any).experience.findUnique({
      where: { id },
      include: { trainer: true },
    });
    if (!exp) throw new NotFoundException('Experience not found');
    if (exp.trainer.userId !== userId) {
      throw new ForbiddenException('Not your experience');
    }
    return exp;
  }

  private async getOwnBooking(userId: string, bookingId: string) {
    const booking = await (this.prisma as any).experienceBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('Not your booking');
    }
    return booking;
  }
}
