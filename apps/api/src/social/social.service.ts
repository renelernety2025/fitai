import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  // ── Follow System ──

  async follow(followerId: string, followedId: string) {
    if (followerId === followedId) throw new ConflictException('Nemůžeš sledovat sám sebe');
    const target = await this.prisma.user.findUnique({ where: { id: followedId } });
    if (!target) throw new NotFoundException('Uživatel nenalezen');

    return this.prisma.follow.upsert({
      where: { followerId_followedId: { followerId, followedId } },
      update: {},
      create: { followerId, followedId },
    });
  }

  async unfollow(followerId: string, followedId: string) {
    await this.prisma.follow.deleteMany({ where: { followerId, followedId } });
    return { ok: true };
  }

  async getFollowing(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: { followed: { select: { id: true, name: true, avatarUrl: true } } },
    });
    return follows.map((f) => f.followed);
  }

  async getFollowers(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followedId: userId },
      include: { follower: { select: { id: true, name: true, avatarUrl: true } } },
    });
    return follows.map((f) => f.follower);
  }

  async getFollowCounts(userId: string) {
    const [following, followers] = await Promise.all([
      this.prisma.follow.count({ where: { followerId: userId } }),
      this.prisma.follow.count({ where: { followedId: userId } }),
    ]);
    return { following, followers };
  }

  async isFollowing(followerId: string, followedId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: { followerId_followedId: { followerId, followedId } },
    });
    return { isFollowing: !!follow };
  }

  // ── Activity Feed ──

  async createFeedItem(userId: string, type: string, title: string, body: string, data?: any) {
    return this.prisma.activityFeedItem.create({
      data: { userId, type, title, body, data },
    });
  }

  async getFeed(userId: string, limit = 20) {
    // Get IDs of followed users + self
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followedId: true },
    });
    const userIds = [userId, ...following.map((f) => f.followedId)];

    return this.prisma.activityFeedItem.findMany({
      where: { userId: { in: userIds } },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getPublicFeed(limit = 20) {
    return this.prisma.activityFeedItem.findMany({
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ── Challenges ──

  async getChallenges() {
    return this.prisma.challenge.findMany({
      where: { isActive: true, endDate: { gte: new Date() } },
      include: {
        participants: {
          orderBy: { currentValue: 'desc' },
          take: 10,
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        _count: { select: { participants: true } },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  async joinChallenge(userId: string, challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new NotFoundException('Výzva nenalezena');
    if (!challenge.isActive) throw new ConflictException('Výzva již skončila');

    return this.prisma.challengeParticipant.upsert({
      where: { challengeId_userId: { challengeId, userId } },
      update: {},
      create: { challengeId, userId },
    });
  }

  async getLeaderboard(challengeId: string) {
    return this.prisma.challengeParticipant.findMany({
      where: { challengeId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { currentValue: 'desc' },
      take: 50,
    });
  }

  async updateChallengeProgress(userId: string, type: string, increment: number) {
    // Find active challenges of this type where user participates
    const entries = await this.prisma.challengeParticipant.findMany({
      where: {
        userId,
        challenge: { type, isActive: true, endDate: { gte: new Date() } },
      },
    });

    for (const entry of entries) {
      await this.prisma.challengeParticipant.update({
        where: { id: entry.id },
        data: { currentValue: { increment } },
      });
    }
  }

  // ── User Search ──

  async searchUsers(query: string, currentUserId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, avatarUrl: true, level: true },
      take: 10,
    });
    return users;
  }
}
