import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { CreateStoryDto } from './dto/create-story.dto';
import { ReactDto } from './dto/react.dto';
import { CommentDto } from './dto/comment.dto';
import { PropsDto } from './dto/props.dto';
import { ShareDto } from './dto/share.dto';

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

  async createChallenge(userId: string, dto: CreateChallengeDto) {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + dto.durationDays);

    const challenge = await this.prisma.challenge.create({
      data: {
        name: dto.name,
        nameCs: dto.name,
        description: dto.description || '',
        type: dto.type,
        targetValue: dto.targetValue,
        startDate: now,
        endDate,
        creatorId: userId,
        participants: { create: { userId } },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        _count: { select: { participants: true } },
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    await this.createFeedItem(
      userId,
      'challenge_created',
      `${user?.name ?? 'Uživatel'} vytvořil výzvu "${dto.name}"`,
      `Cíl: ${dto.targetValue} · ${dto.durationDays} dní`,
    );

    return challenge;
  }

  async getChallengeDetail(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        participants: {
          orderBy: { currentValue: 'desc' },
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
        _count: { select: { participants: true } },
      },
    });
    if (!challenge) throw new NotFoundException('Výzva nenalezena');

    const now = Date.now();
    const endMs = new Date(challenge.endDate).getTime();
    const daysRemaining = Math.max(0, Math.ceil((endMs - now) / 86400000));
    const isExpired = endMs < now;

    return { ...challenge, daysRemaining, isExpired };
  }

  async inviteToChallenge(
    inviterId: string,
    challengeId: string,
    targetUserId: string,
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge) throw new NotFoundException('Výzva nenalezena');
    if (!challenge.isActive) throw new ConflictException('Výzva již skončila');

    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
      select: { name: true },
    });

    await this.createFeedItem(
      targetUserId,
      'challenge_invite',
      `${inviter?.name ?? 'Někdo'} tě pozval do výzvy "${challenge.nameCs}"`,
      `Cíl: ${challenge.targetValue} · Připoj se!`,
      { challengeId },
    );

    return { ok: true };
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

  // ── Stories ──

  async getStories(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followedId: true },
    });
    const userIds = [userId, ...following.map((f) => f.followedId)];

    return this.prisma.story.findMany({
      where: {
        userId: { in: userIds },
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createStory(userId: string, dto: CreateStoryDto) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    let cardData: Record<string, unknown> = dto.cardData || {};

    if (dto.gymSessionId) {
      const session = await this.prisma.gymSession.findFirst({
        where: { id: dto.gymSessionId, userId },
      });
      if (!session) throw new NotFoundException('Session nenalezena');
      cardData = {
        type: 'workout',
        totalReps: session.totalReps,
        duration: session.durationSeconds,
        formScore: session.averageFormScore,
        ...cardData,
      };
    }

    return this.prisma.story.create({
      data: {
        userId,
        gymSessionId: dto.gymSessionId,
        cardData: cardData as any,
        expiresAt,
      },
    });
  }

  async viewStory(storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });
    if (!story) throw new NotFoundException('Story nenalezena');

    return this.prisma.story.update({
      where: { id: storyId },
      data: { viewCount: { increment: 1 } },
    });
  }

  // ── Reactions ──

  async react(userId: string, dto: ReactDto) {
    return this.prisma.reaction.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: dto.targetType,
          targetId: dto.targetId,
        },
      },
      update: { emoji: dto.emoji },
      create: {
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        emoji: dto.emoji,
      },
    });
  }

  async unreact(userId: string, reactionId: string) {
    const reaction = await this.prisma.reaction.findUnique({
      where: { id: reactionId },
    });
    if (!reaction) throw new NotFoundException('Reakce nenalezena');
    if (reaction.userId !== userId) {
      throw new ForbiddenException('Nemůžeš smazat cizí reakci');
    }

    await this.prisma.reaction.delete({ where: { id: reactionId } });
    return { ok: true };
  }

  async getReactions(targetType: string, targetId: string) {
    return this.prisma.reaction.findMany({
      where: { targetType, targetId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Comments ──

  async addComment(userId: string, dto: CommentDto) {
    const feedItem = await this.prisma.activityFeedItem.findUnique({
      where: { id: dto.feedItemId },
    });
    if (!feedItem) throw new NotFoundException('Feed item nenalezen');

    return this.prisma.comment.create({
      data: { userId, feedItemId: dto.feedItemId, content: dto.content },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async getComments(feedItemId: string) {
    return this.prisma.comment.findMany({
      where: { feedItemId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('Komentář nenalezen');
    if (comment.userId !== userId) {
      throw new ForbiddenException('Nemůžeš smazat cizí komentář');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { ok: true };
  }

  // ── Props ──

  async giveProps(userId: string, dto: PropsDto) {
    if (userId === dto.toUserId) {
      throw new BadRequestException('Nemůžeš dát props sám sobě');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: dto.toUserId },
    });
    if (!target) throw new NotFoundException('Uživatel nenalezen');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayCount = await this.prisma.props.count({
      where: {
        fromUserId: userId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    if (todayCount >= 5) {
      throw new BadRequestException('Max 5 props denně');
    }

    const [props] = await this.prisma.$transaction([
      this.prisma.props.create({
        data: {
          fromUserId: userId,
          toUserId: dto.toUserId,
          reason: dto.reason,
        },
      }),
      this.prisma.user.update({
        where: { id: dto.toUserId },
        data: { propsReceived: { increment: 1 } },
      }),
    ]);

    return props;
  }

  async getReceivedProps(userId: string) {
    return this.prisma.props.findMany({
      where: { toUserId: userId },
      include: {
        from: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ── Flash Challenges ──

  async getActiveFlash() {
    return this.prisma.flashChallenge.findFirst({
      where: {
        isActive: true,
        endsAt: { gt: new Date() },
        startsAt: { lte: new Date() },
      },
      include: {
        participants: {
          orderBy: { value: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: { select: { participants: true } },
      },
    });
  }

  async joinFlash(userId: string, challengeId: string) {
    const flash = await this.prisma.flashChallenge.findUnique({
      where: { id: challengeId },
    });
    if (!flash) throw new NotFoundException('Flash challenge nenalezena');
    if (!flash.isActive || flash.endsAt < new Date()) {
      throw new ConflictException('Flash challenge již skončila');
    }

    return this.prisma.flashParticipant.upsert({
      where: {
        challengeId_userId: { challengeId, userId },
      },
      update: {},
      create: { challengeId, userId },
    });
  }

  async updateFlash(
    userId: string,
    challengeId: string,
    value: number,
  ) {
    const participant = await this.prisma.flashParticipant.findUnique({
      where: { challengeId_userId: { challengeId, userId } },
    });
    if (!participant) {
      throw new NotFoundException('Nejsi přihlášen do této výzvy');
    }

    const flash = await this.prisma.flashChallenge.findUnique({
      where: { id: challengeId },
    });
    if (!flash || !flash.isActive || flash.endsAt < new Date()) {
      throw new ConflictException('Flash challenge již skončila');
    }

    const newValue = participant.value + value;
    const completedAt =
      newValue >= flash.targetValue ? new Date() : undefined;

    return this.prisma.flashParticipant.update({
      where: { id: participant.id },
      data: {
        value: newValue,
        ...(completedAt ? { completedAt } : {}),
      },
    });
  }

  // ── Share ──

  async share(userId: string, dto: ShareDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const name = user?.name ?? 'Uživatel';

    const titleMap: Record<string, string> = {
      workout: `${name} sdílí trénink`,
      pr: `${name} překonal osobní rekord!`,
      journal: `${name} sdílí záznam z deníku`,
      recipe: `${name} sdílí recept`,
    };

    return this.createFeedItem(
      userId,
      `shared_${dto.type}`,
      titleMap[dto.type] || `${name} sdílí obsah`,
      '',
      { type: dto.type, referenceId: dto.referenceId },
    );
  }

  // ── Public Profile ──

  async getPublicProfile(targetUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        bio: true,
        level: true,
        propsReceived: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Uživatel nenalezen');

    const [progress, achievements, followCounts] = await Promise.all([
      this.prisma.userProgress.findUnique({
        where: { userId: targetUserId },
      }),
      this.prisma.achievementUnlock.findMany({
        where: { userId: targetUserId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
        take: 10,
      }),
      this.getFollowCounts(targetUserId),
    ]);

    return {
      ...user,
      progress,
      achievements: achievements.map((a) => a.achievement),
      ...followCounts,
    };
  }

  async updateBio(userId: string, bio: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { bio },
      select: { id: true, bio: true },
    });
  }
}
