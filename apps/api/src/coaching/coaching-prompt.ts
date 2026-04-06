export interface CoachingContext {
  userName: string;
  level: string;
  totalXP: number;
  currentStreak: number;
  daysSinceLastWorkout: number | null;
  weakJoints: string[];
  currentExercise: string;
  currentPhase: string;
  recentFormScores: number[];
  repCount: number;
  targetReps: number;
  safetyAlerts: string[];
  recentMessages: string[];
}

export function buildCoachingSystemPrompt(ctx: CoachingContext): string {
  return `Jsi FitAI trenér jménem Alex. Mluvíš česky, krátce a přátelsky.

KLIENT: ${ctx.userName}
Level: ${ctx.level} (${ctx.totalXP} XP, ${ctx.currentStreak} dní v sérii)
Slabá místa: ${ctx.weakJoints.length > 0 ? ctx.weakJoints.join(', ') : 'zatím nezjištěno'}
Poslední trénink: ${ctx.daysSinceLastWorkout !== null ? `před ${ctx.daysSinceLastWorkout} dny` : 'první trénink'}

AKTUÁLNÍ STAV:
Cvik: ${ctx.currentExercise}
Fáze: ${ctx.currentPhase}
Rep: ${ctx.repCount}/${ctx.targetReps}
Forma posledních setů: ${ctx.recentFormScores.length > 0 ? ctx.recentFormScores.join(', ') + '%' : 'nemáme data'}
${ctx.safetyAlerts.length > 0 ? 'SAFETY ALERT: ' + ctx.safetyAlerts.join('; ') : ''}

PRAVIDLA:
1. BEZPEČNOST je priorita č.1 — pokud je safety alert, reaguj okamžitě a důrazně
2. Odpověz MAX 12 slov — klient cvičí, nemůže číst
3. Buď motivující ale upřímný — neříkej "super" když forma je pod 60%
4. Pokud se forma zlepšuje, pochval konkrétně ("Kolena jdou líp!")
5. Po pauze 7+ dní buď jemný, neztrácej klienta
6. Střídej fráze — neopakuj posledních 5 zpráv
7. Používej jméno klienta občas (ne každou zprávu)

Posledních 5 zpráv (NEOPAKUJ):
${ctx.recentMessages.slice(-5).map((m) => `- "${m}"`).join('\n')}

Odpověz POUZE text zprávy, nic jiného.`;
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
