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
import { buildCoachingSystemPrompt, buildCoachingUserMessage } from './coaching-prompt';
import { checkSafetyRules } from './safety-rules';
let CoachingService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CoachingService = _classThis = class {
        constructor(prisma, elevenLabs) {
            this.prisma = prisma;
            this.elevenLabs = elevenLabs;
            this.logger = new Logger(CoachingService.name);
        }
        async generateFeedback(req) {
            // 1. Safety check first
            const safetyAlerts = checkSafetyRules(req.jointAngles, req.exerciseName);
            // Log critical safety events
            for (const alert of safetyAlerts.filter((a) => a.severity === 'critical')) {
                await this.prisma.safetyEvent.create({
                    data: {
                        userId: req.userId,
                        sessionType: req.sessionType,
                        sessionId: req.sessionId,
                        jointName: alert.joint,
                        measuredAngle: alert.measuredAngle,
                        safeMin: 0,
                        safeMax: 0,
                        exerciseName: req.exerciseName,
                        severity: alert.severity,
                    },
                }).catch(() => { });
            }
            // If critical safety, return immediately without Claude
            if (safetyAlerts.some((a) => a.severity === 'critical')) {
                const msg = safetyAlerts.find((a) => a.severity === 'critical').messageCs;
                const audio = await this.elevenLabs.synthesize(msg);
                return {
                    message: msg,
                    priority: 'safety',
                    audioBase64: audio?.audioBase64 ?? null,
                };
            }
            // 2. Build coaching context
            const ctx = await this.buildContext(req, safetyAlerts.map((a) => a.messageCs));
            // 3. Generate with Claude
            const message = await this.callClaude(ctx);
            // 4. Determine priority
            let priority = 'info';
            if (safetyAlerts.length > 0)
                priority = 'safety';
            else if (req.formScore < 60)
                priority = 'correction';
            else if (req.formScore >= 80)
                priority = 'encouragement';
            else
                priority = 'correction';
            // 5. Synthesize speech
            const audio = await this.elevenLabs.synthesize(message);
            // 6. Log message
            await this.logMessage(req.userId, req.sessionType, req.sessionId, message, priority);
            return {
                message,
                priority,
                audioBase64: audio?.audioBase64 ?? null,
            };
        }
        async logSafetyEvent(data) {
            return this.prisma.safetyEvent.create({
                data: { ...data, safeMin: 0, safeMax: 0 },
            });
        }
        async precache() {
            return this.elevenLabs.precacheCommonPhrases();
        }
        async synthesize(text) {
            const audio = await this.elevenLabs.synthesize(text);
            return { text, audioBase64: audio?.audioBase64 ?? null, fallbackToWebSpeech: !audio };
        }
        async buildContext(req, safetyAlerts) {
            const user = await this.prisma.user.findUnique({ where: { id: req.userId } });
            const progress = await this.prisma.userProgress.findUnique({ where: { userId: req.userId } });
            // Get weak joints from safety events
            const recentSafety = await this.prisma.safetyEvent.findMany({
                where: { userId: req.userId },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            const jointCounts = new Map();
            recentSafety.forEach((e) => jointCounts.set(e.jointName, (jointCounts.get(e.jointName) || 0) + 1));
            const weakJoints = [...jointCounts.entries()]
                .filter(([, count]) => count >= 3)
                .map(([joint]) => joint);
            // Get recent coaching messages
            const recentMessages = await this.prisma.coachingMessage.findMany({
                where: { coachingSession: { userId: req.userId } },
                orderBy: { createdAt: 'desc' },
                take: 5,
            });
            const daysSince = progress?.lastWorkoutDate
                ? Math.floor((Date.now() - progress.lastWorkoutDate.getTime()) / 86400000)
                : null;
            return {
                userName: user?.name ?? 'Cvičenci',
                level: progress ? String(progress.totalXP >= 2000 ? 'Legenda' : progress.totalXP >= 1000 ? 'Mistr' : progress.totalXP >= 500 ? 'Expert' : progress.totalXP >= 200 ? 'Pokročilý' : 'Začátečník') : 'Začátečník',
                totalXP: progress?.totalXP ?? 0,
                currentStreak: progress?.currentStreak ?? 0,
                daysSinceLastWorkout: daysSince,
                weakJoints,
                currentExercise: req.exerciseName,
                currentPhase: req.currentPhase,
                recentFormScores: [req.formScore],
                repCount: req.repCount,
                targetReps: req.targetReps,
                safetyAlerts,
                recentMessages: recentMessages.map((m) => m.content).reverse(),
            };
        }
        async callClaude(ctx) {
            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
                this.logger.warn('No ANTHROPIC_API_KEY — using static feedback');
                return this.getStaticFeedback(ctx);
            }
            try {
                const Anthropic = require('@anthropic-ai/sdk').default;
                const client = new Anthropic({ apiKey });
                const response = await client.messages.create({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 50,
                    system: buildCoachingSystemPrompt(ctx),
                    messages: [{ role: 'user', content: buildCoachingUserMessage(ctx) }],
                });
                const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
                return text || this.getStaticFeedback(ctx);
            }
            catch (err) {
                this.logger.error(`Claude coaching failed: ${err.message}`);
                return this.getStaticFeedback(ctx);
            }
        }
        getStaticFeedback(ctx) {
            if (ctx.safetyAlerts.length > 0)
                return ctx.safetyAlerts[0];
            if (ctx.recentFormScores[0] >= 80) {
                const praises = ['Výborně!', 'Skvělá forma!', 'Perfektní!', 'Super práce!', 'Tak držet!'];
                return praises[Math.floor(Math.random() * praises.length)];
            }
            if (ctx.recentFormScores[0] >= 50) {
                return 'Soustřeď se na formu.';
            }
            return 'Zkontroluj pozici, forma potřebuje zlepšit.';
        }
        async logMessage(userId, sessionType, sessionId, content, priority) {
            let session = await this.prisma.coachingSession.findFirst({
                where: { userId, sessionType, sessionId },
            });
            if (!session) {
                session = await this.prisma.coachingSession.create({
                    data: { userId, sessionType, sessionId },
                });
            }
            await this.prisma.coachingMessage.create({
                data: {
                    coachingSessionId: session.id,
                    role: 'assistant',
                    content,
                    priority,
                },
            });
            await this.prisma.coachingSession.update({
                where: { id: session.id },
                data: { messagesCount: { increment: 1 } },
            });
        }
    };
    __setFunctionName(_classThis, "CoachingService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CoachingService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CoachingService = _classThis;
})();
export { CoachingService };
//# sourceMappingURL=coaching.service.js.map