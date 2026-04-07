import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EducationService {
  constructor(private prisma: PrismaService) {}

  // ── Lessons ──
  async getAllLessons(category?: string) {
    return this.prisma.educationLesson.findMany({
      where: { isPublished: true, ...(category ? { category } : {}) },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getLessonBySlug(slug: string) {
    const lesson = await this.prisma.educationLesson.findUnique({ where: { slug } });
    if (!lesson) throw new NotFoundException('Lekce nenalezena');
    return lesson;
  }

  /** Get lesson of the week — rotates by week number */
  async getLessonOfTheWeek() {
    const lessons = await this.prisma.educationLesson.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'asc' },
    });
    if (lessons.length === 0) return null;

    // Pick by week number
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const idx = week % lessons.length;
    return lessons[idx];
  }

  // ── Glossary ──
  async getGlossary(query?: string) {
    return this.prisma.glossaryTerm.findMany({
      where: query
        ? { OR: [{ termCs: { contains: query, mode: 'insensitive' } }, { definitionCs: { contains: query, mode: 'insensitive' } }] }
        : undefined,
      orderBy: { termCs: 'asc' },
    });
  }

  // ── Pre-workout briefing ──
  async getPreWorkoutBriefing(userId: string, gymSessionId: string) {
    const session = await this.prisma.gymSession.findUnique({
      where: { id: gymSessionId },
      include: {
        exerciseSets: {
          include: { exercise: true },
          orderBy: { setNumber: 'asc' },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Group sets by exercise
    const exerciseMap = new Map<string, { name: string; sets: number; targetReps: number; weight: number | null; muscleGroups: string[] }>();
    for (const s of session.exerciseSets) {
      const key = s.exerciseId;
      const existing = exerciseMap.get(key);
      if (existing) {
        existing.sets += 1;
      } else {
        exerciseMap.set(key, {
          name: s.exercise.nameCs,
          sets: 1,
          targetReps: s.targetReps,
          weight: s.targetWeight,
          muscleGroups: s.exercise.muscleGroups as string[],
        });
      }
    }

    const exercises = [...exerciseMap.values()];
    const totalSets = session.exerciseSets.length;
    const muscleGroups = [...new Set(exercises.flatMap((e) => e.muscleGroups))];
    const estimatedMin = Math.round(totalSets * 2.5); // ~2.5 min per set

    // Build briefing text
    const exerciseList = exercises.map((e) => `${e.name} (${e.sets}×${e.targetReps}${e.weight ? ` @ ${e.weight}kg` : ''})`).join(', ');
    const briefing = {
      greeting: `Ahoj ${user?.name ?? 'cvičenci'}!`,
      summary: `Dnes čeká ${exercises.length} cviků v ${totalSets} setech (~${estimatedMin} min).`,
      muscleGroups,
      exercises: exerciseList,
      tips: this.getRandomTips(profile?.goal ?? 'GENERAL_FITNESS'),
      warmupReminder: 'Nezapomeň se zahřát — kardio 5 min + dynamický strečink.',
    };
    return briefing;
  }

  // ── Post-workout debrief ──
  async getPostWorkoutDebrief(userId: string, gymSessionId: string) {
    const session = await this.prisma.gymSession.findUnique({
      where: { id: gymSessionId },
      include: {
        exerciseSets: { include: { exercise: true } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    const completed = session.exerciseSets.filter((s) => s.status === 'COMPLETED' && !s.isWarmup);
    const totalReps = completed.reduce((sum, s) => sum + s.actualReps, 0);
    const totalVolume = completed.reduce((sum, s) => sum + s.actualReps * (s.actualWeight ?? 0), 0);
    const avgForm = completed.length ? completed.reduce((sum, s) => sum + s.formScore, 0) / completed.length : 0;
    const avgRpe = completed.filter((s) => s.rpe).length
      ? completed.filter((s) => s.rpe).reduce((sum, s) => sum + (s.rpe ?? 0), 0) / completed.filter((s) => s.rpe).length
      : null;

    // Highlights
    const wins: string[] = [];
    const improvements: string[] = [];

    if (avgForm >= 85) wins.push(`🎯 Skvělá forma: ${Math.round(avgForm)}% průměr`);
    else if (avgForm < 60) improvements.push(`⚠️ Forma potřebuje zlepšit (${Math.round(avgForm)}%)`);

    if (avgRpe !== null) {
      if (avgRpe >= 8) improvements.push(`💪 Trénink byl velmi náročný (RPE ${avgRpe.toFixed(1)})`);
      else if (avgRpe <= 5) wins.push(`✨ Cítil ses čerstvě (RPE ${avgRpe.toFixed(1)}) — můžeš příště přidat`);
    }

    if (totalVolume > 0) wins.push(`📊 Celkový objem: ${Math.round(totalVolume)}kg`);
    if (totalReps >= 50) wins.push(`🔥 ${totalReps} opakování celkem`);

    // Best set
    const bestSet = completed.reduce((best, s) => (s.formScore > (best?.formScore ?? 0) ? s : best), completed[0]);
    if (bestSet) wins.push(`🏆 Nejlepší set: ${bestSet.exercise.nameCs} ${bestSet.actualReps} repů @ ${bestSet.actualWeight ?? 0}kg (${Math.round(bestSet.formScore)}%)`);

    // Recommendations for next workout
    const nextSteps: string[] = [];
    if (avgForm >= 80 && (avgRpe ?? 7) <= 7) {
      nextSteps.push('Příště zkus zvýšit váhu o 2.5kg na compound cvicích.');
    } else if (avgForm < 65) {
      nextSteps.push('Příště sniž váhu o 5% a zaměř se na techniku.');
    } else {
      nextSteps.push('Pokračuj se stejnou váhou — konzistence je klíč.');
    }
    nextSteps.push('Hydratuj se — vypij alespoň 2L vody.');
    nextSteps.push('Spi 7-9 hodin pro optimální regeneraci.');

    return {
      duration: session.durationSeconds,
      totalSets: completed.length,
      totalReps,
      totalVolumeKg: Math.round(totalVolume),
      avgFormScore: Math.round(avgForm),
      avgRpe: avgRpe ? Math.round(avgRpe * 10) / 10 : null,
      wins,
      improvements,
      nextSteps,
    };
  }

  private getRandomTips(goal: string): string[] {
    const all = {
      STRENGTH: [
        'Mezi sety odpočívej 3-5 minut — síla potřebuje plnou regeneraci.',
        'Zaměř se na compound cviky — největší síla z minimálního objemu.',
        'Záda VŽDY rovná — bezpečnost před výkonem.',
      ],
      HYPERTROPHY: [
        'Cítit "burn" je dobré — to znamená mechanické napětí.',
        'Mezi sety 60-90s odpočinku stačí.',
        'Mind-muscle connection — soustřeď se na sval, který pracuje.',
      ],
      ENDURANCE: [
        'Krátké pauzy (30-60s) udrží srdce v zóně.',
        'Dýchej rytmicky — výdech při úsilí.',
        'Nedělej do selhání — zachovej formu.',
      ],
      GENERAL_FITNESS: [
        'Konzistence > intenzita. Lepší cvičit 3× týdně dlouhodobě než 5× a vyhořet.',
        'Poslouchej tělo — bolest ≠ tlak. Bolest znamená stop.',
        'Progres je pomalý — 1% týdně = obrovský pokrok za rok.',
      ],
    };
    return (all as any)[goal] ?? all.GENERAL_FITNESS;
  }
}
