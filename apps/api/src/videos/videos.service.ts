import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoCategory, VideoDifficulty } from '@prisma/client';

@Injectable()
export class VideosService {
  constructor(private prisma: PrismaService) {}

  async findAllAdmin() {
    return this.prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findAll(filters?: { category?: VideoCategory; difficulty?: VideoDifficulty }) {
    const where: any = { isPublished: true };
    if (filters?.category) where.category = filters.category;
    if (filters?.difficulty) where.difficulty = filters.difficulty;

    return this.prisma.video.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async create(dto: CreateVideoDto) {
    return this.prisma.video.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        difficulty: dto.difficulty,
        durationSeconds: dto.durationSeconds,
        thumbnailUrl: dto.thumbnailUrl,
        s3RawKey: dto.s3RawKey,
        choreographyUrl: dto.choreographyUrl,
        isPublished: false,
      },
    });
  }

  async updateHlsUrl(id: string, hlsUrl: string) {
    return this.prisma.video.update({
      where: { id },
      data: { hlsUrl },
    });
  }

  async publish(id: string) {
    await this.findById(id);
    return this.prisma.video.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.video.delete({ where: { id } });
  }
}
