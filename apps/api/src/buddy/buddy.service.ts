import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BuddyProfileDto } from './dto/buddy-profile.dto';

@Injectable()
export class BuddyService {
  constructor(private prisma: PrismaService) {}

  async getCards(userId: string) {
    const swiped = await this.prisma.buddySwipe.findMany({
      where: { swiperId: userId },
      select: { targetId: true },
    });
    const swipedIds = swiped.map((s) => s.targetId);

    return this.prisma.buddyProfile.findMany({
      where: {
        userId: { notIn: [userId, ...swipedIds] },
        isActive: true,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, level: true },
        },
      },
      take: 20,
    });
  }

  async upsertProfile(userId: string, dto: BuddyProfileDto) {
    return this.prisma.buddyProfile.upsert({
      where: { userId },
      update: { ...dto },
      create: { userId, ...dto },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.buddyProfile.findUnique({
      where: { userId },
    });
    return profile || { userId, gym: null, schedule: null, goals: null, bio: null, lookingFor: null, isActive: false };
  }

  async swipe(userId: string, targetId: string, direction: string) {
    const swipe = await this.prisma.buddySwipe.upsert({
      where: {
        swiperId_targetId: { swiperId: userId, targetId },
      },
      update: { direction },
      create: { swiperId: userId, targetId, direction },
    });

    let isMatch = false;
    if (direction === 'right') {
      const reverse = await this.prisma.buddySwipe.findUnique({
        where: {
          swiperId_targetId: {
            swiperId: targetId,
            targetId: userId,
          },
        },
      });
      isMatch = reverse?.direction === 'right';
    }

    return { swipe, isMatch };
  }

  async getMatches(userId: string) {
    const myRightSwipes = await this.prisma.buddySwipe.findMany({
      where: { swiperId: userId, direction: 'right' },
      select: { targetId: true },
    });

    const targetIds = myRightSwipes.map((s) => s.targetId);
    if (targetIds.length === 0) return [];

    const mutualSwipes = await this.prisma.buddySwipe.findMany({
      where: {
        swiperId: { in: targetIds },
        targetId: userId,
        direction: 'right',
      },
      select: { swiperId: true },
    });

    const matchedIds = mutualSwipes.map((s) => s.swiperId);
    if (matchedIds.length === 0) return [];

    return this.prisma.user.findMany({
      where: { id: { in: matchedIds } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        level: true,
        bio: true,
      },
    });
  }
}
