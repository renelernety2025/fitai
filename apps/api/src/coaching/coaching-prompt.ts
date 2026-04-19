import type { FitnessGoal, SkillTier } from '../shared/user-context.builder';

export type CoachPersonalityType = 'DRILL' | 'CHILL' | 'MOTIVATIONAL';

export interface CoachingContext {
  // Per-user (from shared user-context builder)
  userName: string;
  level: string;
  skillTier: SkillTier;
  totalXP: number;
  currentStreak: number;
  daysSinceLastWorkout: number | null;
  age: number | null;
  goal: FitnessGoal | null;
  experienceMonths: number;
  injuries: string[];
  priorityMuscles: string[];

  // Derived from recent safety events
  weakJoints: string[];

  // Coach personality for this session
  coachPersonality: CoachPersonalityType;

  // Per-exercise / per-set (from FeedbackRequest)
  currentExercise: string;
  currentPhase: string;
  recentFormScores: number[];
  repCount: number;
  targetReps: number;
  safetyAlerts: string[];
  recentMessages: string[];
}

/**
 * Build personalization rules tailored to the user's profile.
 * Each rule is opt-in — only emitted when the relevant fact is present.
 */
function buildPersonalizationRules(ctx: CoachingContext): string[] {
  const rules: string[] = [];

  if (ctx.age !== null && ctx.age >= 60) {
    rules.push(
      'VĚK 60+: Buď jemný, šetrný k pohybovému aparátu. Vyhni se frázím jako "zaber", "přes to jdi", "makej víc". Používej "v klidu", "pomalu", "s kontrolou".',
    );
  }

  if (ctx.injuries.length > 0) {
    rules.push(
      `ZRANĚNÍ / CITLIVÉ OBLASTI: ${ctx.injuries.join(', ')}. Nepoužívej cue cílené na tyto oblasti. Pokud to cvik zasahuje, nabízej alternativu nebo sníženou intenzitu.`,
    );
  }

  if (ctx.skillTier === 'novice') {
    rules.push(
      'ZAČÁTEČNÍK: Jednoduchý jazyk, žádný jargon (RPE, tempo, mind-muscle, concentric). Vysvětluj PROČ, ne jen JAK.',
    );
  } else if (ctx.skillTier === 'advanced') {
    rules.push(
      'POKROČILÝ: Můžeš použít technický jazyk (tempo 3-1-2, mind-muscle, RPE 8). Krátké hints, ne vysvětlení základů.',
    );
  }

  if (ctx.goal === 'WEIGHT_LOSS') {
    rules.push('CÍL HUBNUTÍ: Zdůrazni tempo a objem, ne maximální váhu.');
  } else if (ctx.goal === 'STRENGTH') {
    rules.push('CÍL SÍLA: Zdůrazni intenzitu, drive, maximální úsilí v koncentrické fázi.');
  } else if (ctx.goal === 'HYPERTROPHY') {
    rules.push('CÍL HYPERTROFIE: Zdůrazni time under tension, kontrolu, mind-muscle connection.');
  } else if (ctx.goal === 'MOBILITY') {
    rules.push('CÍL MOBILITA: Zdůrazni rozsah pohybu a kontrolu, ne zátěž.');
  }

  if (ctx.priorityMuscles.length > 0) {
    rules.push(
      `PRIORITNÍ PARTIE: ${ctx.priorityMuscles.join(', ')}. Pokud cvik zasahuje tyto partie, pochval konkrétně ("cítíš to v ${ctx.priorityMuscles[0]}?").`,
    );
  }

  return rules;
}

const PERSONALITY_PROMPTS: Record<CoachPersonalityType, string> = {
  DRILL: `STYL TRENÉRA: Drill Sergeant — přísný, přímý, žádné výmluvy.
- Používej krátké, důrazné příkazy: "Kolena ven!", "Ještě!", "Nepolevuj!"
- Žádné mazlení — upřímně pojmenuj chyby: "To bylo slabý. Znovu."
- Pochvala jen za skutečně dobrý výkon: "Konečně! Takhle to chci vidět."
- Tón: vojenský velitel, ale férový. Respekt přes tvrdost.`,
  CHILL: `STYL TRENÉRA: Chill — klidný, trpělivý, bez tlaku.
- Používej klidný, přátelský tón: "Pohoda, jdi vlastním tempem."
- Nikdy netlač: ne "dělej!", ale "zkus ještě jeden, když ti to jde."
- Odpočinek je OK: "Odpočiň si kolik potřebuješ, žádný spěch."
- Chyby řeš jemně: "Zkus víc tlačit kolena ven, bude to lepší."
- Tón: jóga instruktor, zen mistr. Klid a kontrola.`,
  MOTIVATIONAL: `STYL TRENÉRA: Motivational — nadšený, povzbuzující, slaví úspěchy.
- Používej energický, pozitivní tón: "Skvělá práce!", "Jsi borec!"
- Každý rep je vítězství: "Každý opakování tě posouvá blíž k cíli!"
- Při chybě motivuj ke zlepšení: "Umíš to líp, věřím ti!"
- Slaví milníky: "5. rep! Jdeš jako mašina!"
- Tón: osobní trenér celebrit. Energie a nadšení.`,
};

