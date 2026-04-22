import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClipDto } from './dto/create-clip.dto';

@Injectable()
export class ClipsService {
  private readonly logger = new Logger(ClipsService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private prisma: PrismaService) {
    this.bucket =
      process.env.S3_BUCKET_ASSETS || 'fitai-assets-production';
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'eu-west-1',
      requestChecksumCalculation: 'WHEN_REQUIRED' as any,
      responseChecksumValidation: 'WHEN_REQUIRED' as any,
    } as any);
  }

  async getUploadUrl(
    userId: string,
    fileName: string,
    contentType: string,
  ) {
    const id = randomUUID();
    const ext = fileName.split('.').pop() || 'mp4';
    const s3Key = `clips/${userId}/${id}.${ext}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      ContentType: contentType,
      Metadata: { userId },
    });
    const uploadUrl = await getSignedUrl(
      this.client as any,
      command as any,
      { expiresIn: 900 },
    );
    return { uploadUrl, s3Key };
  }

  async create(userId: string, dto: CreateClipDto) {
    return (this.prisma as any).clip.create({
      data: {
        userId,
        s3Key: dto.s3Key,
        durationSeconds: dto.durationSeconds,
        exerciseId: dto.exerciseId ?? null,
        tags: dto.tags ?? [],
        caption: dto.caption ?? null,
      },
    });
  }

  async getFeed(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const followIds = await this.getFollowedIds(userId);

    const countFollowing = Math.ceil(limit * 0.4);
    const countTrending = Math.ceil(limit * 0.3);
    const countEducational = Math.ceil(limit * 0.2);
    const countDiscovery = Math.ceil(limit * 0.1) || 1;

    const [following, trending, educational, discovery] =
      await Promise.all([
        this.findClips(
          { userId: { in: followIds } },
          { createdAt: 'desc' },
          countFollowing,
          skip,
        ),
        this.findClips(
          {},
          { likeCount: 'desc' },
          countTrending,
          skip,
        ),
        this.findClips(
          { tags: { has: 'tutorial' } },
          { createdAt: 'desc' },
          countEducational,
          skip,
        ),
        this.findClips(
          {},
          { createdAt: 'desc' },
          countDiscovery,
          skip,
        ),
      ]);

    return this.dedupeAndShuffle([
      ...following,
      ...trending,
      ...educational,
      ...discovery,
    ]);
  }

  async getOne(clipId: string) {
    const clip = await (this.prisma as any).clip.findUnique({
      where: { id: clipId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    });
    if (!clip) throw new NotFoundException('Clip not found');
    return clip;
  }

  async toggleLike(userId: string, clipId: string) {
    const existing = await (this.prisma as any).clipLike.findUnique({
      where: { clipId_userId: { clipId, userId } },
    });
    if (existing) {
      await (this.prisma as any).clipLike.delete({
        where: { id: existing.id },
      });
      await (this.prisma as any).clip.update({
        where: { id: clipId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    }
    await (this.prisma as any).clipLike.create({
      data: { clipId, userId },
    });
    await (this.prisma as any).clip.update({
      where: { id: clipId },
      data: { likeCount: { increment: 1 } },
    });
    return { liked: true };
  }

  async addComment(
    userId: string,
    clipId: string,
    text: string,
  ) {
    const clip = await (this.prisma as any).clip.findUnique({
      where: { id: clipId },
    });
    if (!clip) throw new NotFoundException('Clip not found');
    return (this.prisma as any).clipComment.create({
      data: { clipId, userId, text },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async remove(userId: string, clipId: string) {
    const clip = await (this.prisma as any).clip.findUnique({
      where: { id: clipId },
    });
    if (!clip) throw new NotFoundException('Clip not found');
    if (clip.userId !== userId) {
      throw new ForbiddenException('Not your clip');
    }
    await (this.prisma as any).clip.delete({
      where: { id: clipId },
    });
    return { deleted: true };
  }

  // ── helpers ──

  private async getFollowedIds(userId: string): Promise<string[]> {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followedId: true },
    });
    return follows.map((f) => f.followedId);
  }

  private async findClips(
    where: any,
    orderBy: any,
    take: number,
    skip: number,
  ) {
    return (this.prisma as any).clip.findMany({
      where,
      orderBy,
      take,
      skip,
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  private dedupeAndShuffle(clips: any[]): any[] {
    const seen = new Set<string>();
    const unique = clips.filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }
    return unique;
  }
}
