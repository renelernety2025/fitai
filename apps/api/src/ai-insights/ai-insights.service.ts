import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { CacheService } from '../cache/cache.service';
import { determineTodayAction, type TodayAction } from './today-action';
import {
  getRotatingSplits,
  getRecoverySplit,
  HEADLINE_MAP,
} from './daily-brief-templates';
import {
  type RecoveryTip,
  type NutritionTip,
  type WeeklyReview,
  type RecoveryStatus,
  type DailyBriefMood,
  type DailyBrief,
  localDateKey,
  todayDateUtc,
  yesterdayDateUtc,
  greeting,
  avg,
  calcRecoveryScore,
  calcRecoveryScoreSmart,
  classifyRecovery,
  normalizeMood,
  normalizeWorkout,
  staticTips,
  staticNutritionTips,
  staticReview,
  fallbackMotivation,
} from './ai-insights.helpers';

// Re-export types so existing imports keep working
export type {
  RecoveryTip,
  NutritionTip,
  WeeklyReview,
  RecoveryStatus,
  DailyBriefMood,
  DailyBrief,
};
export type {
  DailyBriefExercise,
  DailyBriefWorkout,
} from './ai-insights.helpers';

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);
  private readonly TTL_1H = 3600;
  private readonly TTL_24H = 86400;

  constructor(
    private prisma: PrismaService,
    private metrics: MetricsService,
    private cache: CacheService,
  ) {}

  async getRecoveryTips(
    userId: string,
  ): Promise<{ tips: RecoveryTip[]; cached: boolean }> {
    const cacheKey = `ai-insights:tips:${userId}`;
    const hit = await this.cache.get<RecoveryTip[]>(cacheKey);
    if (hit) return { tips: hit, cached: true };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const checkIns = await this.prisma.dailyCheckIn.findMany({
      where: { userId, date: { gte: sevenDaysAgo } },
      orderBy: { date: 'desc' },
    });

    if (checkIns.length === 0) {
      const fallback: RecoveryTip[] = [
        {
          category: 'recovery',
          title: 'Začni denním check-inem',
          body: 'Zaznamenej spánek, energii a stres každý den. AI ti pak dá personalizované rady.',
          priority: 'high',
        },
      ];
      return { tips: fallback, cached: false };
    }

    const avgSleep = avg(checkIns, 'sleepHours');
    const avgEnergy = avg(checkIns, 'energy');
    const avgSoreness = avg(checkIns, 'soreness');
    const avgStress = avg(checkIns, 'stress');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        tips: staticTips(avgSleep, avgEnergy, avgSoreness, avgStress),
        cached: false,
      };
    }

    try {
      const tips = await this.claudeRecoveryTips(
        checkIns.length,
        avgSleep,
        avgEnergy,
        avgSoreness,
        avgStress,
        apiKey,
      );
      await this.cache.set(cacheKey, tips, this.TTL_1H);
      return { tips, cached: false };
    } catch (e: any) {
      this.logger.warn(`Claude tips failed: ${e.message}`);
      return {
        tips: staticTips(avgSleep, avgEnergy, avgSoreness, avgStress),
        cached: false,
      };
    }
  }

  async getNutritionTips(
    userId: string,
  ): Promise<{ tips: NutritionTip[]; cached: boolean }> {
    const cacheKey = `ai-insights:nutrition:${userId}`;
    const hit = await this.cache.get<NutritionTip[]>(cacheKey);
    if (hit) return { tips: hit, cached: true };

    const [profile, recentLogs] = await Promise.all([
      this.prisma.fitnessProfile.findUnique({ where: { userId } }),
      this.prisma.foodLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    if (!profile?.dailyKcal && recentLogs.length === 0) {
      return {
        tips: [
          {
            category: 'macros',
            title: 'Nastav cíle výživy',
            body: 'Otevři Výživu a klikni "Spočítat z profilu". Pak budu moci dát personalizované rady.',
            priority: 'high',
          },
        ],
        cached: false,
      };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const weekLogs = recentLogs.filter(
      (l) => new Date(l.date) >= sevenDaysAgo,
    );
    const days =
      new Set(
        weekLogs.map((l) => new Date(l.date).toISOString().slice(0, 10)),
      ).size || 1;
    const dailyAvg = (key: 'kcal' | 'proteinG' | 'carbsG' | 'fatG') =>
      weekLogs.reduce(
        (s, l) =>
          s + ((l[key] as number) || 0) * ((l.servings as number) || 1),
        0,
      ) / days;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || weekLogs.length === 0) {
      return {
        tips: staticNutritionTips(
          profile,
          weekLogs.length === 0
            ? null
            : { kcal: dailyAvg('kcal'), protein: dailyAvg('proteinG') },
        ),
        cached: false,
      };
    }

    try {
      const tips = await this.claudeNutritionTips(
        profile,
        dailyAvg,
        apiKey,
      );
      await this.cache.set(cacheKey, tips, this.TTL_1H);
      return { tips, cached: false };
    } catch (e: any) {
      this.logger.warn(`Claude nutrition tips failed: ${e.message}`);
      return {
        tips: staticNutritionTips(profile, {
          kcal: dailyAvg('kcal'),
          protein: dailyAvg('proteinG'),
        }),
        cached: false,
      };
    }
  }

  async getWeeklyReview(
    userId: string,
  ): Promise<{ review: WeeklyReview; cached: boolean }> {
    const cacheKey = `ai-insights:review:${userId}`;
    const hit = await this.cache.get<WeeklyReview>(cacheKey);
    if (hit) return { review: hit, cached: true };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);

    const [sessions, checkIns, user] = await Promise.all([
      this.prisma.workoutSession.findMany({
        where: { userId, completedAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.dailyCheckIn.findMany({
        where: { userId, date: { gte: sevenDaysAgo } },
      }),
      this.prisma.user.findUnique({ where: { id: userId } }),
    ]);

    const sessionCount = sessions.length;
    const totalMinutes = sessions.reduce(
      (s, x) => s + (x.durationSeconds || 0) / 60,
      0,
    );
    const avgSleep =
      checkIns
        .filter((c) => c.sleepHours != null)
        .reduce((s, c) => s + (c.sleepHours || 0), 0) /
      Math.max(
        1,
        checkIns.filter((c) => c.sleepHours != null).length,
      );

    if (sessionCount === 0 && checkIns.length === 0) {
      const fallback: WeeklyReview = {
        summary:
          'Tento týden žádná data. Začni dnes a uvidíš svůj progres za týden.',
        highlights: [],
        improvements: [
          'Začni cvičit pravidelně',
          'Zaznamenej daily check-in',
        ],
        nextWeekFocus:
          'Konzistence — alespoň 2 tréninky a 5 check-inů.',
      };
      return { review: fallback, cached: false };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        review: staticReview(
          sessionCount,
          totalMinutes,
          avgSleep,
          checkIns.length,
        ),
        cached: false,
      };
    }

    try {
      const review = await this.claudeWeeklyReview(
        user?.name,
        sessionCount,
        totalMinutes,
        checkIns.length,
        avgSleep,
        apiKey,
      );
      await this.cache.set(cacheKey, review, this.TTL_1H);
      return { review, cached: false };
    } catch (e: any) {
      this.logger.warn(`Claude review failed: ${e.message}`);
      return {
        review: staticReview(
          sessionCount,
          totalMinutes,
          avgSleep,
          checkIns.length,
        ),
        cached: false,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // AI Coach Daily Brief — flagship hero feature
  // ─────────────────────────────────────────────────────────────────
  async getDailyBrief(
    userId: string,
  ): Promise<{ brief: DailyBrief; cached: boolean }> {
    const todayKey = localDateKey();
    const cacheKey = `ai-insights:brief:${userId}:${todayKey}`;
    const hit = await this.cache.get<DailyBrief>(cacheKey);
    if (hit) return { brief: hit, cached: true };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 14);

    const [user, profile] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.fitnessProfile.findUnique({ where: { userId } }),
    ]);

    const [checkIns, recentSessions, oneRepMaxes, weeklyVolumes, wearableData] =
      await Promise.all([
        this.prisma.dailyCheckIn.findMany({
          where: { userId, date: { gte: sevenDaysAgo } },
          orderBy: { date: 'desc' },
        }),
        this.prisma.workoutSession.findMany({
          where: { userId, completedAt: { gte: fourteenDaysAgo } },
          orderBy: { completedAt: 'desc' },
          take: 10,
        }),
        profile
          ? this.prisma.oneRepMax.findMany({
              where: { profileId: profile.id },
              orderBy: { createdAt: 'desc' },
              take: 5,
            })
          : Promise.resolve([] as any[]),
        this.prisma.weeklyVolume.findMany({
          where: { userId, weekStart: { gte: sevenDaysAgo } },
        }),
        this.prisma.wearableData.findMany({
          where: {
            userId,
            timestamp: { gte: sevenDaysAgo },
            dataType: { in: ['hrv', 'sleep', 'resting_hr'] },
          },
          select: { dataType: true, value: true },
        }),
      ]);

    const recovery = calcRecoveryScoreSmart(checkIns, wearableData);
    const recoveryScore = recovery.score;
    const recoveryStatus = classifyRecovery(
      recoveryScore,
      recentSessions.length,
    );
    const greet = greeting(user?.name);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const brief = await this.claudeDailyBrief({
          todayKey,
          greeting: greet,
          recoveryScore,
          recoveryStatus,
          recoverySource: recovery.source,
          hrv: recovery.hrv,
          restingHR: recovery.restingHR,
          wearableSleepHours: recovery.source === 'wearables' ? recovery.sleepHours : null,
          user,
          profile,
          checkIns,
          recentSessions,
          oneRepMaxes,
          weeklyVolumes,
          apiKey,
        });
        await this.cache.set(cacheKey, brief, this.TTL_24H);
        return { brief, cached: false };
      } catch (e: any) {
        this.logger.warn(`Claude daily brief failed: ${e.message}`);
      }
    }

    const brief = this.rulesDailyBrief({
      todayKey,
      greeting: greet,
      recoveryScore,
      recoveryStatus,
      profile,
      recentSessions,
    });
    await this.cache.set(cacheKey, brief, this.TTL_24H);
    return { brief, cached: false };
  }

  async getMotivation(userId: string) {
    const cacheKey = `ai-insights:motivation:${userId}`;
    const hit = await this.cache.get<string>(cacheKey);
    if (hit) return { message: hit, source: 'cache' };

    const [user, progress, profile] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.userProgress.findUnique({ where: { userId } }),
      this.prisma.fitnessProfile.findUnique({ where: { userId } }),
    ]);

    const name = user?.name?.split(' ')[0] || 'trenere';
    const streak = progress?.currentStreak ?? 0;
    const sessions = progress?.totalSessions ?? 0;
    const goal = profile?.goal || 'GENERAL_FITNESS';
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        message: fallbackMotivation(name, streak),
        source: 'fallback',
      };
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 150,
        system:
          'Jsi motivační fitness trenér. Generuješ 1 krátkou motivační větu (max 20 slov) v češtině. Buď energický, osobní, konkrétní. Odpověz POUZE textem věty.',
        messages: [
          {
            role: 'user',
            content: `Jméno: ${name}. Streak: ${streak} dní. Celkem tréninků: ${sessions}. Cíl: ${goal}.`,
          },
        ],
      });
      const text =
        response.content[0]?.type === 'text'
          ? response.content[0].text.trim()
          : fallbackMotivation(name, streak);

      await this.cache.set(cacheKey, text, 12 * 3600);
      return { message: text, source: 'claude' };
    } catch {
      return {
        message: fallbackMotivation(name, streak),
        source: 'fallback',
      };
    }
  }

  // ── Today Action (smart widget) ──

  async getTodayAction(userId: string): Promise<TodayAction> {
    const cacheKey = `ai-insights:today-action:${userId}`;
    const hit = await this.cache.get<TodayAction>(cacheKey);
    if (hit) return hit;

    const todayStart = todayDateUtc();
    const yesterdayStart = yesterdayDateUtc();
    const yesterdayEnd = new Date(todayStart);

    const [user, progress, profile, todayCheckIn, yesterdayLogs, todaySessions] =
      await Promise.all([
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.userProgress.findUnique({ where: { userId } }),
        this.prisma.fitnessProfile.findUnique({ where: { userId } }),
        this.prisma.dailyCheckIn.findFirst({
          where: { userId, date: { gte: todayStart } },
        }),
        this.prisma.foodLog.findMany({
          where: {
            userId,
            date: { gte: yesterdayStart, lt: yesterdayEnd },
          },
        }),
        this.prisma.workoutSession.findMany({
          where: { userId, completedAt: { gte: todayStart } },
          take: 1,
        }),
      ]);

    const daysSinceLastWorkout = progress?.lastWorkoutDate
      ? Math.floor(
          (Date.now() -
            new Date(progress.lastWorkoutDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    const yesterdayKcal =
      yesterdayLogs.length > 0
        ? yesterdayLogs.reduce(
            (sum, l) =>
              sum +
              ((l.kcal as number) || 0) *
                ((l.servings as number) || 1),
            0,
          )
        : null;

    const action = determineTodayAction({
      currentStreak: progress?.currentStreak ?? 0,
      daysSinceLastWorkout,
      todaySoreness: (todayCheckIn?.soreness as number) ?? null,
      yesterdayKcal,
      dailyKcalGoal: profile?.dailyKcal ?? null,
      hasWorkoutToday: todaySessions.length > 0,
      firstName: user?.name?.split(' ')[0] || 'Athlete',
    });

    await this.cache.set(cacheKey, action, this.TTL_1H);
    return action;
  }

  // ── Private Claude callers ──

  private async claudeRecoveryTips(
    checkInCount: number,
    avgSleep: number | null,
    avgEnergy: number | null,
    avgSoreness: number | null,
    avgStress: number | null,
    apiKey: string,
  ): Promise<RecoveryTip[]> {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey });
    const prompt = `Jsi AI fitness kouč. Uživatel zaznamenal posledních ${checkInCount} dní. Průměry:
- Spánek: ${avgSleep != null ? avgSleep.toFixed(1) + 'h' : 'neznámé'}
- Energie: ${avgEnergy != null ? avgEnergy.toFixed(1) + '/5' : 'neznámé'}
- Bolest svalů: ${avgSoreness != null ? avgSoreness.toFixed(1) + '/5' : 'neznámé'}
- Stres: ${avgStress != null ? avgStress.toFixed(1) + '/5' : 'neznámé'}

Vytvoř 3 konkrétní recovery tipy v češtině. Vrať JSON pole:
[{"category":"sleep|nutrition|recovery|stress|training","title":"krátký nadpis (max 6 slov)","body":"konkrétní rada (max 25 slov)","priority":"high|medium|low"}]

Pouze JSON, žádný další text.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    const text =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON in response');
    return JSON.parse(jsonMatch[0]);
  }

  private async claudeNutritionTips(
    profile: any,
    dailyAvg: (key: 'kcal' | 'proteinG' | 'carbsG' | 'fatG') => number,
    apiKey: string,
  ): Promise<NutritionTip[]> {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey });
    const prompt = `Jsi AI nutriční kouč. Uživatel v posledních 7 dnech jí v průměru:
- Kalorie: ${Math.round(dailyAvg('kcal'))} kcal (cíl ${profile?.dailyKcal || '?'})
- Protein: ${Math.round(dailyAvg('proteinG'))}g (cíl ${profile?.dailyProteinG || '?'}g)
- Sacharidy: ${Math.round(dailyAvg('carbsG'))}g (cíl ${profile?.dailyCarbsG || '?'}g)
- Tuky: ${Math.round(dailyAvg('fatG'))}g (cíl ${profile?.dailyFatG || '?'}g)
Cíl uživatele: ${profile?.goal || 'GENERAL_FITNESS'}

Vytvoř 3 konkrétní nutriční tipy v češtině. Vrať JSON pole:
[{"category":"protein|hydration|timing|macros|quality","title":"krátký nadpis (max 6 slov)","body":"konkrétní rada (max 25 slov)","priority":"high|medium|low"}]

Pouze JSON, žádný další text.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    const text =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON');
    return JSON.parse(jsonMatch[0]);
  }

  private async claudeWeeklyReview(
    userName: string | undefined | null,
    sessionCount: number,
    totalMinutes: number,
    checkInCount: number,
    avgSleep: number,
    apiKey: string,
  ): Promise<WeeklyReview> {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey });
    const prompt = `Jsi AI fitness kouč. Týdenní souhrn ${userName || 'uživatele'}:
- Tréninky: ${sessionCount}
- Celkem minut: ${Math.round(totalMinutes)}
- Daily check-iny: ${checkInCount}/7
- Průměrný spánek: ${isFinite(avgSleep) ? avgSleep.toFixed(1) + 'h' : 'neznámé'}

Napiš týdenní review v češtině. Vrať JSON:
{
  "summary": "1-2 věty co se dělo",
  "highlights": ["co se povedlo (max 3)"],
  "improvements": ["co zlepšit (max 2)"],
  "nextWeekFocus": "1 věta — hlavní cíl příštího týdne"
}

Pouze JSON, žádný další text.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });
    const text =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON');
    return JSON.parse(jsonMatch[0]);
  }

  private async claudeDailyBrief(ctx: {
    todayKey: string;
    greeting: string;
    recoveryScore: number;
    recoveryStatus: RecoveryStatus;
    recoverySource?: 'wearables' | 'self-reported';
    hrv?: number | null;
    restingHR?: number | null;
    wearableSleepHours?: number | null;
    user: any;
    profile: any;
    checkIns: any[];
    recentSessions: any[];
    oneRepMaxes: any[];
    weeklyVolumes: any[];
    apiKey: string;
  }): Promise<DailyBrief> {
    const {
      todayKey,
      recoveryScore,
      recoveryStatus,
      recoverySource,
      hrv,
      restingHR,
      wearableSleepHours,
      user,
      profile,
      checkIns,
      recentSessions,
      oneRepMaxes,
      weeklyVolumes,
      apiKey,
    } = ctx;

    const recentMuscles = recentSessions
      .map((s: any) => s.workoutType || '')
      .filter(Boolean)
      .slice(0, 3);

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic.default({ apiKey });
    const goal = profile?.goal || 'GENERAL_FITNESS';
    const exp = profile?.experienceMonths ?? 0;
    const equipment = profile?.equipment?.join(', ') || 'gym';
    const injuries = profile?.injuries?.length
      ? profile.injuries.join(', ')
      : 'žádná';
    const weeklyVolStr = weeklyVolumes.length
      ? weeklyVolumes
          .map(
            (v: any) =>
              `${v.muscleGroup}: ${v.totalSets || 0} setů`,
          )
          .join('; ')
      : 'žádná data';
    const oneRMStr = oneRepMaxes.length
      ? oneRepMaxes
          .map(
            (o: any) =>
              `${o.exerciseId}: ${Math.round(o.estimatedKg)}kg`,
          )
          .join('; ')
      : 'neznámé';

    const prompt = `Jsi elitní AI fitness trenér. Dnes (${todayKey}) generuješ osobní BRIÉFINK pro uživatele.

