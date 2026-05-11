import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_FREEZES_PER_MONTH = 4;

@Injectable()
export class StreakFreezeService {
  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const { monthStart, monthEnd } = this.currentMonth();

    const used = await this.prisma.streakFreeze.findMany({
      where: {
        userId,
        usedDate: { gte: monthStart, lt: monthEnd },
      },
      orderBy: { usedDate: 'desc' },
    });

    return {
      available: MAX_FREEZES_PER_MONTH - used.length,
      maxPerMonth: MAX_FREEZES_PER_MONTH,
      usedDates: used.map((f) => f.usedDate),
    };
  }

  async useFreeze(userId: string) {
    const today = this.todayDate();
    const { monthStart, monthEnd } = this.currentMonth();

    // Atomic month-count + create via interactive transaction to prevent TOCTOU.
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.streakFreeze.findUnique({
        where: { userId_usedDate: { userId, usedDate: today } },
      });
      if (existing) throw new BadRequestException('Freeze already used today');

      const monthCount = await tx.streakFreeze.count({
        where: { userId, usedDate: { gte: monthStart, lt: monthEnd } },
      });
      if (monthCount >= MAX_FREEZES_PER_MONTH) {
        throw new BadRequestException(`Max ${MAX_FREEZES_PER_MONTH} freezes per month`);
      }

      const freeze = await tx.streakFreeze.create({
        data: { userId, usedDate: today },
      });

      return {
        success: true,
        remaining: MAX_FREEZES_PER_MONTH - monthCount - 1,
        usedDate: freeze.usedDate,
      };
    });
  }

  private todayDate(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );
  }

  private currentMonth() {
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), 1),
    );
    const monthEnd = new Date(
      Date.UTC(now.getFullYear(), now.getMonth() + 1, 1),
    );
    return { monthStart, monthEnd };
  }
}