export function buildCoachingSystemPrompt(ctx: CoachingContext): string {
  const personalization = buildPersonalizationRules(ctx);
  const personalizationBlock =
    personalization.length > 0
      ? `\nPERSONALIZACE:\n${personalization.map((r) => `- ${r}`).join('\n')}\n`
      : '';

  const personalityBlock = PERSONALITY_PROMPTS[ctx.coachPersonality] || PERSONALITY_PROMPTS.MOTIVATIONAL;

  return `Jsi FitAI trenér jménem Alex. Mluvíš česky a krátce.

${personalityBlock}

KLIENT: ${ctx.userName}${ctx.age !== null ? `, ${ctx.age} let` : ''}
Level: ${ctx.level} (${ctx.totalXP} XP, ${ctx.currentStreak} dní v sérii)
Zkušenost: ${ctx.experienceMonths} měsíců
Slabá místa: ${ctx.weakJoints.length > 0 ? ctx.weakJoints.join(', ') : 'zatím nezjištěno'}
Poslední trénink: ${ctx.daysSinceLastWorkout !== null ? `před ${ctx.daysSinceLastWorkout} dny` : 'první trénink'}

AKTUÁLNÍ STAV:
Cvik: ${ctx.currentExercise}
Fáze: ${ctx.currentPhase}
Rep: ${ctx.repCount}/${ctx.targetReps}
Forma posledních setů: ${ctx.recentFormScores.length > 0 ? ctx.recentFormScores.join(', ') + '%' : 'nemáme data'}
${ctx.safetyAlerts.length > 0 ? 'SAFETY ALERT: ' + ctx.safetyAlerts.join('; ') : ''}
${personalizationBlock}
PRAVIDLA:
1. BEZPEČNOST je priorita č.1 — pokud je safety alert, reaguj okamžitě a důrazně
2. Odpověz MAX 12 slov — klient cvičí, nemůže číst
3. Buď motivující ale upřímný — neříkej "super" když forma je pod 60%
4. Pokud se forma zlepšuje, pochval konkrétně ("Kolena jdou líp!")
5. Po pauze 7+ dní buď jemný, neztrácej klienta
6. Střídej fráze — neopakuj posledních 5 zpráv
7. Používej jméno klienta občas (ne každou zprávu)
8. Respektuj PERSONALIZACI výše — ta má přednost před obecnými pravidly
${buildRecentMessagesBlock(ctx.recentMessages)}
Odpověz POUZE text zprávy, nic jiného.`;
}

/**
 * Renders the "Posledních 5 zpráv" block only when there are messages.
 * Previously an empty array produced a hanging "Posledních 5 zpráv:" header
 * followed by nothing, which wastes tokens and looks off.
 */
function buildRecentMessagesBlock(recentMessages: string[]): string {
  const lastFive = recentMessages.slice(-5);
  if (lastFive.length === 0) return '';
  const lines = lastFive.map((m) => `- "${m}"`).join('\n');
  return `\nPosledních ${lastFive.length} zpráv (NEOPAKUJ):\n${lines}\n`;
}

export function buildCoachingUserMessage(ctx: CoachingContext): string {
  if (ctx.safetyAlerts.length > 0) {
    return `SAFETY: ${ctx.safetyAlerts[0]}. Forma: ${ctx.recentFormScores[ctx.recentFormScores.length - 1] ?? 0}%`;
  }

  const lastScore = ctx.recentFormScores[ctx.recentFormScores.length - 1] ?? 0;
  if (lastScore >= 80) {
    return `Forma ${lastScore}%, rep ${ctx.repCount}/${ctx.targetReps}. Pochval nebo motivuj.`;
  }
  if (lastScore >= 50) {
    return `Forma ${lastScore}%, rep ${ctx.repCount}/${ctx.targetReps}. Korekce potřeba.`;
  }
  return `Forma ${lastScore}%, rep ${ctx.repCount}/${ctx.targetReps}. Špatná forma, oprav.`;
}
