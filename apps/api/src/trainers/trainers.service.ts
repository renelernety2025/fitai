import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyTrainerDto } from './dto/apply-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Injectable()
export class TrainersService {
  private readonly logger = new Logger(TrainersService.name);

  constructor(private prisma: PrismaService) {}

  async list(search?: string, specialization?: string) {
    const where: any = { isVerified: true };
    if (specialization) {
      where.specializations = { has: specialization };
    }
    if (search) {
      where.OR = [
        { bio: { contains: search, mode: 'insensitive' } },
        {
          user: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }
    return (this.prisma as any).trainerProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getOne(id: string) {
    const trainer = await (
      this.prisma as any
    ).trainerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        experiences: {
          where: { dateTime: { gte: new Date() } },
          orderBy: { dateTime: 'asc' },
          take: 10,
        },
      },
    });
    if (!trainer) throw new NotFoundException('Trainer not found');
    return trainer;
  }

  async getReviews(trainerId: string) {
    return (this.prisma as any).booking.findMany({
      where: {
        experience: { trainerId },
        rating: { not: null },
      },
      select: {
        rating: true,
        reviewText: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async apply(userId: string, dto: ApplyTrainerDto) {
    const existing = await (
      this.prisma as any
    ).trainerProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('Already applied');
    }
    return (this.prisma as any).trainerProfile.create({
      data: {
        userId,
        bio: dto.bio,
        certifications: dto.certifications,
        specializations: dto.specializations,
        isVerified: false,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateTrainerDto) {
    const trainer = await (
      this.prisma as any
    ).trainerProfile.findUnique({
      where: { userId },
    });
    if (!trainer) throw new NotFoundException('No trainer profile');
    if (trainer.userId !== userId) {
      throw new ForbiddenException('Not your profile');
    }
    return (this.prisma as any).trainerProfile.update({
      where: { id: trainer.id },
      data: {
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.certifications
          ? { certifications: dto.certifications }
          : {}),
        ...(dto.specializations
          ? { specializations: dto.specializations }
          : {}),
      },
    });
  }
}
