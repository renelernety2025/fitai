import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { AddRoutineItemDto } from './dto/add-routine-item.dto';
import { UpdateRoutineItemDto } from './dto/update-routine-item.dto';

@Injectable()
export class RoutineBuilderService {
  constructor(private prisma: PrismaService) {}

  async listMine(userId: string) {
    return (this.prisma as any).routine.findMany({
      where: { userId },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listPublic() {
    return (this.prisma as any).routine.findMany({
      where: { isPublic: true },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async create(userId: string, dto: CreateRoutineDto) {
    return (this.prisma as any).routine.create({
      data: {
        userId,
        name: dto.name,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateRoutineDto) {
    const routine = await this.getOwn(userId, id);
    return (this.prisma as any).routine.update({
      where: { id: routine.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isPublic !== undefined
          ? { isPublic: dto.isPublic }
          : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    const routine = await this.getOwn(userId, id);
    await (this.prisma as any).routine.delete({
      where: { id: routine.id },
    });
    return { deleted: true };
  }

  async addItem(
    userId: string,
    routineId: string,
    dto: AddRoutineItemDto,
  ) {
    await this.getOwn(userId, routineId);
    return (this.prisma as any).routineItem.create({
      data: {
        routineId,
        type: dto.type,
        referenceId: dto.referenceId ?? null,
        referenceName: dto.referenceName,
        notes: dto.notes ?? null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateItem(
    userId: string,
    routineId: string,
    itemId: string,
    dto: UpdateRoutineItemDto,
  ) {
    await this.getOwn(userId, routineId);
    const item = await (this.prisma as any).routineItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.routineId !== routineId) {
      throw new NotFoundException('Item not found');
    }
    return (this.prisma as any).routineItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async removeItem(
    userId: string,
    routineId: string,
    itemId: string,
  ) {
    await this.getOwn(userId, routineId);
    const item = await (this.prisma as any).routineItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.routineId !== routineId) {
      throw new NotFoundException('Item not found');
    }
    await (this.prisma as any).routineItem.delete({
      where: { id: itemId },
    });
    return { deleted: true };
  }

  // ── helpers ──

  private async getOwn(userId: string, id: string) {
    const routine = await (this.prisma as any).routine.findUnique({
      where: { id },
    });
    if (!routine) throw new NotFoundException('Routine not found');
    if (routine.userId !== userId) {
      throw new ForbiddenException('Not your routine');
    }
    return routine;
  }
}
