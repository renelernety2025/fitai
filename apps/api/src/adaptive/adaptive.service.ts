import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UPPER_BODY_GROUPS = ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS'];

@Injectable()
export class AdaptiveService {
  constructor(private prisma: PrismaService) {}

  async getRecommendation(userId: string, exerciseId: string) {
    const history = await this.prisma.exerciseHistory.findMany({
      where: { userId, exerciseId },
      orderBy: { date: 'desc' },
      take: 5,
      include: { exercise: true },
    });

    if (history.length < 2) {
      return {
        exerciseId,
        currentWeight: history[0]?.bestWeight ?? null,
        recommendedWeight: history[0]?.bestWeight ?? null,
        reason: 'not_enough_data',
        reasonCs: 'Ještě nemáme dost dat. Pokračuj se současnou váhou.',
      };
    }

    const last3 = history.slice(0, 3);
    const avgForm = last3.reduce((s, h) => s + h.avgFormScore, 0) / last3.length;
    const currentWeight = history[0].bestWeight;

    // Determine weight increment based on muscle group
    const exercise = history[0].exercise;
    const isUpperBody = (exercise.muscleGroups as string[]).some((g) => UPPER_BODY_GROUPS.includes(g));
    const increment = isUpperBody ? 2.5 : 5;

    // Trend: compare last session vs average of previous
    const formTrend = last3.length >= 2
      ? last3[0].avgFormScore - last3.slice(1).reduce((s, h) => s + h.avgFormScore, 0) / (last3.length - 1)
      : 0;

    if (avgForm >= 80) {
      const newWeight = currentWeight ? currentWeight + increment : increment;
      return {
        exerciseId,
        currentWeight,
        recommendedWeight: newWeight,
        reason: 'form_good_increase',
        reasonCs: `Tvoje forma je skvělá (${Math.round(avgForm)}%). Zkus zvýšit na ${newWeight}kg.`,
      };
    }

    if (avgForm < 60) {
      const newWeight = currentWeight ? Math.max(0, currentWeight - increment) : null;
      return {
        exerciseId,
        currentWeight,
        recommendedWeight: newWeight,
        reason: 'form_bad_decrease',
        reasonCs: `Forma potřebuje zlepšit (${Math.round(avgForm)}%). Sniž váhu a zaměř se na techniku.`,
      };
    }

    if (formTrend < -5) {
      const newWeight = currentWeight ? Math.max(0, currentWeight - increment) : null;
      return {
        exerciseId,
        currentWeight,
        recommendedWeight: newWeight,
        reason: 'form_declining',
        reasonCs: `Forma klesá. Sniž váhu a stabilizuj techniku.`,
      };
    }

    return {
      exerciseId,
      currentWeight,
      recommendedWeight: currentWeight,
      reason: 'maintain',
      reasonCs: `Pokračuj se ${currentWeight ?? 0}kg. Forma se zlepšuje (${Math.round(avgForm)}%).`,
    };
  }
}
