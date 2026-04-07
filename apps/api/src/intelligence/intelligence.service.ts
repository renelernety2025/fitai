import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PlateauReport {
  exerciseId: string;
  exerciseName: string;
  weeksStagnant: number;
  currentMaxWeight: number;
  recommendation: string;
  suggestedAction: 'deload' | 'change_rep_range' | 'add_volume' | 'change_exercise' | 'continue';
}

interface RecoveryReport {
  formTrend: 'improving' | 'stable' | 'declining';
  rpeTrend: 'manageable' | 'high' | 'overreaching';
  volumeTrend: 'progressive' | 'stable' | 'declining';
  overallStatus: 'fresh' | 'normal' | 'fatigued' | 'overreached';
  recommendation: string;
}

interface WeakPointReport {
  weakMuscleGroups: { muscle: string; reason: string; suggestedExercises: string[] }[];
  asymmetries: { joint: string; severity: number; recommendation: string }[];
}

@Injectable()
export class IntelligenceService {
  constructor(private prisma: PrismaService) {}

  // ── Plateau Detection ──
  // If the best weight for an exercise hasn't increased in 3+ weeks → plateau
  async detectPlateaus(userId: string): Promise<PlateauReport[]> {
    const history = await this.prisma.exerciseHistory.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { date: 'desc' },
    });

    // Group by exercise
    const byExercise = new Map<string, typeof history>();
    for (const h of history) {
      const arr = byExercise.get(h.exerciseId) || [];
      arr.push(h);
      byExercise.set(h.exerciseId, arr);
    }

    const plateaus: PlateauReport[] = [];

    for (const [exerciseId, entries] of byExercise) {
      if (entries.length < 3) continue;

      // Sort by date desc
      entries.sort((a, b) => b.date.getTime() - a.date.getTime());
      const last3 = entries.slice(0, 3);
      const maxWeights = last3.map((e) => e.bestWeight ?? 0);
      const currentMax = maxWeights[0];

      // Plateau: best weight hasn't increased over last 3 sessions
      const isPlateau = maxWeights.every((w) => w <= currentMax);
      if (!isPlateau || currentMax === 0) continue;

      // Calculate weeks stagnant
      const weeksStagnant = Math.floor(
        (entries[0].date.getTime() - entries[Math.min(2, entries.length - 1)].date.getTime()) /
          (1000 * 60 * 60 * 24 * 7),
      );
      if (weeksStagnant < 2) continue;

      // Recommendation based on form scores
      const avgForm = last3.reduce((s, e) => s + e.avgFormScore, 0) / last3.length;
      let suggestedAction: PlateauReport['suggestedAction'];
      let recommendation: string;

      if (avgForm >= 80) {
        suggestedAction = 'add_volume';
        recommendation = 'Forma je výborná. Zkus přidat jeden set navíc nebo zvýšit váhu o 2.5kg.';
      } else if (avgForm < 60) {
        suggestedAction = 'deload';
        recommendation = 'Forma klesá. Sniž váhu o 10% a zaměř se na techniku týden.';
      } else {
        suggestedAction = 'change_rep_range';
        recommendation = 'Změň rep range — zkus vyšší repy (12-15) s nižší vahou.';
      }

      plateaus.push({
        exerciseId,
        exerciseName: entries[0].exercise.nameCs,
        weeksStagnant,
        currentMaxWeight: currentMax,
        recommendation,
        suggestedAction,
      });
    }

    return plateaus;
  }

  // ── Recovery Analysis ──
  async analyzeRecovery(userId: string): Promise<RecoveryReport> {
    // Last 10 sets
    const recentSets = await this.prisma.exerciseSet.findMany({
      where: {
        gymSession: { userId },
        status: 'COMPLETED',
        isWarmup: false,
      },
      orderBy: { completedAt: 'desc' },
      take: 30,
    });

    if (recentSets.length < 5) {
      return {
        formTrend: 'stable',
        rpeTrend: 'manageable',
        volumeTrend: 'stable',
        overallStatus: 'normal',
        recommendation: 'Málo dat pro analýzu. Pokračuj v tréninku.',
      };
    }

    // Form trend: compare first half vs second half
    const half = Math.floor(recentSets.length / 2);
    const recentForm = recentSets.slice(0, half).reduce((s, x) => s + x.formScore, 0) / half;
    const olderForm = recentSets.slice(half).reduce((s, x) => s + x.formScore, 0) / (recentSets.length - half);
    const formDelta = recentForm - olderForm;

    const formTrend: RecoveryReport['formTrend'] =
      formDelta > 5 ? 'improving' : formDelta < -5 ? 'declining' : 'stable';

    // RPE trend
    const rpeSets = recentSets.filter((s) => s.rpe !== null);
    const avgRpe = rpeSets.length
      ? rpeSets.reduce((s, x) => s + (x.rpe ?? 0), 0) / rpeSets.length
      : 6;
    const rpeTrend: RecoveryReport['rpeTrend'] =
      avgRpe >= 9 ? 'overreaching' : avgRpe >= 7.5 ? 'high' : 'manageable';

    // Volume trend (compare last 2 weeks)
    const now = new Date();
    const week1Start = new Date(now);
    week1Start.setDate(now.getDate() - 7);
    const week2Start = new Date(now);
    week2Start.setDate(now.getDate() - 14);

    const w1Volume = recentSets
      .filter((s) => s.completedAt && s.completedAt >= week1Start)
      .reduce((sum, s) => sum + s.actualReps * (s.actualWeight ?? 0), 0);
    const w2Volume = recentSets
      .filter((s) => s.completedAt && s.completedAt >= week2Start && s.completedAt < week1Start)
      .reduce((sum, s) => sum + s.actualReps * (s.actualWeight ?? 0), 0);

    const volumeTrend: RecoveryReport['volumeTrend'] =
      w1Volume > w2Volume * 1.05 ? 'progressive' : w1Volume < w2Volume * 0.9 ? 'declining' : 'stable';

    // Overall status
    let overallStatus: RecoveryReport['overallStatus'];
    let recommendation: string;

    if (formTrend === 'declining' && rpeTrend === 'overreaching') {
      overallStatus = 'overreached';
      recommendation = 'Známky přetrénování! Doporučuji deload týden — sniž váhu o 30% a objem o 50%.';
    } else if (formTrend === 'declining' || rpeTrend === 'high') {
      overallStatus = 'fatigued';
      recommendation = 'Vypadáš unaveně. Přidej den odpočinku nebo sniž intenzitu o 10%.';
    } else if (formTrend === 'improving' && rpeTrend === 'manageable') {
      overallStatus = 'fresh';
      recommendation = 'Skvělá forma! Můžeš zkusit zvýšit váhu nebo přidat set.';
    } else {
      overallStatus = 'normal';
      recommendation = 'Vše v pořádku. Pokračuj v aktuálním tempu.';
    }

    return { formTrend, rpeTrend, volumeTrend, overallStatus, recommendation };
  }

  // ── Weak Point Detection ──
  async detectWeakPoints(userId: string): Promise<WeakPointReport> {
    // Find muscle groups with consistently low form scores
    const sets = await this.prisma.exerciseSet.findMany({
      where: { gymSession: { userId }, status: 'COMPLETED', isWarmup: false },
      include: { exercise: true },
      take: 100,
      orderBy: { completedAt: 'desc' },
    });

    const muscleScores = new Map<string, number[]>();
    for (const s of sets) {
      for (const m of s.exercise.muscleGroups as string[]) {
        const arr = muscleScores.get(m) || [];
        arr.push(s.formScore);
        muscleScores.set(m, arr);
      }
    }

    const weakMuscleGroups: WeakPointReport['weakMuscleGroups'] = [];
    for (const [muscle, scores] of muscleScores) {
      if (scores.length < 3) continue;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 65) {
        weakMuscleGroups.push({
          muscle,
          reason: `Průměrná forma ${Math.round(avg)}% za ${scores.length} setů`,
          suggestedExercises: this.getAccessoryExercises(muscle),
        });
      }
    }

    // Asymmetries from safety events
    const events = await this.prisma.safetyEvent.findMany({ where: { userId }, take: 50 });
    const jointCounts = new Map<string, number>();
    events.forEach((e) => jointCounts.set(e.jointName, (jointCounts.get(e.jointName) || 0) + 1));

    const asymmetries: WeakPointReport['asymmetries'] = [];
    const checkPair = (left: string, right: string, name: string) => {
      const l = jointCounts.get(left) || 0;
      const r = jointCounts.get(right) || 0;
      if (Math.abs(l - r) >= 3) {
        const weaker = l > r ? 'levé' : 'pravé';
        asymmetries.push({
          joint: `${weaker} ${name}`,
          severity: Math.abs(l - r),
          recommendation: `Přidej unilaterální cviky pro ${weaker} ${name}.`,
        });
      }
    };
    checkPair('left_knee', 'right_knee', 'koleno');
    checkPair('left_shoulder', 'right_shoulder', 'rameno');
    checkPair('left_elbow', 'right_elbow', 'loket');

    return { weakMuscleGroups, asymmetries };
  }

  // ── Priority Muscle Update ──
  async updatePriorityMuscles(userId: string, muscles: string[]) {
    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
    if (!profile) {
      return this.prisma.fitnessProfile.create({
        data: { userId, priorityMuscles: muscles },
      });
    }
    return this.prisma.fitnessProfile.update({
      where: { userId },
      data: { priorityMuscles: muscles },
    });
  }

  // ── Combined Insight ──
  async getInsights(userId: string) {
    const [plateaus, recovery, weakPoints] = await Promise.all([
      this.detectPlateaus(userId),
      this.analyzeRecovery(userId),
      this.detectWeakPoints(userId),
    ]);

    return { plateaus, recovery, weakPoints };
  }

  private getAccessoryExercises(muscle: string): string[] {
    const map: Record<string, string[]> = {
      CHEST: ['Push-ups', 'Dumbbell Fly', 'Cable Crossover'],
      BACK: ['Pull-ups', 'Lat Pulldown', 'Cable Row'],
      SHOULDERS: ['Lateral Raises', 'Face Pulls', 'Front Raises'],
      BICEPS: ['Hammer Curl', 'Concentration Curl', 'Cable Curl'],
      TRICEPS: ['Tricep Dips', 'Skullcrushers', 'Cable Pushdown'],
      QUADRICEPS: ['Leg Extension', 'Goblet Squat', 'Bulgarian Split Squat'],
      HAMSTRINGS: ['Leg Curl', 'Romanian Deadlift', 'Good Morning'],
      GLUTES: ['Hip Thrust', 'Glute Bridge', 'Cable Kickback'],
      CORE: ['Plank Variations', 'Hanging Leg Raises', 'Ab Wheel'],
    };
    return map[muscle] || [];
  }
}
