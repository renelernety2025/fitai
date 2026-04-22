import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToStackDto } from './dto/add-to-stack.dto';
import { LogSupplementDto } from './dto/log-supplement.dto';

@Injectable()
export class SupplementsService {
  constructor(private prisma: PrismaService) {}

  async getCatalog() {
    return this.prisma.supplement.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getStack(userId: string) {
    const today = this.todayDate();
    const stack = await this.prisma.userSupplement.findMany({
      where: { userId, isActive: true },
      include: {
        supplement: true,
        logs: { where: { date: today }, take: 1 },
      },
      orderBy: { createdAt: 'asc' },
    });

    return stack.map((item) => ({
      ...item,
      takenToday: item.logs.length > 0 && item.logs[0].taken,
    }));
  }

  async addToStack(userId: string, dto: AddToStackDto) {
    const supplement = await this.prisma.supplement.findUnique({
      where: { id: dto.supplementId },
    });
    if (!supplement) {
      throw new NotFoundException('Supplement not found');
    }

    return this.prisma.userSupplement.upsert({
      where: {
        userId_supplementId: {
          userId,
          supplementId: dto.supplementId,
        },
      },
      update: {
        dosage: dto.dosage,
        timing: dto.timing as any,
        monthlyCostKc: dto.monthlyCostKc,
        isActive: true,
      },
      create: {
        userId,
        supplementId: dto.supplementId,
        dosage: dto.dosage,
        timing: dto.timing as any,
        monthlyCostKc: dto.monthlyCostKc,
      },
      include: { supplement: true },
    });
  }

  async deactivate(userId: string, userSupplementId: string) {
    const item = await this.prisma.userSupplement.findUnique({
      where: { id: userSupplementId },
    });
    if (!item) throw new NotFoundException('Not found');
    if (item.userId !== userId) {
      throw new ForbiddenException('Not your supplement');
    }

    return this.prisma.userSupplement.update({
      where: { id: userSupplementId },
      data: { isActive: false },
    });
  }

  async logTaken(userId: string, dto: LogSupplementDto) {
    const item = await this.prisma.userSupplement.findUnique({
      where: { id: dto.userSupplementId },
    });
    if (!item) throw new NotFoundException('Not found');
    if (item.userId !== userId) {
      throw new ForbiddenException('Not your supplement');
    }

    const today = this.todayDate();

    return this.prisma.supplementLog.upsert({
      where: {
        userSupplementId_date: {
          userSupplementId: dto.userSupplementId,
          date: today,
        },
      },
      update: { taken: true },
      create: {
        userSupplementId: dto.userSupplementId,
        date: today,
        taken: true,
      },
    });
  }

  async getLogForDate(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const stack = await this.prisma.userSupplement.findMany({
      where: { userId },
      include: {
        supplement: true,
        logs: { where: { date }, take: 1 },
      },
    });

    return stack.map((item) => ({
      id: item.id,
      supplement: item.supplement,
      dosage: item.dosage,
      timing: item.timing,
      taken: item.logs.length > 0 && item.logs[0].taken,
    }));
  }

  private todayDate(): Date {
    const now = new Date();
    return new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
    );
  }
}