PROFIL:
- Jméno: ${user?.name || 'Athlete'}
- Cíl: ${goal}
- Zkušenosti: ${exp} měsíců
- Vybavení: ${equipment}
- Zranění: ${injuries}
- Priority svaly: ${profile?.priorityMuscles?.join(', ') || 'žádné'}

REGENERACE (posledních 7 dní):
- Recovery score: ${recoveryScore}/100 (status: ${recoveryStatus}, zdroj: ${recoverySource || 'self-reported'})
- Check-iny: ${checkIns.length}/7
${
  recoverySource === 'wearables'
    ? `- HealthKit/Watch data: ${wearableSleepHours != null ? `spánek ${wearableSleepHours.toFixed(1)}h` : ''}${hrv != null ? `, HRV ${hrv}ms` : ''}${restingHR != null ? `, klidový tep ${restingHR}bpm` : ''}`
    : ''
}
${
  checkIns.length > 0
    ? `- Self-report: spánek ${avg(checkIns, 'sleepHours')?.toFixed(1) || '?'}h, energie ${avg(checkIns, 'energy')?.toFixed(1) || '?'}/5, soreness ${avg(checkIns, 'soreness')?.toFixed(1) || '?'}/5, stres ${avg(checkIns, 'stress')?.toFixed(1) || '?'}/5`
    : '- Žádná self-report data'
}

