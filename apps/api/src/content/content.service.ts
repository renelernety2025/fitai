import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(private prisma: PrismaService) {}

  // ── URL Import ──

  async importFromUrl(userId: string, sourceUrl: string) {
    const importRecord = await this.prisma.contentImport.create({
      data: { userId, sourceUrl, status: 'pending' },
    });

    // Start async processing
    this.processImport(importRecord.id, sourceUrl, userId).catch((err) => {
      this.logger.error(`Import failed: ${err.message}`);
    });

    return { id: importRecord.id, status: 'pending', message: 'Import spuštěn' };
  }

  async getImportStatus(importId: string) {
    const record = await this.prisma.contentImport.findUnique({ where: { id: importId } });
    if (!record) throw new NotFoundException('Import nenalezen');
    return record;
  }

  async getMyImports(userId: string) {
    return this.prisma.contentImport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  private async processImport(importId: string, sourceUrl: string, userId: string) {
    try {
      await this.prisma.contentImport.update({
        where: { id: importId },
        data: { status: 'downloading' },
      });

      // In production:
      // 1. Download video from URL (yt-dlp or direct download)
      // 2. Upload to S3
      // 3. Create Video record
      // 4. Trigger preprocessing pipeline (Whisper + Claude)
      this.logger.log(`Import ${importId}: Would download from ${sourceUrl}`);

      // Mock: create video record directly
      const video = await this.prisma.video.create({
        data: {
          title: `Importované video`,
          description: `Importováno z ${new URL(sourceUrl).hostname}`,
          category: 'STRENGTH',
          difficulty: 'INTERMEDIATE',
          durationSeconds: 600,
          thumbnailUrl: 'https://picsum.photos/seed/import/640/360',
          s3RawKey: `raw/import-${importId}.mp4`,
          isPublished: false,
        },
      });

      await this.prisma.contentImport.update({
        where: { id: importId },
        data: { status: 'completed', videoId: video.id },
      });

      this.logger.log(`Import ${importId}: Completed, video ${video.id}`);
    } catch (err: any) {
      await this.prisma.contentImport.update({
        where: { id: importId },
        data: { status: 'failed', error: err.message },
      });
    }
  }

  // ── Marketplace ──

  async getMarketplaceItems(type?: string) {
    return this.prisma.marketplaceItem.findMany({
      where: { isPublished: true, ...(type ? { type } : {}) },
      include: { trainer: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { rating: 'desc' },
    });
  }

  async createMarketplaceItem(trainerId: string, data: {
    type: string;
    title: string;
    titleCs: string;
    description: string;
    price?: number;
    linkedId?: string;
  }) {
    return this.prisma.marketplaceItem.create({
      data: { trainerId, ...data },
    });
  }

  async publishMarketplaceItem(itemId: string, trainerId: string) {
    const item = await this.prisma.marketplaceItem.findUnique({ where: { id: itemId } });
    if (!item || item.trainerId !== trainerId) throw new NotFoundException();
    return this.prisma.marketplaceItem.update({
      where: { id: itemId },
      data: { isPublished: true },
    });
  }

  async getMyMarketplaceItems(trainerId: string) {
    return this.prisma.marketplaceItem.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
