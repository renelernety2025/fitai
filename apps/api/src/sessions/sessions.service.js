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
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
let SessionsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var SessionsService = _classThis = class {
        constructor(prisma, progressService) {
            this.prisma = prisma;
            this.progressService = progressService;
        }
        async startSession(userId, videoId) {
            const video = await this.prisma.video.findUnique({ where: { id: videoId } });
            if (!video)
                throw new NotFoundException('Video not found');
            return this.prisma.workoutSession.create({
                data: { userId, videoId },
            });
        }
        async endSession(sessionId, userId, dto) {
            const session = await this.prisma.workoutSession.findUnique({
                where: { id: sessionId },
                include: { video: true },
            });
            if (!session)
                throw new NotFoundException('Session not found');
            if (session.userId !== userId)
                throw new ForbiddenException();
            const updated = await this.prisma.workoutSession.update({
                where: { id: sessionId },
                data: {
                    completedAt: new Date(),
                    durationSeconds: dto.durationSeconds,
                    accuracyScore: dto.accuracyScore,
                },
            });
            const completedFullVideo = session.video
                ? dto.durationSeconds >= session.video.durationSeconds * 0.9
                : false;
            const progressResult = await this.progressService.updateProgress(userId, {
                durationSeconds: dto.durationSeconds,
                accuracyScore: dto.accuracyScore,
                completedFullVideo,
            });
            return { session: updated, progress: progressResult };
        }
        async savePoseSnapshot(sessionId, userId, dto) {
            const session = await this.prisma.workoutSession.findUnique({ where: { id: sessionId } });
            if (!session)
                throw new NotFoundException('Session not found');
            if (session.userId !== userId)
                throw new ForbiddenException();
            // Throttle: check last snapshot timestamp
            const lastSnap = await this.prisma.poseSnapshot.findFirst({
                where: { sessionId },
                orderBy: { timestamp: 'desc' },
            });
            if (lastSnap && dto.timestamp - lastSnap.timestamp < 5) {
                return { throttled: true };
            }
            return this.prisma.poseSnapshot.create({
                data: {
                    sessionId,
                    timestamp: dto.timestamp,
                    poseName: dto.poseName,
                    isCorrect: dto.isCorrect,
                    errorMessage: dto.errorMessage,
                    jointAngles: dto.jointAngles,
                },
            });
        }
        async getMySessions(userId) {
            return this.prisma.workoutSession.findMany({
                where: { userId },
                include: { video: { select: { title: true, category: true, thumbnailUrl: true } } },
                orderBy: { startedAt: 'desc' },
                take: 20,
            });
        }
        async getMyStats(userId) {
            const progress = await this.progressService.getProgress(userId);
            // Weekly activity (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 6);
            weekAgo.setHours(0, 0, 0, 0);
            const sessions = await this.prisma.workoutSession.findMany({
                where: {
                    userId,
                    completedAt: { not: null },
                    startedAt: { gte: weekAgo },
                },
                select: { startedAt: true, durationSeconds: true },
            });
            const weeklyActivity = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                d.setHours(0, 0, 0, 0);
                const dateStr = d.toISOString().slice(0, 10);
                const dayMinutes = sessions
                    .filter((s) => {
                    const sd = new Date(s.startedAt);
                    sd.setHours(0, 0, 0, 0);
                    return sd.getTime() === d.getTime();
                })
                    .reduce((sum, s) => sum + Math.floor(s.durationSeconds / 60), 0);
                weeklyActivity.push({ date: dateStr, minutes: dayMinutes });
            }
            // Average accuracy from completed sessions
            const completedSessions = await this.prisma.workoutSession.findMany({
                where: { userId, completedAt: { not: null } },
                select: { accuracyScore: true },
            });
            const avgAccuracy = completedSessions.length
                ? completedSessions.reduce((s, r) => s + r.accuracyScore, 0) / completedSessions.length
                : 0;
            return {
                totalSessions: progress.totalSessions,
                totalMinutes: progress.totalMinutes,
                averageAccuracy: Math.round(avgAccuracy),
                currentStreak: progress.currentStreak,
                longestStreak: progress.longestStreak,
                totalXP: progress.totalXP,
                levelName: progress.levelName,
                levelNumber: progress.levelNumber,
                weeklyActivity,
            };
        }
    };
    __setFunctionName(_classThis, "SessionsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SessionsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SessionsService = _classThis;
})();
export { SessionsService };
//# sourceMappingURL=sessions.service.js.map