import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name);

  constructor(private prisma: PrismaService) {}

  async create(
    type: string,
    recipientId: string,
    actorId: string,
    message: string,
    targetType?: string,
    targetId?: string,
  ) {
    if (recipientId === actorId) return;
    const isDuplicate = await this.isDuplicate(type, recipientId, actorId, targetId);
    if (isDuplicate) return;

    await this.prisma.socialNotification.create({
      data: {
        userId: recipientId,
        type: type as any,
        actorId,
        targetType,
        targetId,
        message,
      },
    });
  }

  async createBatched(
    type: string,
    recipientId: string,
    actorId: string,
    message: string,
    batchMessage: string,
    targetType?: string,
    targetId?: string,
  ) {
    if (recipientId === actorId) return;

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentCount = await this.prisma.socialNotification.count({
      where: {
        userId: recipientId,
        type: type as any,
        targetId,
        createdAt: { gte: fiveMinAgo },
      },
    });

    if (recentCount >= 4) {
      await this.prisma.socialNotification.updateMany({
        where: {
          userId: recipientId,
          type: type as any,
          targetId,
          createdAt: { gte: fiveMinAgo },
        },
        data: { message: batchMessage.replace('{count}', String(recentCount + 1)) },
      });
      return;
    }

    await this.create(type, recipientId, actorId, message, targetType, targetId);
  }

  private async isDuplicate(
    type: string,
    recipientId: string,
    actorId: string,
    targetId?: string,
  ): Promise<boolean> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await this.prisma.socialNotification.findFirst({
      where: {
        userId: recipientId,
        type: type as any,
        actorId,
        targetId: targetId || undefined,
        createdAt: { gte: oneDayAgo },
      },
    });
    return !!existing;
  }
}
