import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContentReportTargetType, ContentReportStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { ReportContentDto, ReviewReportDto } from './dto/report-content.dto';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  // ── User-facing ──

  async fileReport(reporterId: string, dto: ReportContentDto) {
    const reportedUserId = await this.resolveReportedUser(dto.targetType, dto.targetId);
    if (reportedUserId === reporterId) {
      throw new BadRequestException('You cannot report your own content');
    }
    try {
      const row = await this.prisma.contentReport.create({
        data: {
          reporterId,
          targetType: dto.targetType,
          targetId: dto.targetId,
          reportedUserId,
          reason: dto.reason,
          details: dto.details ?? null,
        },
      });
      return { id: row.id, status: row.status };
    } catch (e: any) {
      // Unique (reporter, target) — user already reported this.
      if (e?.code === 'P2002') {
        throw new ConflictException('You already reported this content');
      }
      throw e;
    }
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }
    const exists = await this.prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException('User not found');
    try {
      await this.prisma.userBlock.create({ data: { blockerId, blockedId } });
    } catch (e: any) {
      if (e?.code !== 'P2002') throw e;
    }
    // Best-effort: unfollow both directions so feed re-converges.
    await this.prisma.follow
      .deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followedId: blockedId },
            { followerId: blockedId, followedId: blockerId },
          ],
        },
      })
      .catch(() => {});
    await this.invalidateBlockCaches(blockerId, blockedId);
    return { blocked: true };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.userBlock.deleteMany({
      where: { blockerId, blockedId },
    });
    await this.invalidateBlockCaches(blockerId, blockedId);
    return { blocked: false };
  }

  private async invalidateBlockCaches(a: string, b: string) {
    await Promise.all([
      this.cache.del(`feed-blocks:${a}`).catch(() => {}),
      this.cache.del(`feed-blocks:${b}`).catch(() => {}),
      this.cache.del(`following:${a}`).catch(() => {}),
      this.cache.del(`following:${b}`).catch(() => {}),
    ]);
  }

  async listBlocked(blockerId: string) {
    return this.prisma.userBlock.findMany({
      where: { blockerId },
      include: { blocked: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBlockedIds(userId: string): Promise<string[]> {
    const rows = await this.prisma.userBlock.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });
    return rows.map((r) => r.blockedId);
  }

  // ── Admin-facing ──

  async listReports(status: ContentReportStatus = 'PENDING', limit = 50) {
    return this.prisma.contentReport.findMany({
      where: { status },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true, bannedAt: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });
  }

  async reviewReport(reportId: string, adminId: string, dto: ReviewReportDto) {
    const report = await this.prisma.contentReport.findUnique({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');
    if (report.status !== 'PENDING') {
      throw new BadRequestException('Report already reviewed');
    }

    if (dto.action === 'DISMISS') {
      return this.markReviewed(reportId, adminId, 'DISMISSED', dto.notes);
    }

    if (dto.action === 'HIDE_CONTENT') {
      await this.hideTarget(report.targetType, report.targetId, adminId, dto.notes);
      return this.markReviewed(reportId, adminId, 'REVIEWED_VALID', dto.notes);
    }

    // BAN_USER — needs a target user
    const userId = report.reportedUserId;
    if (!userId) {
      throw new BadRequestException('Report has no associated user to ban');
    }
    await this.banUser(userId, dto.notes ?? 'Banned via report review');
    return this.markReviewed(reportId, adminId, 'REVIEWED_VALID', dto.notes);
  }

  async banUser(userId: string, reason?: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { bannedAt: new Date(), banReason: reason ?? null },
    });
  }

  async unbanUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { bannedAt: null, banReason: null },
    });
  }

  // ── helpers ──

  private async resolveReportedUser(
    targetType: ContentReportTargetType,
    targetId: string,
  ): Promise<string | null> {
    switch (targetType) {
      case 'POST': {
        const row = await this.prisma.post.findUnique({
          where: { id: targetId },
          select: { userId: true },
        });
        return row?.userId ?? null;
      }
      case 'CLIP': {
        const row = await this.prisma.clip.findUnique({
          where: { id: targetId },
          select: { userId: true },
        });
        return row?.userId ?? null;
      }
      case 'POST_COMMENT': {
        const row = await this.prisma.postComment.findUnique({
          where: { id: targetId },
          select: { userId: true },
        });
        return row?.userId ?? null;
      }
      case 'CLIP_COMMENT': {
        const row = await this.prisma.clipComment.findUnique({
          where: { id: targetId },
          select: { userId: true },
        });
        return row?.userId ?? null;
      }
      case 'USER':
        return targetId;
    }
  }

  private async hideTarget(
    targetType: ContentReportTargetType,
    targetId: string,
    adminId: string,
    notes?: string,
  ) {
    const now = new Date();
    const reason = notes ?? `Hidden by admin ${adminId}`;
    if (targetType === 'POST') {
      await this.prisma.post.update({
        where: { id: targetId },
        data: { isHidden: true, hiddenAt: now, hiddenReason: reason },
      });
    } else if (targetType === 'CLIP') {
      await this.prisma.clip.update({
        where: { id: targetId },
        data: { isHidden: true, hiddenAt: now, hiddenReason: reason },
      });
    }
    // Comments don't have a soft-hide flag — delete on action.
    else if (targetType === 'POST_COMMENT') {
      await this.prisma.postComment
        .delete({ where: { id: targetId } })
        .catch(() => {});
    } else if (targetType === 'CLIP_COMMENT') {
      await this.prisma.clipComment
        .delete({ where: { id: targetId } })
        .catch(() => {});
    }
  }

  private async markReviewed(
    reportId: string,
    reviewerId: string,
    status: ContentReportStatus,
    notes?: string,
  ) {
    return this.prisma.contentReport.update({
      where: { id: reportId },
      data: {
        status,
        reviewerId,
        reviewerNotes: notes ?? null,
        reviewedAt: new Date(),
      },
    });
  }
}
