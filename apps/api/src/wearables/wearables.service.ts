import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Heart rate zones (based on % of max HR, estimated as 220 - age)
const HR_ZONES = [
  { name: 'rest', nameCs: 'Odpočinek', minPct: 0, maxPct: 50, color: '#6b7280' },
  { name: 'fat_burn', nameCs: 'Spalování tuků', minPct: 50, maxPct: 60, color: '#3b82f6' },
  { name: 'cardio', nameCs: 'Kardio', minPct: 60, maxPct: 70, color: '#16a34a' },
  { name: 'peak', nameCs: 'Vrchol', minPct: 70, maxPct: 85, color: '#f97316' },
  { name: 'max', nameCs: 'Maximum', minPct: 85, maxPct: 100, color: '#ef4444' },
];

@Injectable()
export class WearablesService {
  private readonly logger = new Logger(WearablesService.name);

  constructor(private prisma: PrismaService) {}

  async syncData(userId: string, data: {
    provider: string;
    entries: { dataType: string; value: number; unit: string; timestamp: string }[];
    sessionId?: string;
  }) {
    const records = data.entries.map((entry) => ({
      userId,
      sessionId: data.sessionId,
      provider: data.provider,
      dataType: entry.dataType,
      value: entry.value,
      unit: entry.unit,
      timestamp: new Date(entry.timestamp),
    }));

    await this.prisma.wearableData.createMany({ data: records });
    return { synced: records.length };
  }

  async getSessionHeartRate(userId: string, sessionId: string) {
    const data = await this.prisma.wearableData.findMany({
      where: { userId, sessionId, dataType: 'heart_rate' },
      orderBy: { timestamp: 'asc' },
    });

    if (data.length === 0) return null;

    const bpms = data.map((d) => d.value);
    const avg = bpms.reduce((a, b) => a + b, 0) / bpms.length;
    const max = Math.max(...bpms);
    const min = Math.min(...bpms);

    // Estimate max HR (simplified, assumes age ~30)
    const estimatedMaxHR = 190;
    const zone = this.getHRZone(avg, estimatedMaxHR);

    // Calculate time in each zone
    const zoneTime = HR_ZONES.map((z) => {
      const inZone = bpms.filter((bpm) => {
        const pct = (bpm / estimatedMaxHR) * 100;
        return pct >= z.minPct && pct < z.maxPct;
      }).length;
      return { ...z, minutes: Math.round((inZone / bpms.length) * data.length * (5 / 60)) }; // assuming ~5s intervals
    });

    return {
      average: Math.round(avg),
      max,
      min,
      currentZone: zone,
      zoneTime,
      dataPoints: data.map((d) => ({ timestamp: d.timestamp, bpm: d.value })),
    };
  }

  async getRecoveryScore(userId: string) {
    // Get last 24h of HRV and resting HR data
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [hrvData, restHR, sleepData] = await Promise.all([
      this.prisma.wearableData.findMany({
        where: { userId, dataType: 'hrv', timestamp: { gte: since } },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
      this.prisma.wearableData.findMany({
        where: { userId, dataType: 'resting_hr', timestamp: { gte: since } },
        orderBy: { timestamp: 'desc' },
        take: 1,
      }),
      this.prisma.wearableData.findMany({
        where: { userId, dataType: 'sleep', timestamp: { gte: since } },
        orderBy: { timestamp: 'desc' },
        take: 1,
      }),
    ]);

    // Calculate recovery score (0-100)
    let score = 50; // baseline

    if (hrvData.length > 0) {
      const avgHRV = hrvData.reduce((s, d) => s + d.value, 0) / hrvData.length;
      // Higher HRV = better recovery (typical range 20-100ms)
      score += Math.min(25, (avgHRV - 30) * 0.5);
    }

    if (restHR.length > 0) {
      // Lower resting HR = better recovery (typical 50-80bpm)
      score += Math.min(15, (75 - restHR[0].value) * 0.5);
    }

    if (sleepData.length > 0) {
      // More sleep = better recovery (hours, typical 6-9)
      score += Math.min(10, (sleepData[0].value - 6) * 3);
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let recommendation: string;
    if (score >= 80) recommendation = 'Skvělé zotavení! Můžeš trénovat naplno.';
    else if (score >= 60) recommendation = 'Dobré zotavení. Normální trénink.';
    else if (score >= 40) recommendation = 'Průměrné zotavení. Sniž intenzitu o 20%.';
    else recommendation = 'Nízké zotavení. Doporučuji lehký trénink nebo odpočinek.';

    return {
      score,
      recommendation,
      hrv: hrvData.length > 0 ? Math.round(hrvData[0].value) : null,
      restingHR: restHR.length > 0 ? Math.round(restHR[0].value) : null,
      sleepHours: sleepData.length > 0 ? sleepData[0].value : null,
    };
  }

  async getCaloriesEstimate(userId: string, sessionId: string, durationMinutes: number) {
    const hrData = await this.getSessionHeartRate(userId, sessionId);
    if (!hrData) {
      // Fallback: estimate from duration and activity type
      return { calories: Math.round(durationMinutes * 7), source: 'estimate' };
    }

    // Simplified calorie calculation from average HR
    // Formula: kcal/min ≈ (-55.0969 + 0.6309 × HR + 0.0901 × weight + 0.2017 × age) / 4.184
    // Simplified for unknown weight/age:
    const caloriesPerMin = (hrData.average - 60) * 0.1 + 3;
    return {
      calories: Math.round(caloriesPerMin * durationMinutes),
      source: 'heart_rate',
      averageHR: hrData.average,
    };
  }

  private getHRZone(bpm: number, maxHR: number) {
    const pct = (bpm / maxHR) * 100;
    return HR_ZONES.find((z) => pct >= z.minPct && pct < z.maxPct) || HR_ZONES[0];
  }
}
