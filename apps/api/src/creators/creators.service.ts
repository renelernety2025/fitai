import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyCreatorDto } from './dto/apply-creator.dto';
import { UpdateCreatorDto } from './dto/update-creator.dto';

const USER_SELECT = { id: true, name: true, avatarUrl: true };

@Injectable()
export class CreatorsService {
  constructor(private prisma: PrismaService) {}

  async listApproved() {
    return this.prisma.creatorProfile.findMany({
      where: { isApproved: true },
      include: { user: { select: USER_SELECT } },
      orderBy: { subscriberCount: 'desc' },
    });
  }

  async detail(id: string) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { id },
      include: { user: { select: USER_SELECT } },
    });
    if (!profile) throw new NotFoundException('Creator not found');
    return profile;
  }

  async apply(userId: string, dto: ApplyCreatorDto) {
    const existing = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('Already applied');
    }

    return this.prisma.creatorProfile.create({
      data: {
        userId,
        displayName: dto.displayName,
        bio: dto.bio,
        specializations: dto.specializations,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateCreatorDto) {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('No creator profile');
    }

    return this.prisma.creatorProfile.update({
      where: { userId },
      data: {
        ...(dto.displayName && { displayName: dto.displayName }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.specializations && {
          specializations: dto.specializations,
        }),
      },
    });
  }
}
