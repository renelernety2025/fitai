import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { EndSessionDto } from './dto/end-session.dto';
import { PoseSnapshotDto } from './dto/pose-snapshot.dto';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private progressService: ProgressService,
  ) {}

  async startSession(userId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');

    return this.prisma.workoutSession.create({
      data: { userId, videoId },
    });
  }

  async endSession(sessionId: string, userId: string, dto: EndSessionDto) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id: sessionId },
      include: { video: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        durationSeconds: dto.durationSeconds,
        accuracyScore: dto.accuracyScore,
      },
    });

    const completedFullVideo = session.video
      ? dto.durationSeconds >= session.video.durationSeconds * 0.9
      : false;

    const progressResult = await this.progressService.updateProgress(userId, {
      durationSeconds: dto.durationSeconds,
      accuracyScore: dto.accuracyScore,
      completedFullVideo,
    });

    return { session: updated, progress: progressResult };
  }

  async savePoseSnapshot(sessionId: string, userId: string, dto: PoseSnapshotDto) {
    const session = await this.prisma.workoutSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException();

    // Throttle: check last snapshot timestamp
    const lastSnap = await this.prisma.poseSnapshot.findFirst({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
    });
    if (lastSnap && dto.timestamp - lastSnap.timestamp < 5) {
      return { throttled: true };
    }

    return this.prisma.poseSnapshot.create({
      data: {
        sessionId,
        timestamp: dto.timestamp,
        poseName: dto.poseName,
        isCorrect: dto.isCorrect,
        errorMessage: dto.errorMessage,
        jointAngles: dto.jointAngles,
      },
    });
  }

  async getMySessions(userId: string) {
    return this.prisma.workoutSession.findMany({
      where: { userId },
      include: { video: { select: { title: true, category: true, thumbnailUrl: true } } },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  async getMyStats(userId: string) {
    const progress = await this.progressService.getProgress(userId);

    // Weekly activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        completedAt: { not: null },
        startedAt: { gte: weekAgo },
      },
      select: { startedAt: true, durationSeconds: true },
    });

    const weeklyActivity: { date: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = d.toISOString().slice(0, 10);
      const dayMinutes = sessions
        .filter((s) => {
          const sd = new Date(s.startedAt);
          sd.setHours(0, 0, 0, 0);
          return sd.getTime() === d.getTime();
        })
        .reduce((sum, s) => sum + Math.floor(s.durationSeconds / 60), 0);
      weeklyActivity.push({ date: dateStr, minutes: dayMinutes });
    }

    // Average accuracy from completed sessions — DB aggregate (no full table scan)
    const accuracyAgg = await this.prisma.workoutSession.aggregate({
      where: { userId, completedAt: { not: null } },
      _avg: { accuracyScore: true },
    });
    const avgAccuracy = accuracyAgg._avg.accuracyScore ?? 0;

    return {
      totalSessions: progress.totalSessions,
      totalMinutes: progress.totalMinutes,
      averageAccuracy: Math.round(avgAccuracy),
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      totalXP: progress.totalXP,
      levelName: progress.levelName,
      levelNumber: progress.levelNumber,
      weeklyActivity,
    };
  }
}
