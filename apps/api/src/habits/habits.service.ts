import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  private todayDate(): Date {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  async getToday(userId: string) {
    const date = this.todayDate();
    const existing = await this.prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId, date } },
    });
    return existing || { userId, date, sleepHours: null, sleepQuality: null, hydrationL: null, steps: null, mood: null, energy: null, soreness: null, stress: null, notes: null };
  }

  async upsertToday(
    userId: string,
    body: {
      sleepHours?: number;
      sleepQuality?: number;
      hydrationL?: number;
      steps?: number;
      mood?: number;
      energy?: number;
      soreness?: number;
      stress?: number;
      notes?: string;
    },
  ) {
    const date = this.todayDate();
    return this.prisma.dailyCheckIn.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...body },
      update: body,
    });
  }

  async getHistory(userId: string, days: number = 30) {
    const from = new Date();
    from.setUTCDate(from.getUTCDate() - days);
    from.setUTCHours(0, 0, 0, 0);
    return this.prisma.dailyCheckIn.findMany({
      where: { userId, date: { gte: from } },
      orderBy: { date: 'desc' },
    });
  }

  async getStats(userId: string) {
    const recent = await this.getHistory(userId, 7);
    if (recent.length === 0) {
      return { recoveryScore: null, avgSleep: null, avgEnergy: null, avgSoreness: null, streakDays: 0 };
    }
    const avg = (key: keyof (typeof recent)[number]) => {
      const vals = recent.map((r) => (r as any)[key]).filter((v): v is number => v != null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const avgSleep = avg('sleepHours');
    const avgEnergy = avg('energy');
    const avgSoreness = avg('soreness');
    const avgStress = avg('stress');

    // Recovery score: higher is better. 0-100.
    // Combines: sleep (target 7-9h), energy (1-5), low soreness (5-soreness), low stress (5-stress)
    let recoveryScore: number | null = null;
    const components: number[] = [];
    if (avgSleep != null) {
      const sleepScore = Math.max(0, Math.min(100, 100 - Math.abs(8 - avgSleep) * 15));
      components.push(sleepScore);
    }
    if (avgEnergy != null) components.push((avgEnergy / 5) * 100);
    if (avgSoreness != null) components.push(((6 - avgSoreness) / 5) * 100);
    if (avgStress != null) components.push(((6 - avgStress) / 5) * 100);
    if (components.length > 0) {
      recoveryScore = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
    }

    // Streak: consecutive days with at least one check-in
    let streakDays = 0;
    const today = this.todayDate();
    for (let i = 0; i < recent.length; i++) {
      const expected = new Date(today);
      expected.setUTCDate(today.getUTCDate() - i);
      const found = recent.find((r) => new Date(r.date).getTime() === expected.getTime());
      if (found) streakDays++;
      else break;
    }

    return {
      recoveryScore,
      avgSleep: avgSleep != null ? Math.round(avgSleep * 10) / 10 : null,
      avgEnergy: avgEnergy != null ? Math.round(avgEnergy * 10) / 10 : null,
      avgSoreness: avgSoreness != null ? Math.round(avgSoreness * 10) / 10 : null,
      avgStress: avgStress != null ? Math.round(avgStress * 10) / 10 : null,
      streakDays,
      totalCheckIns: recent.length,
    };
  }
}
