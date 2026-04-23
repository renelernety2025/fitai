import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async getAll(
    userId: string,
    exerciseId?: string,
    workoutType?: string,
  ) {
    const where: any = {};
    if (exerciseId) where.exerciseId = exerciseId;
    if (workoutType) where.workoutType = workoutType;

    return (this.prisma as any).playlistLink.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreatePlaylistDto) {
    return (this.prisma as any).playlistLink.create({
      data: {
        userId,
        title: dto.title,
        spotifyUrl: dto.spotifyUrl,
        appleMusicUrl: dto.appleMusicUrl,
        exerciseId: dto.exerciseId,
        workoutType: dto.workoutType,
        bpm: dto.bpm,
      },
    });
  }

  async remove(userId: string, id: string) {
    const item = await (this.prisma as any).playlistLink.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Playlist not found');
    if (item.userId !== userId) {
      throw new ForbiddenException('Not your playlist');
    }

    await (this.prisma as any).playlistLink.delete({
      where: { id },
    });
    return { ok: true };
  }
}
