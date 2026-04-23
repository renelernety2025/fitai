import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { determineTodayAction, type TodayAction } from './today-action';

export interface RecoveryTip {
  category: 'sleep' | 'nutrition' | 'recovery' | 'stress' | 'training';
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
}

export interface NutritionTip {
  category: 'protein' | 'hydration' | 'timing' | 'macros' | 'quality';
  title: string;
  body: string;
  priority: 'high' | 'medium' | 'low';
}

export interface WeeklyReview {
  summary: string;
  highlights: string[];
  improvements: string[];
  nextWeekFocus: string;
}

export type RecoveryStatus = 'fresh' | 'normal' | 'fatigued' | 'overreached';
export type DailyBriefMood = 'push' | 'maintain' | 'recover';

export interface DailyBriefExercise {
  name: string;
  nameCs: string;
  sets: number;
  reps: string; // "5-6" or "8-10" or "AMRAP"
  weightKg: number | null; // null for bodyweight
  rpe: number; // 1-10
  restSeconds: number;
  rationale: string; // why this exercise today (max ~15 words)
}

export interface DailyBriefWorkout {
  title: string; // "Push (síla)" / "Pull (objem)"
  estimatedMinutes: number;
  warmup: string;
  exercises: DailyBriefExercise[];
  finisher?: string; // optional conditioning piece
}

export interface DailyBrief {
  date: string; // YYYY-MM-DD (Europe/Prague)
  greeting: string;
  headline: string; // single power line for hero (max 60 chars)
  mood: DailyBriefMood; // tells UI what color/energy to use
  recoveryStatus: RecoveryStatus;
  recoveryScore: number; // 0-100
  workout: DailyBriefWorkout;
  rationale: string; // 2-3 sentences why this workout, ties data together
  motivationalHook: string; // 1 sentence, action-oriented
  nutritionTip: string; // single sentence pre/post workout fueling tip
  alternativeIfTired: string; // 1 sentence light-day fallback
  source: 'claude' | 'rules'; // which path generated this
}

