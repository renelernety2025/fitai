import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class DiscoverWeeklyService {
  private readonly logger = new Logger(DiscoverWeeklyService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getWeeklyWorkout(userId: string) {
    const cacheKey = `discover-weekly:${userId}`;
    return this.cache.getOrSet(cacheKey, 7 * 86400, () =>
      this.generate(userId),
    );
  }

  private async generate(userId: string) {
    const [profile, recentSessions, history] = await Promise.all([
      this.prisma.fitnessProfile.findUnique({ where: { userId } }),
      this.prisma.gymSession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: { exerciseSets: { include: { exercise: true } } },
      }),
      this.prisma.exerciseHistory.findMany({
        where: { userId },
        include: { exercise: true },
      }),
    ]);

    const recentExercises = recentSessions
      .flatMap((s) => s.exerciseSets.map((set) => set.exercise?.name))
      .filter(Boolean);
    const weakMuscles = history
      .filter((h) => (h.avgFormScore ?? 100) < 65)
      .map((h) => h.exercise?.muscleGroups)
      .flat()
      .filter(Boolean);

    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic();

      const msg = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Create a "Workout of the Week" for this user. Reply in Czech, JSON:
{"title":"...","description":"...","exercises":[{"name":"...","sets":3,"reps":"8-12","why":"..."}]}

Profile: goal=${profile?.goal ?? 'general'}, experience=${profile?.experienceMonths ?? 0} months, injuries=${JSON.stringify(profile?.injuries ?? [])}, equipment=${JSON.stringify(profile?.equipment ?? [])}
Recent exercises: ${[...new Set(recentExercises)].slice(0, 10).join(', ')}
Weak muscles: ${[...new Set(weakMuscles)].join(', ') || 'none identified'}

Rules: 5-7 exercises, avoid recent ones, focus on weak areas, match experience level.`,
        }],
      });

      const text = msg.content[0]?.type === 'text'
        ? msg.content[0].text : '{}';
      const parsed = JSON.parse(text);
      return { ...parsed, generatedAt: new Date().toISOString() };
    } catch (err: any) {
      this.logger.warn(`Claude discover-weekly failed: ${err.message}`);
      return this.fallback();
    }
  }

  private fallback() {
    return {
      title: 'Full Body Balanced',
      description: 'Vyvazeny celotelesny trenink pro tento tyden.',
      exercises: [
        { name: 'Barbell Squat', sets: 4, reps: '6-8', why: 'Zaklad pro nohy a core' },
        { name: 'Bench Press', sets: 4, reps: '8-10', why: 'Compound na prsa a triceps' },
        { name: 'Barbell Row', sets: 4, reps: '8-10', why: 'Vyvazeni tlaku tahem' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10-12', why: 'Zadni retezec a hamstringy' },
        { name: 'Overhead Press', sets: 3, reps: '8-10', why: 'Ramena a stabilita trupu' },
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}
