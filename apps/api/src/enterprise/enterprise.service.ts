import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { CreateOrgChallengeDto } from './dto/create-org-challenge.dto';

const USER_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  email: true,
};

@Injectable()
export class EnterpriseService {
  constructor(private prisma: PrismaService) {}

  async getMyOrg(userId: string) {
    const membership =
      await this.prisma.organizationMember.findFirst({
        where: { userId },
        include: {
          org: {
            include: {
              members: {
                include: { user: { select: USER_SELECT } },
              },
            },
          },
        },
      });
    if (!membership) return null;
    return { ...membership.org, myRole: membership.role };
  }

  async create(userId: string, dto: CreateOrgDto) {
    const existing =
      await this.prisma.organization.findUnique({
        where: { slug: dto.slug },
      });
    if (existing) {
      throw new ConflictException('Slug already taken');
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        industry: dto.industry,
        size: dto.size,
        adminId: userId,
        members: {
          create: { userId, role: 'ADMIN' },
        },
      },
      include: {
        members: {
          include: { user: { select: USER_SELECT } },
        },
      },
    });
  }

  async invite(
    userId: string,
    orgId: string,
    email: string,
  ) {
    await this.assertOrgAdmin(userId, orgId);

    const target = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    const already =
      await this.prisma.organizationMember.findUnique({
        where: { orgId_userId: { orgId, userId: target.id } },
      });
    if (already) {
      throw new ConflictException('Already a member');
    }

    return this.prisma.organizationMember.create({
      data: { orgId, userId: target.id, role: 'MEMBER' },
      include: { user: { select: USER_SELECT } },
    });
  }

  async getDashboard(userId: string, orgId: string) {
    await this.assertOrgMember(userId, orgId);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const members =
      await this.prisma.organizationMember.findMany({
        where: { orgId },
        include: {
          user: {
            select: {
              ...USER_SELECT,
              progress: {
                select: { totalXP: true, currentStreak: true },
              },
              fitnessProfile: {
                select: { goal: true },
              },
            },
          },
        },
      });

    const userIds = members.map((m) => m.userId);

    const sessions =
      await this.prisma.workoutSession.findMany({
        where: {
          userId: { in: userIds },
          startedAt: { gte: weekAgo },
        },
        select: { durationSeconds: true, userId: true },
      });

    const fitnessScores =
      await this.prisma.fitnessScoreHistory.findMany({
        where: { userId: { in: userIds } },
        orderBy: { date: 'desc' },
        distinct: ['userId'],
        select: { score: true },
      });

    const avgFitness =
      fitnessScores.length > 0
        ? Math.round(
            fitnessScores.reduce((s, f) => s + f.score, 0) /
              fitnessScores.length,
          )
        : 0;

    const maxStreak = Math.max(
      0,
      ...members.map(
        (m) => m.user.progress?.currentStreak ?? 0,
      ),
    );

    return {
      activeMembers: members.length,
      sessionsThisWeek: sessions.length,
      avgFitnessScore: avgFitness,
      teamStreak: maxStreak,
    };
  }

  async getLeaderboard(userId: string, orgId: string) {
    await this.assertOrgMember(userId, orgId);

    const members =
      await this.prisma.organizationMember.findMany({
        where: { orgId },
        include: {
          user: {
            select: {
              ...USER_SELECT,
              progress: {
                select: {
                  totalXP: true,
                  currentStreak: true,
                },
              },
            },
          },
        },
      });

    return members
      .map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl,
        role: m.role,
        xp: m.user.progress?.totalXP ?? 0,
        streak: m.user.progress?.currentStreak ?? 0,
      }))
      .sort((a, b) => b.xp - a.xp);
  }

  async createChallenge(
    userId: string,
    orgId: string,
    dto: CreateOrgChallengeDto,
  ) {
    await this.assertOrgAdmin(userId, orgId);

    return this.prisma.organizationChallenge.create({
      data: {
        orgId,
        name: dto.name,
        description: dto.description,
        metric: dto.metric,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async getChallenges(userId: string, orgId: string) {
    await this.assertOrgMember(userId, orgId);

    return this.prisma.organizationChallenge.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async assertOrgAdmin(
    userId: string,
    orgId: string,
  ) {
    const m =
      await this.prisma.organizationMember.findUnique({
        where: { orgId_userId: { orgId, userId } },
      });
    if (!m || m.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  private async assertOrgMember(
    userId: string,
    orgId: string,
  ) {
    const m =
      await this.prisma.organizationMember.findUnique({
        where: { orgId_userId: { orgId, userId } },
      });
    if (!m) {
      throw new ForbiddenException('Not a member');
    }
  }
}
