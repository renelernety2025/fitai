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
}
