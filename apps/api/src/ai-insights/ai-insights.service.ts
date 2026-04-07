import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecoveryTip {
  category: 'sleep' | 'nutrition' | 'recovery' | 'stress' | 'training';
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

interface CachedItem<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);
  private tipsCache = new Map<string, CachedItem<RecoveryTip[]>>();
  private reviewCache = new Map<string, CachedItem<WeeklyReview>>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor(private prisma: PrismaService) {}

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
}
