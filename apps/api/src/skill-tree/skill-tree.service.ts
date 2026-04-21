import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SKILL_TREE, SkillNode } from './skill-tree.data';

interface UserStats {
  bench_press_max: number;
  squat_max: number;
  deadlift_max: number;
  streak: number;
  sessions: number;
  avg_form: number;
  checkins: number;
  food_logs: number;
}

@Injectable()
export class SkillTreeService {
  private readonly logger = new Logger(SkillTreeService.name);

  constructor(private prisma: PrismaService) {}

  async getTree(userId: string) {
    const unlocked = await this.prisma.skillUnlock.findMany({
      where: { userId },
    });
    const unlockedCodes = new Set(unlocked.map((u) => u.skillCode));

    return {
      nodes: SKILL_TREE.map((node) => ({
        ...node,
        unlocked: unlockedCodes.has(node.code),
      })),
    };
  }

  async checkAndUnlock(userId: string) {
    const [stats, existingUnlocks] = await Promise.all([
      this.loadStats(userId),
      this.prisma.skillUnlock.findMany({ where: { userId } }),
    ]);

    const unlockedCodes = new Set(
      existingUnlocks.map((u) => u.skillCode),
    );
    const newlyUnlocked: SkillNode[] = [];

    for (const node of SKILL_TREE) {
      if (unlockedCodes.has(node.code)) continue;
      if (node.requires && !unlockedCodes.has(node.requires)) continue;
      if (!this.evaluate(node, stats)) continue;

      await this.prisma.skillUnlock.create({
        data: { userId, skillCode: node.code },
      });
      unlockedCodes.add(node.code);
      newlyUnlocked.push(node);
    }

    return {
      newlyUnlocked,
      totalUnlocked: unlockedCodes.size,
      totalSkills: SKILL_TREE.length,
    };
  }

  private evaluate(node: SkillNode, stats: UserStats): boolean {
    const { check } = node;
    const match = check.match(/^(\w+)\s*>=\s*(\d+)$/);
    if (!match) return false;

    const [, field, threshold] = match;
    const value = stats[field as keyof UserStats] ?? 0;
    return value >= Number(threshold);
  }

  private async loadStats(userId: string): Promise<UserStats> {
    const [progress, histories, checkIns, foodLogs] =
      await Promise.all([
        this.prisma.userProgress.findUnique({ where: { userId } }),
        this.prisma.exerciseHistory.findMany({
          where: { userId },
          include: { exercise: true },
        }),
        this.prisma.dailyCheckIn.count({ where: { userId } }),
        this.prisma.foodLog.count({ where: { userId } }),
      ]);

    const maxWeight = (pattern: RegExp): number => {
      let max = 0;
      for (const h of histories) {
        if (pattern.test(h.exercise?.name || '')) {
          max = Math.max(max, h.bestWeight || 0);
        }
      }
      return max;
    };

    const formScores = histories.filter((h) => h.avgFormScore > 0);
    const avgForm = formScores.length
      ? formScores.reduce((s, h) => s + h.avgFormScore, 0) /
        formScores.length
      : 0;

    return {
      bench_press_max: maxWeight(/bench\s*press/i),
      squat_max: maxWeight(/squat/i),
      deadlift_max: maxWeight(/deadlift/i),
      streak: progress?.longestStreak || 0,
      sessions: progress?.totalSessions || 0,
      avg_form: Math.round(avgForm),
      checkins: checkIns,
      food_logs: foodLogs,
    };
  }
}