interface CachedItem<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);
  private tipsCache = new Map<string, CachedItem<RecoveryTip[]>>();
  private reviewCache = new Map<string, CachedItem<WeeklyReview>>();
  private nutritionCache = new Map<string, CachedItem<NutritionTip[]>>();
  private dailyBriefCache = new Map<string, CachedItem<DailyBrief>>();
  private motivationCache = new Map<string, CachedItem<string>>();
  private todayActionCache = new Map<string, CachedItem<TodayAction>>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor(
    private prisma: PrismaService,
    private metrics: MetricsService,
  ) {}

  async getRecoveryTips(userId: string): Promise<{ tips: RecoveryTip[]; cached: boolean }> {
    const cached = this.tipsCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return { tips: cached.data, cached: true };
    }

    // Gather context: last 7 days of habits + recovery score
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

    const avg = (key: keyof (typeof checkIns)[number]) => {
      const vals = checkIns.map((c) => (c as any)[key]).filter((v): v is number => v != null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    };
    const avgSleep = avg('sleepHours');
    const avgEnergy = avg('energy');
    const avgSoreness = avg('soreness');
    const avgStress = avg('stress');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Static fallback based on data
      return { tips: this.staticTips(avgSleep, avgEnergy, avgSoreness, avgStress), cached: false };
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });
      const prompt = `Jsi AI fitness kouč. Uživatel zaznamenal posledních ${checkIns.length} dní. Průměry:
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

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON in response');
      const tips: RecoveryTip[] = JSON.parse(jsonMatch[0]);

      this.tipsCache.set(userId, { data: tips, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return { tips, cached: false };
    } catch (e: any) {
      this.logger.warn(`Claude tips failed: ${e.message}`);
      return { tips: this.staticTips(avgSleep, avgEnergy, avgSoreness, avgStress), cached: false };
    }
  }

  private staticTips(
    sleep: number | null,
    energy: number | null,
    soreness: number | null,
    stress: number | null,
  ): RecoveryTip[] {
    const tips: RecoveryTip[] = [];
    if (sleep != null && sleep < 7) {
      tips.push({
        category: 'sleep',
        title: 'Spi více',
        body: `Tvůj průměr je ${sleep.toFixed(1)}h. Cílem je 7-9h. Jdi dnes spát o 30 minut dřív.`,
        priority: 'high',
      });
    }
    if (soreness != null && soreness >= 4) {
      tips.push({
        category: 'recovery',
        title: 'Aktivní regenerace',
        body: 'Vysoká bolest svalů. Dnes raději mobilitu, lehkou chůzi nebo plavání místo tréninku.',
        priority: 'high',
      });
    }
    if (stress != null && stress >= 4) {
      tips.push({
        category: 'stress',
        title: 'Sniž stres',
        body: '5 minut dechu před spaním (4-7-8 metoda) nebo 10 minut procházky odpoledne.',
        priority: 'medium',
      });
    }
    if (energy != null && energy <= 2) {
      tips.push({
        category: 'nutrition',
        title: 'Doplň energii',
        body: 'Nízká energie může být z jídla. Zkontroluj příjem sacharidů a hydrataci.',
        priority: 'medium',
      });
    }
    if (tips.length === 0) {
      tips.push({
        category: 'training',
        title: 'Pokračuj v tom',
        body: 'Tvoje regenerační čísla vypadají dobře. Trénuj plánovaně, neztrácej rytmus.',
        priority: 'low',
      });
    }
    return tips.slice(0, 3);
  }

  async getNutritionTips(userId: string): Promise<{ tips: NutritionTip[]; cached: boolean }> {
    const cached = this.nutritionCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return { tips: cached.data, cached: true };

    // Get profile + nutrition goals + recent food logs
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
        tips: [{
          category: 'macros',
          title: 'Nastav cíle výživy',
          body: 'Otevři Výživu a klikni "Spočítat z profilu". Pak budu moci dát personalizované rady.',
          priority: 'high',
        }],
        cached: false,
      };
    }

    // Aggregate last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    const weekLogs = recentLogs.filter((l) => new Date(l.date) >= sevenDaysAgo);
    const days = new Set(weekLogs.map((l) => new Date(l.date).toISOString().slice(0, 10))).size || 1;
    const dailyAvg = (key: 'kcal' | 'proteinG' | 'carbsG' | 'fatG') =>
      weekLogs.reduce((s, l) => s + ((l[key] as number) || 0) * (l.servings || 1), 0) / days;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || weekLogs.length === 0) {
      return { tips: this.staticNutritionTips(profile, weekLogs.length === 0 ? null : { kcal: dailyAvg('kcal'), protein: dailyAvg('proteinG') }), cached: false };
    }

    try {
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
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON');
      const tips: NutritionTip[] = JSON.parse(jsonMatch[0]);
      this.nutritionCache.set(userId, { data: tips, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return { tips, cached: false };
    } catch (e: any) {
      this.logger.warn(`Claude nutrition tips failed: ${e.message}`);
      return { tips: this.staticNutritionTips(profile, { kcal: dailyAvg('kcal'), protein: dailyAvg('proteinG') }), cached: false };
    }
  }

  private staticNutritionTips(profile: any, avg: { kcal: number; protein: number } | null): NutritionTip[] {
    const tips: NutritionTip[] = [];
    if (!avg) {
      tips.push({ category: 'quality', title: 'Začni logovat jídlo', body: 'Bez záznamů nemůžu dát konkrétní rady. Loguj alespoň protein.', priority: 'high' });
      return tips;
    }
    if (profile?.dailyProteinG && avg.protein < profile.dailyProteinG * 0.85) {
      tips.push({ category: 'protein', title: 'Přidej protein', body: `Tvůj průměr je ${Math.round(avg.protein)}g, cíl ${profile.dailyProteinG}g. Přidej shake, tvaroh nebo vajíčka.`, priority: 'high' });
    }
    if (profile?.dailyKcal && avg.kcal < profile.dailyKcal * 0.85) {
      tips.push({ category: 'macros', title: 'Jíš málo kalorií', body: `Průměr ${Math.round(avg.kcal)} vs cíl ${profile.dailyKcal}. Rizik podvýživy a ztráty svalů.`, priority: 'high' });
    }
    if (profile?.dailyKcal && avg.kcal > profile.dailyKcal * 1.15) {
      tips.push({ category: 'macros', title: 'Mírný přebytek kalorií', body: `Průměr ${Math.round(avg.kcal)} vs cíl ${profile.dailyKcal}. Hlídej porce, hlavně večer.`, priority: 'medium' });
    }
    tips.push({ category: 'hydration', title: 'Pij vodu mezi jídly', body: '2-3 litry denně. Hydratace ovlivňuje výkon, koncentraci i regeneraci.', priority: 'low' });
    return tips.slice(0, 3);
  }

  async getWeeklyReview(userId: string): Promise<{ review: WeeklyReview; cached: boolean }> {
    const cached = this.reviewCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return { review: cached.data, cached: true };
    }

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
    const totalMinutes = sessions.reduce((s, x) => s + (x.durationSeconds || 0) / 60, 0);
    const avgSleep =
      checkIns.filter((c) => c.sleepHours != null).reduce((s, c) => s + (c.sleepHours || 0), 0) /
      Math.max(1, checkIns.filter((c) => c.sleepHours != null).length);

    if (sessionCount === 0 && checkIns.length === 0) {
      const fallback: WeeklyReview = {
        summary: 'Tento týden žádná data. Začni dnes a uvidíš svůj progres za týden.',
        highlights: [],
        improvements: ['Začni cvičit pravidelně', 'Zaznamenej daily check-in'],
        nextWeekFocus: 'Konzistence — alespoň 2 tréninky a 5 check-inů.',
      };
      return { review: fallback, cached: false };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return {
        review: this.staticReview(sessionCount, totalMinutes, avgSleep, checkIns.length),
        cached: false,
      };
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });
      const prompt = `Jsi AI fitness kouč. Týdenní souhrn ${user?.name || 'uživatele'}:
