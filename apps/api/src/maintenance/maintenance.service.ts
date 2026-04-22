import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MaintenanceStatus } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    await this.recalculate(userId);
    return this.prisma.maintenanceSchedule.findMany({
      where: { userId },
      orderBy: { muscleGroup: 'asc' },
    });
  }

  async getAlerts(userId: string) {
    return this.prisma.maintenanceAlert.findMany({
      where: { userId, isDismissed: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMileage(userId: string) {
    const volumes = await this.prisma.weeklyVolume.groupBy({
      by: ['muscleGroup'],
      where: { userId },
      _sum: {
        totalSets: true,
        totalReps: true,
        totalVolumeKg: true,
      },
    });

    return volumes.map((v) => ({
      muscleGroup: v.muscleGroup,
      totalSets: v._sum.totalSets || 0,
      totalReps: v._sum.totalReps || 0,
      totalVolumeKg: v._sum.totalVolumeKg || 0,
    }));
  }

  async markDeload(userId: string, muscleGroup: string) {
    const schedule = await this.prisma.maintenanceSchedule.findUnique({
      where: { userId_muscleGroup: { userId, muscleGroup } },
    });
    if (!schedule) {
      throw new NotFoundException('No maintenance schedule for this muscle');
    }

    return this.prisma.maintenanceSchedule.update({
      where: { id: schedule.id },
      data: {
        sessionsSinceDeload: 0,
        lastDeloadDate: new Date(),
        status: 'FRESH',
      },
    });
  }

  async dismissAlert(userId: string, alertId: string) {
    const alert = await this.prisma.maintenanceAlert.findUnique({
      where: { id: alertId },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.userId !== userId) {
      throw new ForbiddenException('Not your alert');
    }

    return this.prisma.maintenanceAlert.update({
      where: { id: alertId },
      data: { isDismissed: true },
    });
  }

  async recalculate(userId: string) {
    const volumes = await this.prisma.weeklyVolume.groupBy({
      by: ['muscleGroup'],
      where: { userId },
      _count: { id: true },
    });

    for (const vol of volumes) {
      const sessions = vol._count.id;
      const status = this.computeStatus(sessions);

      await this.prisma.maintenanceSchedule.upsert({
        where: {
          userId_muscleGroup: {
            userId,
            muscleGroup: vol.muscleGroup,
          },
        },
        update: { sessionsSinceDeload: sessions, status },
        create: {
          userId,
          muscleGroup: vol.muscleGroup,
          sessionsSinceDeload: sessions,
          status,
        },
      });

      if (status === 'OVERDUE') {
        await this.createAlertIfNeeded(userId, vol.muscleGroup);
      }
    }
  }

  private computeStatus(sessions: number): MaintenanceStatus {
    if (sessions >= 14) return MaintenanceStatus.OVERDUE;
    if (sessions >= 9) return MaintenanceStatus.DUE;
    return MaintenanceStatus.FRESH;
  }

  private async createAlertIfNeeded(
    userId: string,
    muscleGroup: string,
  ) {
    const existing = await this.prisma.maintenanceAlert.findFirst({
      where: { userId, muscleGroup, isDismissed: false },
    });
    if (existing) return;

    await this.prisma.maintenanceAlert.create({
      data: {
        userId,
        muscleGroup,
        severity: 'WARNING',
        message: `${muscleGroup} needs a deload — overdue maintenance`,
      },
    });
  }
}
