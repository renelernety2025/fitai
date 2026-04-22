import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSquadDto } from './dto/create-squad.dto';

const USER_SELECT = { id: true, name: true, avatarUrl: true };

@Injectable()
export class SquadsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSquadDto) {
    const existing = await this.prisma.squadMembership.findFirst({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException('Already in a squad');
    }

    return this.prisma.squad.create({
      data: {
        name: dto.name,
        motto: dto.motto,
        members: {
          create: { userId, role: 'LEADER' },
        },
      },
      include: {
        members: { include: { user: { select: USER_SELECT } } },
      },
    });
  }

  async getMine(userId: string) {
    const membership = await this.prisma.squadMembership.findFirst({
      where: { userId },
      include: {
        squad: {
          include: {
            members: { include: { user: { select: USER_SELECT } } },
          },
        },
      },
    });
    if (!membership) return null;
    return { ...membership.squad, myRole: membership.role };
  }

  async getDetail(squadId: string) {
    const squad = await this.prisma.squad.findUnique({
      where: { id: squadId },
      include: {
        members: {
          include: { user: { select: USER_SELECT } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!squad) throw new NotFoundException('Squad not found');

    const weeklyXP = await this.computeWeeklyXP(squad.members);
    return { ...squad, weeklyXP };
  }

  async invite(inviterId: string, squadId: string, targetUserId: string) {
    const membership = await this.prisma.squadMembership.findFirst({
      where: { squadId, userId: inviterId, role: 'LEADER' },
    });
    if (!membership) {
      throw new ForbiddenException('Only leader can invite');
    }

    const alreadyMember = await this.prisma.squadMembership.findFirst({
      where: { userId: targetUserId },
    });
    if (alreadyMember) {
      throw new ConflictException('User already in a squad');
    }

    return this.prisma.squadMembership.create({
      data: { squadId, userId: targetUserId, role: 'MEMBER' },
      include: { user: { select: USER_SELECT } },
    });
  }

  async leave(userId: string, squadId: string) {
    const membership = await this.prisma.squadMembership.findFirst({
      where: { squadId, userId },
    });
    if (!membership) {
      throw new NotFoundException('Not a member of this squad');
    }

    await this.prisma.squadMembership.delete({
      where: { id: membership.id },
    });

    const remaining = await this.prisma.squadMembership.count({
      where: { squadId },
    });
    if (remaining === 0) {
      await this.prisma.squad.delete({ where: { id: squadId } });
    }

    return { ok: true };
  }

  async getLeaderboard() {
    const squads = await this.prisma.squad.findMany({
      include: {
        members: { include: { user: { select: USER_SELECT } } },
        _count: { select: { members: true } },
      },
    });

    const results = await Promise.all(
      squads.map(async (s) => ({
        ...s,
        weeklyXP: await this.computeWeeklyXP(s.members),
      })),
    );

    return results.sort((a, b) => b.weeklyXP - a.weeklyXP).slice(0, 20);
  }

  private async computeWeeklyXP(
    members: Array<{ userId: string }>,
  ): Promise<number> {
    const userIds = members.map((m) => m.userId);
    if (userIds.length === 0) return 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        userId: { in: userIds },
        startedAt: { gte: weekAgo },
      },
      select: { durationSeconds: true },
    });

    // XP estimate: 10 XP per minute (matching XP system)
    return sessions.reduce(
      (sum, s) => sum + Math.floor((s.durationSeconds / 60) * 10),
      0,
    );
  }
}
