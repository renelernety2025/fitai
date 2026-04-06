import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getLevelForXP } from './xp-levels';

interface SessionData {
  durationSeconds: number;
  accuracyScore: number;
  completedFullVideo: boolean;
}

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async updateProgress(userId: string, sessionData: SessionData) {
    let progress = await this.prisma.userProgress.findUnique({ where: { userId } });
    if (!progress) {
      progress = await this.prisma.userProgress.create({ data: { userId } });
    }

    // XP calculation
    const minutes = Math.floor(sessionData.durationSeconds / 60);
    let xpGained = minutes * 10;
    if (sessionData.accuracyScore >= 80) xpGained += 20;
    if (sessionData.completedFullVideo) xpGained += 50;

    // Streak logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = progress.currentStreak;
    if (progress.lastWorkoutDate) {
      const last = new Date(progress.lastWorkoutDate);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays === 0) {
        // same day, no change
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(progress.longestStreak, newStreak);
    const newTotalXP = progress.totalXP + xpGained;

    const oldLevel = getLevelForXP(progress.totalXP);
    const newLevel = getLevelForXP(newTotalXP);
    const levelUp = newLevel.level > oldLevel.level;

    await this.prisma.userProgress.update({
      where: { userId },
      data: {
        totalXP: newTotalXP,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastWorkoutDate: new Date(),
        totalSessions: progress.totalSessions + 1,
        totalMinutes: progress.totalMinutes + minutes,
      },
    });

    return {
      xpGained,
      totalXP: newTotalXP,
      currentStreak: newStreak,
      levelUp,
      levelName: newLevel.name,
    };
  }

  async getProgress(userId: string) {
    let progress = await this.prisma.userProgress.findUnique({ where: { userId } });
    if (!progress) {
      progress = await this.prisma.userProgress.create({ data: { userId } });
    }
    const level = getLevelForXP(progress.totalXP);
    return { ...progress, levelName: level.name, levelNumber: level.level };
  }

  async getReminderStatus(userId: string) {
    const progress = await this.getProgress(userId);
    if (!progress.lastWorkoutDate) {
      return {
        shouldRemind: true,
        daysSinceLastWorkout: null,
        message: 'Začni cvičit ještě dnes a nastartuj svou sérii!',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = new Date(progress.lastWorkoutDate);
    last.setHours(0, 0, 0, 0);
    const days = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (days <= 1) {
      return {
        shouldRemind: false,
        daysSinceLastWorkout: days,
        message: `Pokračuj v sérii! Cvičíš už ${progress.currentStreak} dní po sobě.`,
      };
    }
    if (days === 2) {
      return {
        shouldRemind: true,
        daysSinceLastWorkout: days,
        message: 'Nezapomeň procvičit! Naposledy jsi cvičil/a před 2 dny.',
      };
    }
    return {
      shouldRemind: true,
      daysSinceLastWorkout: days,
      message: `Chybíš nám! Série přerušena. Začni znovu ještě dnes.`,
    };
  }
}
