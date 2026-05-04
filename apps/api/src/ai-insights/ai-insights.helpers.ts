// Pure helper functions extracted from AiInsightsService.
// No NestJS DI — these are stateless utilities.

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
  reps: string;
  weightKg: number | null;
  rpe: number;
  restSeconds: number;
  rationale: string;
}

export interface DailyBriefWorkout {
  title: string;
  estimatedMinutes: number;
  warmup: string;
  exercises: DailyBriefExercise[];
  finisher?: string;
}

export interface DailyBrief {
  date: string;
  greeting: string;
  headline: string;
  mood: DailyBriefMood;
  recoveryStatus: RecoveryStatus;
  recoveryScore: number;
  workout: DailyBriefWorkout;
  rationale: string;
  motivationalHook: string;
  nutritionTip: string;
  alternativeIfTired: string;
  source: 'claude' | 'rules';
}

export interface CachedItem<T> {
  data: T;
  expiresAt: number;
}

// ── Date helpers ──

export function localDateKey(): string {
  const now = new Date();
  const tz = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return tz;
}

export function endOfTodayMs(): number {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

export function todayDateUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function yesterdayDateUtc(): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ── Greeting ──

export function greeting(name?: string | null): string {
  const hour = new Date().getHours();
  const first = name?.split(' ')[0] || 'Athlete';
  if (hour < 11) return `Dobré ráno, ${first}.`;
  if (hour < 17) return `Dobré odpoledne, ${first}.`;
  return `Dobrý večer, ${first}.`;
}

// ── Numeric helpers ──

export function avg(items: any[], key: string): number | null {
  const vals = items
    .map((i) => i[key])
    .filter((v): v is number => typeof v === 'number');
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// ── Recovery scoring ──

export function calcRecoveryScore(checkIns: any[]): number {
  if (!checkIns.length) return 60;
  const sleep = avg(checkIns, 'sleepHours');
  const energy = avg(checkIns, 'energy');
  const soreness = avg(checkIns, 'soreness');
  const stress = avg(checkIns, 'stress');
  let score = 50;
  if (sleep != null) score += Math.max(-15, Math.min(20, (sleep - 6.5) * 6));
  if (energy != null) score += (energy - 3) * 8;
  if (soreness != null) score += (3 - soreness) * 6;
  if (stress != null) score += (3 - stress) * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

interface WearablePoint { dataType: string; value: number }

/**
 * Smart recovery score — prefers HealthKit/HealthConnect wearable data
 * (HRV, objective sleep, resting HR) over self-reported DailyCheckIn.
 * Falls back to the legacy formula when no wearable signals are present.
 */
export function calcRecoveryScoreSmart(
  checkIns: any[],
  wearables: WearablePoint[],
): { score: number; source: 'wearables' | 'self-reported'; hrv: number | null; sleepHours: number | null; restingHR: number | null } {
  const hrvVals = wearables.filter((w) => w.dataType === 'hrv').map((w) => w.value);
  const sleepVals = wearables.filter((w) => w.dataType === 'sleep').map((w) => w.value);
  const restVals = wearables.filter((w) => w.dataType === 'resting_hr').map((w) => w.value);
  const meanOf = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
  const hrv = meanOf(hrvVals);
  const wearableSleep = meanOf(sleepVals);
  const restingHR = meanOf(restVals);

  if (hrv == null && wearableSleep == null && restingHR == null) {
    return { score: calcRecoveryScore(checkIns), source: 'self-reported', hrv: null, sleepHours: avg(checkIns, 'sleepHours'), restingHR: null };
  }

  const sleep = wearableSleep ?? avg(checkIns, 'sleepHours');
  const energy = avg(checkIns, 'energy');
  const soreness = avg(checkIns, 'soreness');
  const stress = avg(checkIns, 'stress');
  let score = 50;
  if (sleep != null) score += Math.max(-15, Math.min(20, (sleep - 6.5) * 6));
  if (hrv != null) score += Math.max(-10, Math.min(15, (hrv - 35) * 0.5));
  if (restingHR != null) score += Math.max(-8, Math.min(10, (75 - restingHR) * 0.4));
  if (energy != null) score += (energy - 3) * 6;
  if (soreness != null) score += (3 - soreness) * 5;
  if (stress != null) score += (3 - stress) * 4;
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    source: 'wearables',
    hrv: hrv != null ? Math.round(hrv) : null,
    sleepHours: sleep,
    restingHR: restingHR != null ? Math.round(restingHR) : null,
  };
}

export function classifyRecovery(
  score: number,
  recentSessions: number,
): RecoveryStatus {
  if (score >= 80) return 'fresh';
  if (score >= 55) return 'normal';
  if (score >= 35 || recentSessions <= 2) return 'fatigued';
  return 'overreached';
}

// ── Normalizers (for Claude JSON output) ──

export function normalizeMood(m: any): DailyBriefMood {
  if (m === 'push' || m === 'maintain' || m === 'recover') return m;
  return 'maintain';
}

export function normalizeWorkout(w: any): DailyBriefWorkout {
  return {
    title: typeof w?.title === 'string' ? w.title : 'Trénink',
    estimatedMinutes: Number(w?.estimatedMinutes) || 45,
    warmup:
      typeof w?.warmup === 'string'
        ? w.warmup
        : '5 min lehké kardio + dynamický strečink.',
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

// ── Static fallbacks ──

export function staticTips(
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

export function staticNutritionTips(
  profile: any,
  avgData: { kcal: number; protein: number } | null,
): NutritionTip[] {
  const tips: NutritionTip[] = [];
  if (!avgData) {
    tips.push({
      category: 'quality',
      title: 'Začni logovat jídlo',
      body: 'Bez záznamů nemůžu dát konkrétní rady. Loguj alespoň protein.',
      priority: 'high',
    });
    return tips;
  }
  if (profile?.dailyProteinG && avgData.protein < profile.dailyProteinG * 0.85) {
    tips.push({
      category: 'protein',
      title: 'Přidej protein',
      body: `Tvůj průměr je ${Math.round(avgData.protein)}g, cíl ${profile.dailyProteinG}g. Přidej shake, tvaroh nebo vajíčka.`,
      priority: 'high',
    });
  }
  if (profile?.dailyKcal && avgData.kcal < profile.dailyKcal * 0.85) {
    tips.push({
      category: 'macros',
      title: 'Jíš málo kalorií',
      body: `Průměr ${Math.round(avgData.kcal)} vs cíl ${profile.dailyKcal}. Rizik podvýživy a ztráty svalů.`,
      priority: 'high',
    });
  }
  if (profile?.dailyKcal && avgData.kcal > profile.dailyKcal * 1.15) {
    tips.push({
      category: 'macros',
      title: 'Mírný přebytek kalorií',
      body: `Průměr ${Math.round(avgData.kcal)} vs cíl ${profile.dailyKcal}. Hlídej porce, hlavně večer.`,
      priority: 'medium',
    });
  }
  tips.push({
    category: 'hydration',
    title: 'Pij vodu mezi jídly',
    body: '2-3 litry denně. Hydratace ovlivňuje výkon, koncentraci i regeneraci.',
    priority: 'low',
  });
  return tips.slice(0, 3);
}

export function staticReview(
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

export function fallbackMotivation(
  name: string,
  streak: number,
): string {
  if (streak >= 7) return `${name}, ${streak} dni v rade! Takhle se to dela.`;
  if (streak >= 3) return `${name}, mas rozjeto! Dnes to nebalime.`;
  return `${name}, kazdy trenink se pocita. Jdeme na to!`;
}