- Tréninky: ${sessionCount}
- Celkem minut: ${Math.round(totalMinutes)}
- Daily check-iny: ${checkIns.length}/7
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

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON');
      const review: WeeklyReview = JSON.parse(jsonMatch[0]);

      this.reviewCache.set(userId, { data: review, expiresAt: Date.now() + this.CACHE_TTL_MS });
      return { review, cached: false };
    } catch (e: any) {
      this.logger.warn(`Claude review failed: ${e.message}`);
      return {
        review: this.staticReview(sessionCount, totalMinutes, avgSleep, checkIns.length),
        cached: false,
      };
    }
  }

  private staticReview(
    sessionCount: number,
    totalMinutes: number,
    avgSleep: number,
    checkInCount: number,
  ): WeeklyReview {
    return {
      summary: `Tento týden ${sessionCount} tréninků (${Math.round(totalMinutes)} minut) a ${checkInCount} check-inů.`,
      highlights:
        sessionCount >= 3
          ? [`${sessionCount} tréninků — solidní týden`]
          : ['Začínáš — drž tempo'],
      improvements:
        avgSleep < 7
          ? ['Zlepši spánek (cíl 7-9h)']
          : checkInCount < 5
          ? ['Více daily check-inů']
          : ['Pokračuj'],
      nextWeekFocus:
        sessionCount < 3
          ? 'Cíl: 3+ tréninky příští týden.'
          : 'Cíl: udrž rytmus a přidej regeneraci.',
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // AI Coach Daily Brief — flagship hero feature
  // Reads everything we know about the user (recovery, weekly volume,
  // plateau, injuries, profile, history) and generates a structured
  // workout plan for today + the rationale that ties it all together.
  // Cache: 24h per user, keyed by Europe/Prague date.
  // ─────────────────────────────────────────────────────────────────
  async getDailyBrief(userId: string): Promise<{ brief: DailyBrief; cached: boolean }> {
    const todayKey = this.localDateKey();
    const cacheKey = `${userId}:${todayKey}`;
    const cached = this.dailyBriefCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { brief: cached.data, cached: true };
    }

    // Stage 1: load user + profile (small, needed for downstream queries).
    // Stage 2: parallel-load all heavy data using profile.id where required.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 14);

    const [user, profile] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.fitnessProfile.findUnique({ where: { userId } }),
    ]);

    const [checkIns, recentSessions, oneRepMaxes, weeklyVolumes] = await Promise.all([
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
    ]);

    const recoveryScore = this.calcRecoveryScore(checkIns);
    const recoveryStatus = this.classifyRecovery(recoveryScore, recentSessions.length);
    const greeting = this.greeting(user?.name);

    // Decide focus split based on what we trained recently
    const recentMuscles = recentSessions
      .map((s: any) => s.workoutType || '')
      .filter(Boolean)
      .slice(0, 3);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
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
              .map((v: any) => `${v.muscleGroup}: ${v.totalSets || 0} setů`)
              .join('; ')
          : 'žádná data';
        const oneRMStr = oneRepMaxes.length
          ? oneRepMaxes.map((o: any) => `${o.exerciseId}: ${Math.round(o.estimatedKg)}kg`).join('; ')
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
- Recovery score: ${recoveryScore}/100 (status: ${recoveryStatus})
- Check-iny: ${checkIns.length}/7
${
  checkIns.length > 0
    ? `- Průměr spánku: ${this.avg(checkIns, 'sleepHours')?.toFixed(1) || '?'}h
- Průměr energie: ${this.avg(checkIns, 'energy')?.toFixed(1) || '?'}/5
- Průměr soreness: ${this.avg(checkIns, 'soreness')?.toFixed(1) || '?'}/5
- Průměr stresu: ${this.avg(checkIns, 'stress')?.toFixed(1) || '?'}/5`
    : '- Žádná data, použij konzervativní RPE'
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
        // Record Claude token usage for cost tracking
        const usage = (response as any).usage || {};
        this.metrics.recordClaudeTokens(
          'daily-brief',
          usage.input_tokens || 0,
          usage.output_tokens || 0,
        ).catch(() => {});

        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in response');
        const parsed = JSON.parse(jsonMatch[0]);

        const brief: DailyBrief = {
          date: todayKey,
          greeting,
          headline: parsed.headline || 'Připraven na dnešek?',
          mood: this.normalizeMood(parsed.mood),
          recoveryStatus,
          recoveryScore,
          workout: this.normalizeWorkout(parsed.workout),
          rationale: parsed.rationale || '',
          motivationalHook: parsed.motivationalHook || '',
          nutritionTip: parsed.nutritionTip || '',
          alternativeIfTired: parsed.alternativeIfTired || '',
          source: 'claude',
        };
        this.dailyBriefCache.set(cacheKey, {
          data: brief,
          expiresAt: this.endOfTodayMs(),
        });
        return { brief, cached: false };
      } catch (e: any) {
        this.logger.warn(`Claude daily brief failed: ${e.message}`);
        // fall through to rules
      }
    }

    // Rules-based fallback
    const brief = this.rulesDailyBrief({
      todayKey,
      greeting,
      recoveryScore,
      recoveryStatus,
      profile,
      recentSessions,
    });
    this.dailyBriefCache.set(cacheKey, {
      data: brief,
      expiresAt: this.endOfTodayMs(),
    });
    return { brief, cached: false };
  }

  // ── helpers ──
  private localDateKey(): string {
    // Europe/Prague — same offset as user's primary tz
    const now = new Date();
    const tz = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Prague',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    return tz; // already YYYY-MM-DD in sv-SE
  }

  private endOfTodayMs(): number {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return end.getTime();
  }

  private greeting(name?: string | null): string {
    const hour = new Date().getHours();
    const first = name?.split(' ')[0] || 'Athlete';
    if (hour < 11) return `Dobré ráno, ${first}.`;
    if (hour < 17) return `Dobré odpoledne, ${first}.`;
    return `Dobrý večer, ${first}.`;
  }

  private avg(items: any[], key: string): number | null {
    const vals = items.map((i) => i[key]).filter((v): v is number => typeof v === 'number');
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  private calcRecoveryScore(checkIns: any[]): number {
    if (!checkIns.length) return 60; // unknown → neutral
    const sleep = this.avg(checkIns, 'sleepHours');
    const energy = this.avg(checkIns, 'energy');
    const soreness = this.avg(checkIns, 'soreness');
    const stress = this.avg(checkIns, 'stress');
    let score = 50;
    if (sleep != null) score += Math.max(-15, Math.min(20, (sleep - 6.5) * 6));
    if (energy != null) score += (energy - 3) * 8;
    if (soreness != null) score += (3 - soreness) * 6;
    if (stress != null) score += (3 - stress) * 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private classifyRecovery(score: number, recentSessions: number): RecoveryStatus {
    if (score >= 80) return 'fresh';
    if (score >= 55) return 'normal';
    if (score >= 35 || recentSessions <= 2) return 'fatigued';
    return 'overreached';
  }

  private normalizeMood(m: any): DailyBriefMood {
    if (m === 'push' || m === 'maintain' || m === 'recover') return m;
    return 'maintain';
  }

  private normalizeWorkout(w: any): DailyBriefWorkout {
    return {
      title: typeof w?.title === 'string' ? w.title : 'Trénink',
      estimatedMinutes: Number(w?.estimatedMinutes) || 45,
      warmup: typeof w?.warmup === 'string' ? w.warmup : '5 min lehké kardio + dynamický strečink.',
      exercises: Array.isArray(w?.exercises)
        ? w.exercises.slice(0, 8).map((e: any) => ({
            name: String(e?.name || 'Cvik'),
            nameCs: String(e?.nameCs || e?.name || 'Cvik'),
            sets: Number(e?.sets) || 3,
            reps: String(e?.reps || '8-10'),
            weightKg: e?.weightKg != null ? Number(e.weightKg) : null,
            rpe: Number(e?.rpe) || 7,
            restSeconds: Number(e?.restSeconds) || 90,
            rationale: String(e?.rationale || ''),
          }))
        : [],
      finisher: typeof w?.finisher === 'string' ? w.finisher : undefined,
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
    const { recoveryScore, recoveryStatus, profile } = ctx;
    const mood: DailyBriefMood =
      recoveryScore >= 75 ? 'push' : recoveryScore >= 50 ? 'maintain' : 'recover';
    const rpe = mood === 'push' ? 8 : mood === 'maintain' ? 7 : 5;

    // Pick a rotating split based on day-of-year (simple but stable)
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const splits = [
      {
        title: 'Push (hrudník + ramena + triceps)',
        exercises: [
          { name: 'Bench Press', nameCs: 'Bench press', sets: 4, reps: '5-8', weightKg: null, rpe, restSeconds: 150, rationale: 'Hlavní compound — vytváří sílu' },
          { name: 'Overhead Press', nameCs: 'Tlaky nad hlavu', sets: 3, reps: '6-8', weightKg: null, rpe, restSeconds: 120, rationale: 'Ramena — stability + síla' },
          { name: 'Incline DB Press', nameCs: 'Šikmé tlaky s činkami', sets: 3, reps: '8-10', weightKg: null, rpe: rpe - 1, restSeconds: 90, rationale: 'Horní hrudník — objem' },
          { name: 'Triceps Pushdown', nameCs: 'Triceps na kladce', sets: 3, reps: '10-12', weightKg: null, rpe: rpe - 1, restSeconds: 60, rationale: 'Izolace — pump' },
        ],
      },
      {
        title: 'Pull (záda + biceps)',
        exercises: [
          { name: 'Deadlift', nameCs: 'Mrtvý tah', sets: 3, reps: '5', weightKg: null, rpe, restSeconds: 180, rationale: 'Total body síla' },
          { name: 'Pull-up', nameCs: 'Shyby', sets: 4, reps: '6-8', weightKg: null, rpe, restSeconds: 120, rationale: 'Široká záda' },
          { name: 'Barbell Row', nameCs: 'Veslování s činkou', sets: 3, reps: '8-10', weightKg: null, rpe: rpe - 1, restSeconds: 90, rationale: 'Tloušťka středu zad' },
          { name: 'Barbell Curl', nameCs: 'Bicepsové zdvihy', sets: 3, reps: '10', weightKg: null, rpe: rpe - 1, restSeconds: 60, rationale: 'Biceps' },
        ],
      },
      {
        title: 'Legs (nohy + jádro)',
        exercises: [
          { name: 'Back Squat', nameCs: 'Dřep s činkou', sets: 4, reps: '5-6', weightKg: null, rpe, restSeconds: 180, rationale: 'King of legs' },
          { name: 'Romanian Deadlift', nameCs: 'Rumunský mrtvý tah', sets: 3, reps: '8', weightKg: null, rpe: rpe - 1, restSeconds: 120, rationale: 'Hamstringy + glutea' },
          { name: 'Walking Lunge', nameCs: 'Chůze s výpady', sets: 3, reps: '12/noha', weightKg: null, rpe: rpe - 1, restSeconds: 90, rationale: 'Unilaterální stability' },
          { name: 'Plank', nameCs: 'Plank', sets: 3, reps: '45s', weightKg: null, rpe: 6, restSeconds: 45, rationale: 'Core endurance' },
        ],
      },
    ];
    let split = splits[dayOfYear % splits.length];

    if (mood === 'recover') {
      split = {
        title: 'Aktivní regenerace',
        exercises: [
          { name: 'Light Cardio', nameCs: 'Lehké kardio', sets: 1, reps: '20 min', weightKg: null, rpe: 4, restSeconds: 0, rationale: 'Krevní oběh, žádná zátěž' },
          { name: 'Mobility Flow', nameCs: 'Mobility flow', sets: 1, reps: '10 min', weightKg: null, rpe: 3, restSeconds: 0, rationale: 'Otevři kyčle a ramena' },
          { name: 'Foam Roll', nameCs: 'Foam roller', sets: 1, reps: '10 min', weightKg: null, rpe: 2, restSeconds: 0, rationale: 'Self-massage' },
        ],
      };
    }

    const headlineMap: Record<DailyBriefMood, string> = {
      push: 'Dnes přidáme. Recovery je tvůj parťák.',
      maintain: 'Drž tempo. Konzistence vyhrává.',
      recover: 'Dnes regenerace. Zítra zase tlačíme.',
    };

    return {
      date: ctx.todayKey,
      greeting: ctx.greeting,
      headline: headlineMap[mood],
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
        finisher: mood === 'push' ? 'Volitelně: 2× 30s plank navíc.' : undefined,
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

  /** Personalized daily motivation — short Claude-generated message. Cached 12h. */
  async getMotivation(userId: string) {
    const cacheKey = `motivation:${userId}`;
    const cached = this.motivationCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return { message: cached.data, source: 'cache' };

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
      const fallback = this.fallbackMotivation(name, streak);
      return { message: fallback, source: 'fallback' };
    }

    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic.default({ apiKey });
      const response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 150,
        system: 'Jsi motivační fitness trenér. Generuješ 1 krátkou motivační větu (max 20 slov) v češtině. Buď energický, osobní, konkrétní. Odpověz POUZE textem věty.',
        messages: [{
          role: 'user',
          content: `Jméno: ${name}. Streak: ${streak} dní. Celkem tréninků: ${sessions}. Cíl: ${goal}.`,
        }],
      });
      const text = response.content[0]?.type === 'text'
        ? response.content[0].text.trim()
        : this.fallbackMotivation(name, streak);

      this.motivationCache.set(cacheKey, { data: text, expiresAt: Date.now() + 12 * 3600 * 1000 });
      return { message: text, source: 'claude' };
    } catch {
      return { message: this.fallbackMotivation(name, streak), source: 'fallback' };
    }
  }

  private fallbackMotivation(name: string, streak: number): string {
    if (streak >= 7) return `${name}, ${streak} dni v rade! Takhle se to dela.`;
    if (streak >= 3) return `${name}, mas rozjeto! Dnes to nebalime.`;
    return `${name}, kazdy trenink se pocita. Jdeme na to!`;
  }

  // ── Today Action (smart widget) ──

  async getTodayAction(userId: string): Promise<TodayAction> {
    const cached = this.todayActionCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const todayStart = this.todayDateUtc();
    const yesterdayStart = this.yesterdayDateUtc();
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
          where: { userId, date: { gte: yesterdayStart, lt: yesterdayEnd } },
        }),
        this.prisma.workoutSession.findMany({
          where: { userId, completedAt: { gte: todayStart } },
          take: 1,
        }),
      ]);

    const daysSinceLastWorkout = progress?.lastWorkoutDate
      ? Math.floor(
          (Date.now() - new Date(progress.lastWorkoutDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    const yesterdayKcal = yesterdayLogs.length > 0
      ? yesterdayLogs.reduce(
          (sum, l) => sum + ((l.kcal as number) || 0) * ((l.servings as number) || 1),
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

    this.todayActionCache.set(userId, {
      data: action,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
    return action;
  }

  private todayDateUtc(): Date {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private yesterdayDateUtc(): Date {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
}
