import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      registrationsToday,
      totalSessions,
      totalFoodLogs,
      totalCheckIns,
      sessionsToday,
      aiCallsToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      }),
      this.prisma.gymSession.count(),
      this.prisma.foodLog.count(),
      this.prisma.dailyCheckIn.count(),
      this.prisma.gymSession.count({
        where: { startedAt: { gte: todayStart } },
      }),
      this.prisma.coachingSession.count({
        where: { createdAt: { gte: todayStart } },
      }),
    ]);

    const activeToday = sessionsToday;

    return {
      totalUsers,
      registrationsToday,
      activeToday,
      totalSessions,
      totalFoodLogs,
      totalCheckIns,
      aiCallsToday,
    };
  }

  async verifyUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { badgeType: 'VERIFIED', badgeVerifiedAt: new Date() },
    });
  }

  async unverifyUser(userId: string) {
    const creator = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });
    const badgeType = creator?.isApproved ? 'CREATOR' : 'NONE';
    return this.prisma.user.update({
      where: { id: userId },
      data: { badgeType, badgeVerifiedAt: null },
    });
  }

  async getAnalytics() {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const monthAgo = new Date(today.getTime() - 30 * 86400000);

    const [
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      sessionsToday,
      sessionsWeek,
      activeToday,
      activeWeek,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: monthAgo } },
      }),
      this.prisma.gymSession.count({
        where: { startedAt: { gte: today } },
      }),
      this.prisma.gymSession.count({
        where: { startedAt: { gte: weekAgo } },
      }),
      this.prisma.gymSession
        .findMany({
          where: { startedAt: { gte: today } },
          select: { userId: true },
          distinct: ['userId'],
        })
        .then((r) => r.length),
      this.prisma.gymSession
        .findMany({
          where: { startedAt: { gte: weekAgo } },
          select: { userId: true },
          distinct: ['userId'],
        })
        .then((r) => r.length),
    ]);

    const retentionRate =
      totalUsers > 0
        ? Math.round((activeWeek / totalUsers) * 100)
        : 0;

    return {
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      sessionsToday,
      sessionsWeek,
      dauToday: activeToday,
      wauWeek: activeWeek,
      retentionRate,
    };
  }
}
