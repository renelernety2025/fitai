import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateScheduledWorkoutDto,
  UpdateScheduledWorkoutDto,
} from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getMonth(userId: string, month: string) {
    const start = new Date(`${month}-01T00:00:00Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    return this.prisma.scheduledWorkout.findMany({
      where: {
        userId,
        date: { gte: start, lt: end },
      },
      include: {
        workoutPlan: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    });
  }

  async create(userId: string, dto: CreateScheduledWorkoutDto) {
    return this.prisma.scheduledWorkout.create({
      data: {
        userId,
        date: new Date(dto.date),
        title: dto.title,
        workoutPlanId: dto.workoutPlanId,
        workoutDayIdx: dto.workoutDayIdx,
        notes: dto.notes,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateScheduledWorkoutDto,
  ) {
    await this.ensureOwnership(userId, id);
    return this.prisma.scheduledWorkout.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.title && { title: dto.title }),
        ...(dto.workoutPlanId !== undefined && {
          workoutPlanId: dto.workoutPlanId,
        }),
        ...(dto.workoutDayIdx !== undefined && {
          workoutDayIdx: dto.workoutDayIdx,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await this.prisma.scheduledWorkout.delete({ where: { id } });
    return { deleted: true };
  }

  async complete(
    userId: string,
    id: string,
    gymSessionId?: string,
  ) {
    await this.ensureOwnership(userId, id);
    return this.prisma.scheduledWorkout.update({
      where: { id },
      data: {
        completed: true,
        gymSessionId: gymSessionId || null,
      },
    });
  }

  private async ensureOwnership(userId: string, id: string) {
    const item = await this.prisma.scheduledWorkout.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Scheduled workout not found');
    if (item.userId !== userId) throw new ForbiddenException();
  }
}
