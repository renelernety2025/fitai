import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PREntry {
  exerciseId: string;
  exerciseName: string;
  exerciseNameCs: string | null;
  bestWeight: number | null;
  bestReps: number;
  date: Date;
  previousBestWeight: number | null;
  previousBestReps: number | null;
  deltaWeight: number | null;
  deltaReps: number | null;
}

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async getAll(userId: string) {
    const history = await this.prisma.exerciseHistory.findMany({
      where: { userId },
      include: {
        exercise: { select: { id: true, name: true, nameCs: true } },
      },
      orderBy: [{ exerciseId: 'asc' }, { date: 'desc' }],
    });

    const grouped = new Map<string, typeof history>();
    for (const entry of history) {
      const list = grouped.get(entry.exerciseId) || [];
      list.push(entry);
      grouped.set(entry.exerciseId, list);
    }

    const records: PREntry[] = [];
    for (const [exerciseId, entries] of grouped) {
      const current = entries[0];
      const previous = entries.length > 1 ? entries[1] : null;

      records.push({
        exerciseId,
        exerciseName: current.exercise.name,
        exerciseNameCs: current.exercise.nameCs,
        bestWeight: current.bestWeight,
        bestReps: current.bestReps,
        date: current.date,
        previousBestWeight: previous?.bestWeight ?? null,
        previousBestReps: previous?.bestReps ?? null,
        deltaWeight: this.delta(current.bestWeight, previous?.bestWeight),
        deltaReps: this.delta(current.bestReps, previous?.bestReps),
      });
    }

    return records;
  }

  async getForExercise(userId: string, exerciseId: string) {
    const entries = await this.prisma.exerciseHistory.findMany({
      where: { userId, exerciseId },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return entries.map((entry, i) => {
      const prev = entries[i + 1] || null;
      return {
        ...entry,
        deltaWeight: this.delta(entry.bestWeight, prev?.bestWeight),
        deltaReps: this.delta(entry.bestReps, prev?.bestReps),
      };
    });
  }

  async getSectorTimes(userId: string, exerciseSetId: string) {
    const set = await this.prisma.exerciseSet.findUnique({
      where: { id: exerciseSetId },
      include: { gymSession: { select: { userId: true } } },
    });
    if (!set) return [];
    if (set.gymSession.userId !== userId) {
      throw new ForbiddenException('Not your exercise set');
    }

    return this.prisma.sectorTime.findMany({
      where: { exerciseSetId },
    });
  }

  private delta(
    current: number | null | undefined,
    previous: number | null | undefined,
  ): number | null {
    if (current == null || previous == null) return null;
    return current - previous;
  }
}