POSLEDNÍ TRÉNINKY (posledních 14 dní):
- Počet sessions: ${recentSessions.length}
- Recent typy: ${recentMuscles.join(', ') || 'neznámé'}

WEEKLY VOLUME:
${weeklyVolStr}

1RM:
${oneRMStr}

ÚKOL: Vygeneruj DNEŠNÍ workout. Vyber správný split (push/pull/legs nebo full body), zohledni:
1. Co poslední 3 dny netrénoval = dej tomu prioritu
2. Pokud recovery < 50 → mood: "recover", lehké RPE 5-6
3. Pokud recovery 50-75 → mood: "maintain", RPE 7
4. Pokud recovery > 75 → mood: "push", RPE 8-9
5. Vyhni se cvikům co dráždí zranění

Vrať POUZE JSON, žádný další text:
{
  "headline": "krátká motivační věta (max 60 znaků)",
  "mood": "push|maintain|recover",
  "workout": {
    "title": "krátký název (např. 'Push (síla)')",
    "estimatedMinutes": 45,
    "warmup": "1 věta — co před tréninkem",
    "exercises": [
      {
        "name": "Bench Press",
        "nameCs": "Bench press",
        "sets": 4,
        "reps": "5-6",
        "weightKg": 60,
        "rpe": 8,
        "restSeconds": 180,
        "rationale": "krátký důvod (max 12 slov)"
      }
    ],
    "finisher": "volitelně — krátký kondiční prvek"
  },
  "rationale": "2-3 věty — proč tento workout dnes, propoj data",
  "motivationalHook": "1 silná motivační věta",
  "nutritionTip": "1 věta — co jíst/pít okolo tréninku",
  "alternativeIfTired": "1 věta — co dělat pokud nemáš energii"
}

