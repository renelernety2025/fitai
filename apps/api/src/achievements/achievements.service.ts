import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

interface AchievementSeed {
  code: string;
  title: string;
  titleCs: string;
  description: string;
  descriptionCs: string;
  category: 'training' | 'streak' | 'milestone' | 'social' | 'exploration' | 'nutrition' | 'habits';
  icon: string;
  xpReward: number;
  threshold?: number;
}

const SEED_ACHIEVEMENTS: AchievementSeed[] = [
  // Training
  { code: 'first_workout', title: 'First Workout', titleCs: 'První trénink', description: 'Complete your first workout', descriptionCs: 'Dokončil jsi svůj první trénink', category: 'training', icon: '🎯', xpReward: 50 },
  { code: 'workouts_5', title: '5 Workouts', titleCs: '5 tréninků', description: 'Complete 5 workouts', descriptionCs: 'Dokončil jsi 5 tréninků', category: 'training', icon: '💪', xpReward: 100, threshold: 5 },
  { code: 'workouts_25', title: '25 Workouts', titleCs: '25 tréninků', description: 'Complete 25 workouts', descriptionCs: 'Dokončil jsi 25 tréninků', category: 'training', icon: '🏋️', xpReward: 250, threshold: 25 },
  { code: 'workouts_100', title: '100 Workouts', titleCs: '100 tréninků', description: 'Complete 100 workouts', descriptionCs: 'Dokončil jsi 100 tréninků!', category: 'training', icon: '👑', xpReward: 1000, threshold: 100 },

  // Streak
  { code: 'streak_3', title: '3-Day Streak', titleCs: '3 dny v řadě', description: 'Train 3 days in a row', descriptionCs: 'Cvičil jsi 3 dny v řadě', category: 'streak', icon: '🔥', xpReward: 75, threshold: 3 },
  { code: 'streak_7', title: 'Week Warrior', titleCs: 'Týdenní bojovník', description: '7-day streak', descriptionCs: 'Cvičil jsi 7 dní v řadě', category: 'streak', icon: '⚡', xpReward: 200, threshold: 7 },
  { code: 'streak_30', title: 'Iron Will', titleCs: 'Železná vůle', description: '30-day streak', descriptionCs: '30 dní v řadě bez vynechání', category: 'streak', icon: '💎', xpReward: 1000, threshold: 30 },

  // Milestones
  { code: 'time_10h', title: '10 Hours', titleCs: '10 hodin', description: '10 hours of training', descriptionCs: '10 hodin v tréninku', category: 'milestone', icon: '⏱️', xpReward: 150, threshold: 600 },
  { code: 'time_50h', title: '50 Hours', titleCs: '50 hodin', description: '50 hours of training', descriptionCs: '50 hodin v tréninku', category: 'milestone', icon: '🏆', xpReward: 500, threshold: 3000 },
  { code: 'xp_1000', title: 'Bronze', titleCs: 'Bronz', description: '1000 XP', descriptionCs: 'Získal jsi 1000 XP', category: 'milestone', icon: '🥉', xpReward: 100, threshold: 1000 },
  { code: 'xp_5000', title: 'Silver', titleCs: 'Stříbro', description: '5000 XP', descriptionCs: 'Získal jsi 5000 XP', category: 'milestone', icon: '🥈', xpReward: 250, threshold: 5000 },
  { code: 'xp_10000', title: 'Gold', titleCs: 'Zlato', description: '10 000 XP', descriptionCs: 'Získal jsi 10 000 XP', category: 'milestone', icon: '🥇', xpReward: 500, threshold: 10000 },

  // Habits
  { code: 'first_checkin', title: 'First Check-in', titleCs: 'První check-in', description: 'First daily check-in', descriptionCs: 'První denní check-in', category: 'habits', icon: '📊', xpReward: 25 },
  { code: 'checkin_7', title: 'Mindful Week', titleCs: 'Vědomý týden', description: '7 daily check-ins', descriptionCs: '7 denních check-inů v řadě', category: 'habits', icon: '🌱', xpReward: 150, threshold: 7 },

  // Exploration
  { code: 'tried_home_workout', title: 'Home Trainer', titleCs: 'Domácí trenér', description: 'Try a home workout', descriptionCs: 'Vyzkoušel jsi domácí workout', category: 'exploration', icon: '🏠', xpReward: 50 },
  { code: 'tried_ai_coach', title: 'AI Curious', titleCs: 'AI zvědavec', description: 'Generate AI plan', descriptionCs: 'Vygeneroval jsi AI plán', category: 'exploration', icon: '🤖', xpReward: 100 },
  { code: 'read_5_lessons', title: 'Student', titleCs: 'Student', description: 'Read 5 lessons', descriptionCs: 'Přečetl jsi 5 lekcí', category: 'exploration', icon: '📚', xpReward: 100, threshold: 5 },
];

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  /** Idempotent — seed all achievements on app start. */
  async seedIfNeeded() {
    const count = await this.prisma.achievement.count();
    if (count === SEED_ACHIEVEMENTS.length) return;
    for (const a of SEED_ACHIEVEMENTS) {
      await this.prisma.achievement.upsert({
        where: { code: a.code },
        update: { title: a.title, titleCs: a.titleCs, description: a.description, descriptionCs: a.descriptionCs, category: a.category, icon: a.icon, xpReward: a.xpReward, threshold: a.threshold },
        create: a,
      });
    }
    this.logger.log(`Seeded ${SEED_ACHIEVEMENTS.length} achievements`);
  }

  /** Get all achievements + which ones the user unlocked.
   * Achievement definitions are cached (seed-based, rarely change).
   * Per-user unlocks are not cached (frequent writes + cheap query). */
  async getAll(userId: string) {
    const [all, unlocks] = await Promise.all([
      this.cache.getOrSet('achievements:definitions', 24 * 60 * 60, () =>
        this.prisma.achievement.findMany({ orderBy: { createdAt: 'asc' } }),
      ),
      this.prisma.achievementUnlock.findMany({ where: { userId } }),
    ]);
    const unlockMap = new Map(unlocks.map((u) => [u.achievementId, u.unlockedAt]));
    return all.map((a) => ({
      ...a,
      unlocked: unlockMap.has(a.id),
      unlockedAt: unlockMap.get(a.id) || null,
    }));
  }

  async getUnlocked(userId: string) {
    return this.prisma.achievementUnlock.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });
  }

  /** Check all achievements for a user — call after meaningful actions. Returns newly unlocked. */
  async checkAndUnlock(userId: string) {
    const [progress, sessions, checkIns, all, existing] = await Promise.all([
      this.prisma.userProgress.findUnique({ where: { userId } }),
      this.prisma.workoutSession.count({ where: { userId, completedAt: { not: null } } }),
      this.prisma.dailyCheckIn.count({ where: { userId } }),
      this.prisma.achievement.findMany(),
      this.prisma.achievementUnlock.findMany({ where: { userId } }),
    ]);

    const unlockedCodes = new Set(
      existing.map((e) => all.find((a) => a.id === e.achievementId)?.code).filter(Boolean),
    );

    const totalXP = progress?.totalXP || 0;
    const totalMinutes = progress?.totalMinutes || 0;
    const currentStreak = progress?.currentStreak || 0;

    const meets = (code: string): boolean => {
      switch (code) {
        case 'first_workout': return sessions >= 1;
        case 'workouts_5': return sessions >= 5;
        case 'workouts_25': return sessions >= 25;
        case 'workouts_100': return sessions >= 100;
        case 'streak_3': return currentStreak >= 3;
        case 'streak_7': return currentStreak >= 7;
        case 'streak_30': return currentStreak >= 30;
        case 'time_10h': return totalMinutes >= 600;
        case 'time_50h': return totalMinutes >= 3000;
        case 'xp_1000': return totalXP >= 1000;
        case 'xp_5000': return totalXP >= 5000;
        case 'xp_10000': return totalXP >= 10000;
        case 'first_checkin': return checkIns >= 1;
        case 'checkin_7': return checkIns >= 7;
        // exploration achievements unlock manually (when user takes specific action) — handled elsewhere
        default: return false;
      }
    };

    const newlyUnlocked: any[] = [];
    for (const a of all) {
      if (unlockedCodes.has(a.code)) continue;
      if (meets(a.code)) {
        await this.prisma.achievementUnlock.create({
          data: { userId, achievementId: a.id },
        });
        // Award XP
        if (a.xpReward > 0 && progress) {
          await this.prisma.userProgress.update({
            where: { userId },
            data: { totalXP: { increment: a.xpReward } },
          });
        }
        newlyUnlocked.push(a);
      }
    }
    return { newlyUnlocked, total: existing.length + newlyUnlocked.length };
  }

  /** Manually unlock by code (for exploration achievements). */
  async unlockByCode(userId: string, code: string) {
    const achievement = await this.prisma.achievement.findUnique({ where: { code } });
    if (!achievement) return null;
    const existing = await this.prisma.achievementUnlock.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    if (existing) return null;
    await this.prisma.achievementUnlock.create({
      data: { userId, achievementId: achievement.id },
    });
    if (achievement.xpReward > 0) {
      await this.prisma.userProgress.update({
        where: { userId },
        data: { totalXP: { increment: achievement.xpReward } },
      });
    }
    return achievement;
  }
}
