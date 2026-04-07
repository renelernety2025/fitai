import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}

  /** Mifflin-St Jeor BMR + activity multiplier → recommended daily targets */
  private calculateTargets(profile: {
    age?: number | null;
    weightKg?: number | null;
    heightCm?: number | null;
    daysPerWeek: number;
    goal: string;
  }) {
    const weight = profile.weightKg ?? 75;
    const height = profile.heightCm ?? 175;
    const age = profile.age ?? 30;
    // Assume male formula (no gender field yet)
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const activity = 1.375 + 0.075 * profile.daysPerWeek; // 1.375 sedavé → ~1.825 6×týdně
    let tdee = bmr * activity;

    // Goal adjustment
    if (profile.goal === 'WEIGHT_LOSS') tdee *= 0.8;
    else if (profile.goal === 'HYPERTROPHY' || profile.goal === 'STRENGTH') tdee *= 1.1;

    const kcal = Math.round(tdee);
    const proteinG = Math.round(weight * 2);
    const fatG = Math.round((kcal * 0.25) / 9);
    const carbsG = Math.round((kcal - proteinG * 4 - fatG * 9) / 4);
    return { dailyKcal: kcal, dailyProteinG: proteinG, dailyCarbsG: carbsG, dailyFatG: fatG };
  }

  async getGoals(userId: string) {
    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
    if (!profile) {
      // Return default targets without persisting
      return { dailyKcal: 2200, dailyProteinG: 140, dailyCarbsG: 250, dailyFatG: 70, source: 'default' };
    }
    if (profile.dailyKcal && profile.dailyProteinG) {
      return {
        dailyKcal: profile.dailyKcal,
        dailyProteinG: profile.dailyProteinG,
        dailyCarbsG: profile.dailyCarbsG,
        dailyFatG: profile.dailyFatG,
        source: 'profile',
      };
    }
    const targets = this.calculateTargets(profile);
    return { ...targets, source: 'calculated' };
  }

  async setGoals(
    userId: string,
    body: { dailyKcal: number; dailyProteinG: number; dailyCarbsG: number; dailyFatG: number },
  ) {
    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Fitness profile not found');
    return this.prisma.fitnessProfile.update({
      where: { userId },
      data: body,
    });
  }

  /** Auto-calculate and save targets based on profile */
  async autoCalculateGoals(userId: string) {
    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Fitness profile not found');
    const targets = this.calculateTargets(profile);
    return this.prisma.fitnessProfile.update({ where: { userId }, data: targets });
  }

  async getLog(userId: string, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    return this.prisma.foodLog.findMany({
      where: { userId, date },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addFood(
    userId: string,
    body: {
      mealType: string;
      name: string;
      kcal: number;
      proteinG?: number;
      carbsG?: number;
      fatG?: number;
      servings?: number;
      date?: string;
    },
  ) {
    const date = body.date ? new Date(body.date) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    return this.prisma.foodLog.create({
      data: {
        userId,
        date,
        mealType: body.mealType,
        name: body.name,
        kcal: body.kcal,
        proteinG: body.proteinG ?? 0,
        carbsG: body.carbsG ?? 0,
        fatG: body.fatG ?? 0,
        servings: body.servings ?? 1,
      },
    });
  }

  async deleteFood(userId: string, id: string) {
    const log = await this.prisma.foodLog.findUnique({ where: { id } });
    if (!log || log.userId !== userId) throw new NotFoundException();
    await this.prisma.foodLog.delete({ where: { id } });
    return { ok: true };
  }

  async getTodaySummary(userId: string) {
    const goals = await this.getGoals(userId);
    const log = await this.getLog(userId);
    const totals = log.reduce(
      (acc, item) => {
        const mult = item.servings || 1;
        acc.kcal += item.kcal * mult;
        acc.proteinG += item.proteinG * mult;
        acc.carbsG += item.carbsG * mult;
        acc.fatG += item.fatG * mult;
        return acc;
      },
      { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );
    return {
      goals,
      totals: {
        kcal: Math.round(totals.kcal),
        proteinG: Math.round(totals.proteinG),
        carbsG: Math.round(totals.carbsG),
        fatG: Math.round(totals.fatG),
      },
      remaining: {
        kcal: Math.round(goals.dailyKcal! - totals.kcal),
        proteinG: Math.round((goals.dailyProteinG ?? 0) - totals.proteinG),
        carbsG: Math.round((goals.dailyCarbsG ?? 0) - totals.carbsG),
        fatG: Math.round((goals.dailyFatG ?? 0) - totals.fatG),
      },
      log,
    };
  }

  /** Quick foods database — common Czech foods with macros */
  getQuickFoods() {
    return [
      { name: 'Kuřecí prsa (100g)', kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
      { name: 'Hovězí steak (100g)', kcal: 250, proteinG: 26, carbsG: 0, fatG: 17 },
      { name: 'Vejce (1 ks)', kcal: 78, proteinG: 6, carbsG: 0.6, fatG: 5 },
      { name: 'Tvaroh měkký (100g)', kcal: 95, proteinG: 12, carbsG: 4, fatG: 4 },
      { name: 'Řecký jogurt 0% (150g)', kcal: 90, proteinG: 15, carbsG: 5, fatG: 0 },
      { name: 'Rýže basmati vařená (100g)', kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3 },
      { name: 'Brambory vařené (100g)', kcal: 87, proteinG: 2, carbsG: 20, fatG: 0.1 },
      { name: 'Ovesné vločky (50g)', kcal: 190, proteinG: 6.5, carbsG: 33, fatG: 3.5 },
      { name: 'Banán (1 ks)', kcal: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4 },
      { name: 'Jablko (1 ks)', kcal: 95, proteinG: 0.5, carbsG: 25, fatG: 0.3 },
      { name: 'Whey protein (30g)', kcal: 120, proteinG: 24, carbsG: 2, fatG: 1.5 },
      { name: 'Mandle (30g)', kcal: 173, proteinG: 6, carbsG: 6, fatG: 15 },
      { name: 'Olivový olej (1 lžíce)', kcal: 119, proteinG: 0, carbsG: 0, fatG: 13.5 },
      { name: 'Tuňák ve vlastní šťávě (100g)', kcal: 116, proteinG: 26, carbsG: 0, fatG: 1 },
      { name: 'Chléb celozrnný (1 plátek)', kcal: 70, proteinG: 3, carbsG: 12, fatG: 1 },
      { name: 'Losos (100g)', kcal: 208, proteinG: 20, carbsG: 0, fatG: 13 },
    ];
  }
}
