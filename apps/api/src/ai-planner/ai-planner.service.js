var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Injectable, Logger } from '@nestjs/common';
const HOME_EXERCISES = ['Plank', 'Lunges']; // Bodyweight exercises available at home
let AIPlannerService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AIPlannerService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
            this.logger = new Logger(AIPlannerService.name);
        }
        // ── Fitness Profile ──
        async getOrCreateProfile(userId) {
            let profile = await this.prisma.fitnessProfile.findUnique({ where: { userId } });
            if (!profile) {
                profile = await this.prisma.fitnessProfile.create({ data: { userId } });
            }
            return profile;
        }
        async updateProfile(userId, data) {
            await this.getOrCreateProfile(userId);
            return this.prisma.fitnessProfile.update({ where: { userId }, data });
        }
        // ── AI Plan Generation ──
        async generatePlan(userId) {
            const profile = await this.getOrCreateProfile(userId);
            const progress = await this.prisma.userProgress.findUnique({ where: { userId } });
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            // Get exercise history for analysis
            const history = await this.prisma.exerciseHistory.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 50,
                include: { exercise: true },
            });
            // Detect asymmetries from safety events
            const safetyEvents = await this.prisma.safetyEvent.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 30,
            });
            // Break detection
            const daysSinceLastWorkout = progress?.lastWorkoutDate
                ? Math.floor((Date.now() - progress.lastWorkoutDate.getTime()) / 86400000)
                : null;
            const isReturningAfterBreak = daysSinceLastWorkout !== null && daysSinceLastWorkout >= 7;
            // Determine week number (check if existing AI plan)
            const lastAIPlan = await this.prisma.aIGeneratedPlan.findFirst({
                where: { userId, status: 'active' },
                orderBy: { createdAt: 'desc' },
            });
            const weekNumber = lastAIPlan ? lastAIPlan.weekNumber + 1 : 1;
            const totalWeeks = 6;
            const isDeloadWeek = weekNumber % 5 === 0; // Deload every 5th week
            // Get available exercises
            const allExercises = await this.prisma.exercise.findMany();
            const availableExercises = profile.hasGymAccess
                ? allExercises
                : allExercises.filter((e) => HOME_EXERCISES.includes(e.name) || e.muscleGroups.includes('CORE'));
            // Build Claude prompt
            const prompt = this.buildPlanPrompt({
                userName: user?.name ?? 'Cvičence',
                profile,
                progress,
                history,
                safetyEvents,
                availableExercises,
                isReturningAfterBreak,
                daysSinceLastWorkout,
                weekNumber,
                totalWeeks,
                isDeloadWeek,
            });
            // Call Claude
            const planJson = await this.callClaude(prompt);
            // Create workout plan from Claude response
            const workoutPlan = await this.createPlanFromAI(userId, planJson, profile);
            // Log the AI plan
            await this.prisma.aIGeneratedPlan.create({
                data: {
                    userId,
                    workoutPlanId: workoutPlan.id,
                    goal: profile.goal,
                    weekNumber,
                    totalWeeks,
                    isDeloadWeek,
                    claudePrompt: prompt.substring(0, 5000),
                    claudeResponse: JSON.stringify(planJson).substring(0, 5000),
                },
            });
            // Deactivate previous plans
            if (lastAIPlan) {
                await this.prisma.aIGeneratedPlan.updateMany({
                    where: { userId, id: { not: lastAIPlan.id }, status: 'active' },
                    data: { status: 'replaced' },
                });
            }
            return workoutPlan;
        }
        // ── Break Recovery ──
        async getBreakRecoveryPlan(userId) {
            const progress = await this.prisma.userProgress.findUnique({ where: { userId } });
            if (!progress?.lastWorkoutDate)
                return null;
            const days = Math.floor((Date.now() - progress.lastWorkoutDate.getTime()) / 86400000);
            if (days < 3)
                return null;
            let intensityMultiplier;
            let message;
            if (days <= 7) {
                intensityMultiplier = 0.9;
                message = `Vítej zpět! ${days} dní pauza — začneme lehčeji.`;
            }
            else if (days <= 14) {
                intensityMultiplier = 0.7;
                message = `${days} dní bez tréninku. Začneme na 70% a budeme postupně zvyšovat.`;
            }
            else if (days <= 30) {
                intensityMultiplier = 0.6;
                message = `Dlouhá pauza (${days} dní). Tělo potřebuje čas — jedeme na 60%, bezpečně.`;
            }
            else {
                intensityMultiplier = 0.5;
                message = `Vítej zpět po ${days} dnech! Začínáme od základů, pomalu a bezpečně.`;
            }
            return { daysSinceLastWorkout: days, intensityMultiplier, message };
        }
        // ── Asymmetry Detection ──
        async getAsymmetryReport(userId) {
            const history = await this.prisma.exerciseHistory.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 100,
                include: { exercise: true },
            });
            // Analyze safety events for joint-specific issues
            const events = await this.prisma.safetyEvent.findMany({
                where: { userId },
            });
            const jointIssues = new Map();
            events.forEach((e) => {
                jointIssues.set(e.jointName, (jointIssues.get(e.jointName) || 0) + 1);
            });
            const asymmetries = [];
            // Compare left vs right
            const leftKnee = jointIssues.get('left_knee') || 0;
            const rightKnee = jointIssues.get('right_knee') || 0;
            if (Math.abs(leftKnee - rightKnee) > 3) {
                const weaker = leftKnee > rightKnee ? 'levé' : 'pravé';
                asymmetries.push({
                    joint: `${weaker} koleno`,
                    count: Math.max(leftKnee, rightKnee),
                    recommendation: `Přidej unilaterální cviky na ${weaker} koleno (výpady, jednononožní dřep).`,
                });
            }
            const leftShoulder = jointIssues.get('left_shoulder') || 0;
            const rightShoulder = jointIssues.get('right_shoulder') || 0;
            if (Math.abs(leftShoulder - rightShoulder) > 3) {
                const weaker = leftShoulder > rightShoulder ? 'levé' : 'pravé';
                asymmetries.push({
                    joint: `${weaker} rameno`,
                    count: Math.max(leftShoulder, rightShoulder),
                    recommendation: `Zaměř se na mobilitu ${weaker}ho ramene a jednoruční tlaky.`,
                });
            }
            // Fatigue pattern: form drops in last sets
            const recentSessions = await this.prisma.exerciseSet.findMany({
                where: { gymSession: { userId } },
                orderBy: { completedAt: 'desc' },
                take: 50,
            });
            const earlySetScores = [];
            const lateSetScores = [];
            recentSessions.forEach((s) => {
                if (s.status !== 'COMPLETED')
                    return;
                if (s.setNumber <= 2)
                    earlySetScores.push(s.formScore);
                else
                    lateSetScores.push(s.formScore);
            });
            const earlyAvg = earlySetScores.length ? earlySetScores.reduce((a, b) => a + b, 0) / earlySetScores.length : 0;
            const lateAvg = lateSetScores.length ? lateSetScores.reduce((a, b) => a + b, 0) / lateSetScores.length : 0;
            const fatigueDrop = earlyAvg - lateAvg;
            return {
                asymmetries,
                fatigue: {
                    earlySetAvgForm: Math.round(earlyAvg),
                    lateSetAvgForm: Math.round(lateAvg),
                    dropPercentage: Math.round(fatigueDrop),
                    recommendation: fatigueDrop > 15
                        ? 'Forma výrazně klesá v posledních setech. Zkus snížit váhu nebo počet setů.'
                        : fatigueDrop > 8
                            ? 'Mírný pokles formy ke konci ��� odpočívej déle mezi sety.'
                            : 'Dobrá výdrž, forma je stabilní.',
                },
            };
        }
        // ── Home Workout Fallback ──
        async getHomeAlternative(userId) {
            const profile = await this.getOrCreateProfile(userId);
            const homeExercises = await this.prisma.exercise.findMany({
                where: { name: { in: HOME_EXERCISES } },
            });
            return {
                message: 'Nemů��eš do fitka? Tady je domácí alternativa.',
                exercises: homeExercises.map((e) => ({
                    id: e.id,
                    nameCs: e.nameCs,
                    descriptionCs: e.descriptionCs,
                    targetSets: 3,
                    targetReps: 15,
                    restSeconds: 60,
                })),
            };
        }
        // ── Private methods ──
        buildPlanPrompt(ctx) {
            return `Jsi fitness trenér AI. Vygeneruj tréninkový plán v JSON formátu.

KLIENT: ${ctx.userName}
Cíl: ${ctx.profile.goal}
Zkušenosti: ${ctx.profile.experienceMonths} měsíců
Tréninky/týden: ${ctx.profile.daysPerWeek}
Délka tréninku: ${ctx.profile.sessionMinutes} min
Přístup do fitka: ${ctx.profile.hasGymAccess ? 'ano' : 'ne (jen bodyweight)'}
Vybavení: ${ctx.profile.equipment.length > 0 ? ctx.profile.equipment.join(', ') : 'základní'}
Zranění/omezení: ${ctx.profile.injuries.length > 0 ? ctx.profile.injuries.join(', ') : 'žádné'}
${ctx.isReturningAfterBreak ? `POZOR: Vrací se po ${ctx.daysSinceLastWorkout} dnech pauzy! Sniž intenzitu na ${ctx.daysSinceLastWorkout > 14 ? '60%' : '70%'}.` : ''}
${ctx.isDeloadWeek ? 'DELOAD TÝDEN: Sniž objem o 40%, zachovej intenzitu.' : ''}

Týden: ${ctx.weekNumber}/${ctx.totalWeeks}
Level: ${ctx.progress?.totalXP ?? 0} XP, ${ctx.progress?.totalSessions ?? 0} tréninků

Dostupné cviky (použij POUZE tyto ID):
${ctx.availableExercises.map((e) => `- ${e.id}: ${e.nameCs} (${e.muscleGroups.join(', ')})`).join('\n')}

${ctx.safetyEvents.length > 0 ? `Časté safety problémy: ${[...new Set(ctx.safetyEvents.map((e) => e.jointName))].join(', ')} — vyhni se cviků co zatěžují tyto klouby.` : ''}

Vrať POUZE validní JSON:
{
  "name": "Název plánu česky",
  "days": [
    {
      "name": "Název dne česky",
      "exercises": [
        {
          "exerciseId": "UUID z dostupných cviků",
          "targetSets": number,
          "targetReps": number,
          "restSeconds": number,
          "notes": "Poznámka česky (volitelné)"
        }
      ]
    }
  ]
}

Pravidla:
- ${ctx.profile.daysPerWeek} tréninků za týden
- Každý sval trénuj 2x za týden
- Compound cviky první, izolace poslední
- ${ctx.profile.goal === 'STRENGTH' ? 'Nízké repy (3-6), dlouhé pauzy (180s)' : ctx.profile.goal === 'HYPERTROPHY' ? 'Střední repy (8-12), střední pauzy (90s)' : 'Vyšší repy (12-15), krátké pauzy (60s)'}
- Při zranění vynech cviky co zatěžují danou oblast`;
        }
        async callClaude(prompt) {
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
                this.logger.warn('No ANTHROPIC_API_KEY — generating mock plan');
                return this.getMockPlan();
            }
            try {
                const Anthropic = require('@anthropic-ai/sdk').default;
                const client = new Anthropic({ apiKey });
                const response = await client.messages.create({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 2000,
                    messages: [{ role: 'user', content: prompt }],
                });
                const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch)
                    throw new Error('No JSON in response');
                return JSON.parse(jsonMatch[0]);
            }
            catch (err) {
                this.logger.error(`Claude plan generation failed: ${err.message}`);
                return this.getMockPlan();
            }
        }
        async getMockPlan() {
            const exercises = await this.prisma.exercise.findMany({ take: 6 });
            return {
                name: 'AI Plán — Celé tělo',
                days: [
                    {
                        name: 'Den A — Horní t��lo',
                        exercises: exercises.slice(0, 3).map((e) => ({
                            exerciseId: e.id,
                            targetSets: 3,
                            targetReps: 10,
                            restSeconds: 90,
                        })),
                    },
                    {
                        name: 'Den B — Dolní tělo',
                        exercises: exercises.slice(3, 6).map((e) => ({
                            exerciseId: e.id,
                            targetSets: 3,
                            targetReps: 10,
                            restSeconds: 90,
                        })),
                    },
                ],
            };
        }
        async createPlanFromAI(userId, planJson, profile) {
            return this.prisma.workoutPlan.create({
                data: {
                    userId,
                    name: planJson.name || 'AI Generovaný plán',
                    nameCs: planJson.name || 'AI Generovaný plán',
                    description: `Personalizovaný plán pro cíl: ${profile.goal}`,
                    type: 'CUSTOM',
                    difficulty: profile.experienceMonths > 12 ? 'ADVANCED' : profile.experienceMonths > 3 ? 'INTERMEDIATE' : 'BEGINNER',
                    daysPerWeek: profile.daysPerWeek,
                    days: {
                        create: (planJson.days || []).map((day, i) => ({
                            dayIndex: i,
                            name: day.name || `Den ${i + 1}`,
                            nameCs: day.name || `Den ${i + 1}`,
                            plannedExercises: {
                                create: (day.exercises || []).map((ex, j) => ({
                                    exerciseId: ex.exerciseId,
                                    orderIndex: j,
                                    targetSets: ex.targetSets || 3,
                                    targetReps: ex.targetReps || 10,
                                    targetWeight: ex.targetWeight,
                                    restSeconds: ex.restSeconds || 90,
                                    notes: ex.notes,
                                })),
                            },
                        })),
                    },
                },
                include: { days: { include: { plannedExercises: { include: { exercise: true } } } } },
            });
        }
    };
    __setFunctionName(_classThis, "AIPlannerService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AIPlannerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AIPlannerService = _classThis;
})();
export { AIPlannerService };
//# sourceMappingURL=ai-planner.service.js.map