Pravidla:
- 4-6 cviků (kromě recover dnů: 3-4)
- waitKg = null pro bodyweight
- rpe odpovídá mood
- vše v češtině`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const usage = (response as any).usage || {};
    this.metrics
      .recordClaudeTokens(
        'daily-brief',
        usage.input_tokens || 0,
        usage.output_tokens || 0,
      )
      .catch(() => {});

    const text =
      response.content[0].type === 'text'
        ? response.content[0].text
        : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      date: todayKey,
      greeting: ctx.greeting,
      headline: parsed.headline || 'Připraven na dnešek?',
      mood: normalizeMood(parsed.mood),
      recoveryStatus,
      recoveryScore,
      workout: normalizeWorkout(parsed.workout),
      rationale: parsed.rationale || '',
      motivationalHook: parsed.motivationalHook || '',
      nutritionTip: parsed.nutritionTip || '',
      alternativeIfTired: parsed.alternativeIfTired || '',
      source: 'claude',
    };
  }

  private rulesDailyBrief(ctx: {
    todayKey: string;
    greeting: string;
    recoveryScore: number;
    recoveryStatus: RecoveryStatus;
    profile: any;
    recentSessions: any[];
  }): DailyBrief {
    const { recoveryScore, recoveryStatus } = ctx;
    const mood: DailyBriefMood =
      recoveryScore >= 75
        ? 'push'
        : recoveryScore >= 50
        ? 'maintain'
        : 'recover';
    const rpe = mood === 'push' ? 8 : mood === 'maintain' ? 7 : 5;

    const dayOfYear = Math.floor(
      (Date.now() -
        new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    let split =
      mood === 'recover'
        ? getRecoverySplit()
        : getRotatingSplits(rpe)[dayOfYear % 3];

    return {
      date: ctx.todayKey,
      greeting: ctx.greeting,
      headline: HEADLINE_MAP[mood],
      mood,
      recoveryStatus,
      recoveryScore,
      workout: {
        title: split.title,
        estimatedMinutes: mood === 'recover' ? 30 : 50,
        warmup:
          mood === 'recover'
            ? 'Začni pomalu, žádný strečink ze studených svalů.'
            : '5 min rotoped/skipping + dynamický strečink ramen a kyčlí.',
        exercises: split.exercises,
        finisher:
          mood === 'push'
            ? 'Volitelně: 2× 30s plank navíc.'
            : undefined,
      },
      rationale:
        recoveryScore >= 75
          ? `Tvoje recovery score ${recoveryScore}/100 ukazuje, že jsi svěží — máš zelenou pro tvrdší trénink. Vybrali jsme split, který poslední dny nedostal pozornost.`
          : recoveryScore >= 50
          ? `Recovery ${recoveryScore}/100 — průměrný stav. Dnes drž standardní RPE 7 a soustřeď se na techniku, ne PR pokusy.`
          : `Recovery ${recoveryScore}/100 je nízké. Tělo říká „brzdi". Dnes regeneruj, zítra budeš silnější než kdybys to dnes přepálil.`,
      motivationalHook:
        mood === 'push'
          ? 'Jeden set navíc dnes = jeden krok blíž k tvému cíli.'
          : mood === 'maintain'
          ? 'Show up je 80% výsledku. Jdi tam.'
          : 'Regenerace není slabost — je to investice.',
      nutritionTip:
        mood === 'push'
          ? '30g sacharidů 30 min před tréninkem (banán nebo rýžová placka).'
          : mood === 'maintain'
          ? 'Hlídej protein — 1.6g/kg váhy denně, rozloženo do 4 jídel.'
          : 'Dnes přidej hydrataci a 1 navíc porci zeleniny.',
      alternativeIfTired:
        mood === 'recover'
          ? 'Pokud jsi vyčerpaný, vynech mobility a jen 20 min chůze.'
          : 'Cítíš se hůř? Sniž weight o 20% a udělej jen 3 cviky.',
      source: 'rules',
    };
  }
}
