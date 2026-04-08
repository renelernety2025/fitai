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

  // ─── Section L: Generative Meal Planning ──────────────────────────
  // Claude Haiku generates a personalized 7-day meal plan respecting
  // user goals, allergies, daily macro targets and equipment.
  // Result is stored in MealPlan with @@unique([userId, weekStart]) so
  // each Monday gets one plan; calling generate again upserts it.

  async getCurrentMealPlan(userId: string) {
    const weekStart = this.mondayOfWeek(new Date());
    return (this.prisma as any).mealPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart } },
    });
  }

  async listMealPlans(userId: string, limit = 8) {
    return (this.prisma as any).mealPlan.findMany({
      where: { userId },
      orderBy: { weekStart: 'desc' },
      take: limit,
    });
  }

  async generateMealPlan(
    userId: string,
    opts: { weekStart?: string; preferences?: string; allergies?: string[]; cuisine?: string } = {},
  ) {
    const weekStart = this.mondayOfWeek(opts.weekStart ? new Date(opts.weekStart) : new Date());
    const profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const targets = profile
      ? this.calculateTargets({
          age: profile.age,
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          daysPerWeek: profile.daysPerWeek,
          goal: profile.goal,
        })
      : { dailyKcal: 2200, dailyProteinG: 140, dailyCarbsG: 250, dailyFatG: 70 };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let payload: any;
    let source: 'claude' | 'rules' = 'rules';

    if (apiKey) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const client = new Anthropic.default({ apiKey });
        const allergiesStr = opts.allergies?.length
          ? opts.allergies.join(', ')
          : profile?.injuries?.join(', ') || 'žádné';
        const cuisine = opts.cuisine || 'česká + středomořská';
        const prefs = opts.preferences || 'vyvážené, snadné na přípravu';
        const dates = this.weekDates(weekStart);

        const prompt = `Jsi expert nutriční terapeut. Vygeneruj personalizovaný JÍDELNÍČEK na 7 dní.

KLIENT: ${user?.name || 'Athlete'}
CÍL: ${profile?.goal || 'GENERAL_FITNESS'}
DENNÍ MAKRA:
- Kalorie: ${targets.dailyKcal} kcal
- Protein: ${targets.dailyProteinG} g
- Sacharidy: ${targets.dailyCarbsG} g
- Tuky: ${targets.dailyFatG} g

ALERGIE: ${allergiesStr}
KUCHYNĚ: ${cuisine}
PREFERENCE: ${prefs}
TÝDEN: ${dates[0]} až ${dates[6]}

Vygeneruj 7 dní × 4 jídla (snídaně, svačina, oběd, večeře). Realistická česká kuchyně.
Také agreguj nákupní seznam pro celý týden po kategoriích.

Vrať POUZE JSON:
{
  "weekStart": "${dates[0]}",
  "totalKcal": 15400,
  "avgKcalPerDay": 2200,
  "avgProteinG": 140,
  "days": [
    {
      "date": "${dates[0]}",
      "dayName": "Pondělí",
      "totals": {"kcal": 2200, "proteinG": 140, "carbsG": 250, "fatG": 75},
      "meals": [
        {
          "type": "breakfast",
          "name": "Ovesná kaše s borůvkami",
          "kcal": 450, "proteinG": 25, "carbsG": 60, "fatG": 12,
          "ingredients": ["80g ovesné vločky", "200ml mléko", "1 banán"],
          "prepMinutes": 10,
          "notes": "Volitelně skořice"
        }
      ]
    }
  ],
  "shoppingList": [
    {"category": "Ovoce a zelenina", "items": [{"name": "Banány", "qty": 7, "unit": "ks"}]},
    {"category": "Maso a ryby", "items": []},
    {"category": "Mléčné výrobky a vejce", "items": []},
    {"category": "Pečivo a obiloviny", "items": []},
    {"category": "Ostatní", "items": []}
  ]
}

Pravidla:
- Každý den ~ ${targets.dailyKcal} kcal ±100, protein ~ ${targets.dailyProteinG}g ±10
- Variabilita — neopakuj jídla 2 dny po sobě
- Realistická česká kuchyně
- Nákupní seznam přesně z ingrediencí všech 28 jídel
- Vše v češtině`;

        const response = await client.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 16000, // 28 meals + shopping list + ingredients is heavy
          messages: [{ role: 'user', content: prompt }],
        });
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        // Balanced-brace extraction: find first `{` and walk to matching `}`.
        // Safer than greedy regex for long responses that might contain
        // nested braces or even be truncated.
        const startIdx = text.indexOf('{');
        if (startIdx < 0) throw new Error('No JSON in response');
        let depth = 0;
        let endIdx = -1;
        let inString = false;
        let escape = false;
        for (let i = startIdx; i < text.length; i++) {
          const ch = text[i];
          if (escape) { escape = false; continue; }
          if (ch === '\\') { escape = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) { endIdx = i; break; }
          }
        }
        if (endIdx < 0) throw new Error(`JSON response truncated (depth=${depth}, length=${text.length})`);
        payload = JSON.parse(text.slice(startIdx, endIdx + 1));
        source = 'claude';
      } catch (e: any) {
        console.error('Meal plan Claude failed:', e.message);
        payload = this.rulesMealPlan(weekStart, targets);
      }
    } else {
      payload = this.rulesMealPlan(weekStart, targets);
    }

    return (this.prisma as any).mealPlan.upsert({
      where: { userId_weekStart: { userId, weekStart } },
      update: {
        payload,
        source,
        modelUsed: source === 'claude' ? 'claude-haiku-4-5' : 'rules',
        generatedAt: new Date(),
      },
      create: {
        userId,
        weekStart,
        payload,
        source,
        modelUsed: source === 'claude' ? 'claude-haiku-4-5' : 'rules',
      },
    });
  }

  async deleteMealPlan(userId: string, planId: string) {
    const plan = await (this.prisma as any).mealPlan.findUnique({ where: { id: planId } });
    if (!plan || plan.userId !== userId) return { deleted: false };
    await (this.prisma as any).mealPlan.delete({ where: { id: planId } });
    return { deleted: true };
  }

  // ── helpers for meal planning ──
  private mondayOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const day = d.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d;
  }

  private weekDates(monday: Date): string[] {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setUTCDate(monday.getUTCDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }

  private rulesMealPlan(
    monday: Date,
    targets: { dailyKcal: number; dailyProteinG: number; dailyCarbsG: number; dailyFatG: number },
  ) {
    const dates = this.weekDates(monday);
    const dayNames = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
    const breakfasts = [
      { name: 'Ovesná kaše s borůvkami a mandlemi', kcal: 450, proteinG: 25, carbsG: 60, fatG: 12, ingredients: ['80g ovesné vločky', '200ml mléko', '30g bobule', '20g mandle', '1 lžička medu'], prepMinutes: 10 },
      { name: 'Vajíčková omeleta s avokádem', kcal: 480, proteinG: 28, carbsG: 12, fatG: 35, ingredients: ['3 vejce', '1/2 avokáda', '50g špenát', '30g sýr', '1 lžíce másla'], prepMinutes: 12 },
      { name: 'Tvaroh s ovocem a granolou', kcal: 420, proteinG: 32, carbsG: 45, fatG: 10, ingredients: ['200g tvaroh', '1 banán', '50g granola', '20g vlašské ořechy'], prepMinutes: 5 },
      { name: 'Žitný chléb s lososem a vejcem', kcal: 460, proteinG: 30, carbsG: 35, fatG: 18, ingredients: ['2 plátky chleba', '80g uzený losos', '2 vejce', '1 lžíce másla'], prepMinutes: 8 },
    ];
    const lunches = [
      { name: 'Kuřecí prsa s rýží a brokolicí', kcal: 650, proteinG: 50, carbsG: 70, fatG: 15, ingredients: ['200g kuřecí prsa', '100g rýže', '200g brokolice', '1 lžíce olivového oleje'], prepMinutes: 25 },
      { name: 'Hovězí stroganoff s těstovinami', kcal: 720, proteinG: 45, carbsG: 65, fatG: 28, ingredients: ['180g hovězí maso', '120g těstoviny', '100g žampiony', '50ml smetana', 'cibule'], prepMinutes: 30 },
      { name: 'Losos s quinoa a špenátem', kcal: 680, proteinG: 42, carbsG: 60, fatG: 25, ingredients: ['180g losos', '80g quinoa', '200g špenát', 'cherry rajčata', 'citron'], prepMinutes: 20 },
      { name: 'Kuřecí kari s basmati', kcal: 700, proteinG: 48, carbsG: 75, fatG: 18, ingredients: ['200g kuřecí prsa', '100g basmati', '200ml kokosové mléko', 'kari koření'], prepMinutes: 25 },
    ];
    const dinners = [
      { name: 'Tuňákový salát s vejci', kcal: 480, proteinG: 38, carbsG: 25, fatG: 22, ingredients: ['1 plech. tuňák', '2 vejce', 'míchaný salát', '1/2 avokáda', 'olivový olej'], prepMinutes: 10 },
      { name: 'Krocaní steak se sladkými brambory', kcal: 550, proteinG: 45, carbsG: 50, fatG: 15, ingredients: ['180g krocaní prsa', '200g sladké brambory', 'zelené fazolky'], prepMinutes: 25 },
      { name: 'Tofu stir-fry se zeleninou', kcal: 470, proteinG: 28, carbsG: 45, fatG: 18, ingredients: ['200g tofu', 'paprika, cuketa, brokolice', 'sojová omáčka', '1 lžíce sezamový olej'], prepMinutes: 15 },
      { name: 'Cottage cheese s pomerančem a oříšky', kcal: 380, proteinG: 32, carbsG: 30, fatG: 14, ingredients: ['250g cottage cheese', '1 pomeranč', '20g vlašské ořechy', 'med'], prepMinutes: 5 },
    ];
    const snacks = [
      { name: 'Whey shake s banánem', kcal: 280, proteinG: 30, carbsG: 35, fatG: 3, ingredients: ['30g whey protein', '1 banán', '200ml mléko'], prepMinutes: 2 },
      { name: 'Řecký jogurt s medem a mandlemi', kcal: 220, proteinG: 18, carbsG: 25, fatG: 5, ingredients: ['200g řecký jogurt 0%', '1 lžíce medu', '20g mandle'], prepMinutes: 2 },
      { name: 'Hummus s mrkví a celerem', kcal: 240, proteinG: 8, carbsG: 25, fatG: 12, ingredients: ['80g hummus', '2 mrkve', '2 stonky celeru'], prepMinutes: 3 },
    ];

    const days = dates.map((date, i) => {
      const b = breakfasts[i % breakfasts.length];
      const l = lunches[i % lunches.length];
      const d = dinners[i % dinners.length];
      const s = snacks[i % snacks.length];
      const totals = {
        kcal: b.kcal + l.kcal + d.kcal + s.kcal,
        proteinG: b.proteinG + l.proteinG + d.proteinG + s.proteinG,
        carbsG: b.carbsG + l.carbsG + d.carbsG + s.carbsG,
        fatG: b.fatG + l.fatG + d.fatG + s.fatG,
      };
      return {
        date,
        dayName: dayNames[i],
        totals,
        meals: [
          { type: 'breakfast', ...b },
          { type: 'snack', ...s },
          { type: 'lunch', ...l },
          { type: 'dinner', ...d },
        ],
      };
    });

    const totalKcal = days.reduce((sum, day) => sum + day.totals.kcal, 0);
    const avgProtein = Math.round(days.reduce((sum, day) => sum + day.totals.proteinG, 0) / 7);

    const shoppingList = [
      {
        category: 'Maso a ryby',
        items: [
          { name: 'Kuřecí prsa', qty: 1.4, unit: 'kg' },
          { name: 'Hovězí maso', qty: 0.4, unit: 'kg' },
          { name: 'Losos', qty: 0.4, unit: 'kg' },
          { name: 'Krocaní prsa', qty: 0.4, unit: 'kg' },
          { name: 'Tuňák ve vlastní šťávě', qty: 2, unit: 'plechovky' },
          { name: 'Uzený losos', qty: 0.2, unit: 'kg' },
        ],
      },
      {
        category: 'Mléčné výrobky a vejce',
        items: [
          { name: 'Vejce', qty: 14, unit: 'ks' },
          { name: 'Tvaroh', qty: 0.4, unit: 'kg' },
          { name: 'Řecký jogurt 0%', qty: 0.4, unit: 'kg' },
          { name: 'Cottage cheese', qty: 0.5, unit: 'kg' },
          { name: 'Mléko', qty: 1.5, unit: 'l' },
        ],
      },
      {
        category: 'Ovoce a zelenina',
        items: [
          { name: 'Banány', qty: 7, unit: 'ks' },
          { name: 'Pomeranče', qty: 4, unit: 'ks' },
          { name: 'Avokádo', qty: 3, unit: 'ks' },
          { name: 'Borůvky / bobule', qty: 0.3, unit: 'kg' },
          { name: 'Brokolice', qty: 0.5, unit: 'kg' },
          { name: 'Špenát', qty: 0.4, unit: 'kg' },
          { name: 'Mrkve', qty: 1, unit: 'kg' },
          { name: 'Paprika, cuketa', qty: 1, unit: 'kg' },
        ],
      },
      {
        category: 'Pečivo a obiloviny',
        items: [
          { name: 'Ovesné vločky', qty: 0.5, unit: 'kg' },
          { name: 'Rýže basmati', qty: 0.5, unit: 'kg' },
          { name: 'Quinoa', qty: 0.3, unit: 'kg' },
          { name: 'Těstoviny', qty: 0.3, unit: 'kg' },
          { name: 'Žitný chléb', qty: 1, unit: 'bochník' },
          { name: 'Granola', qty: 0.3, unit: 'kg' },
        ],
      },
      {
        category: 'Ostatní',
        items: [
          { name: 'Whey protein', qty: 0.2, unit: 'kg' },
          { name: 'Mandle', qty: 0.2, unit: 'kg' },
          { name: 'Vlašské ořechy', qty: 0.15, unit: 'kg' },
          { name: 'Hummus', qty: 0.3, unit: 'kg' },
          { name: 'Olivový olej', qty: 1, unit: 'lahev' },
          { name: 'Tofu', qty: 0.2, unit: 'kg' },
          { name: 'Med', qty: 1, unit: 'sklenice' },
          { name: 'Sladké brambory', qty: 0.5, unit: 'kg' },
        ],
      },
    ];

    return {
      weekStart: dates[0],
      totalKcal,
      avgKcalPerDay: Math.round(totalKcal / 7),
      avgProteinG: avgProtein,
      days,
      shoppingList,
    };
  }
}
