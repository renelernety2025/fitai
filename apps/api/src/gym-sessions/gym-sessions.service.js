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
let GymSessionsService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var GymSessionsService = _classThis = class {
        constructor(prisma, progressService) {
            this.prisma = prisma;
            this.progressService = progressService;
        }
        async startSession(userId, dto) {
            // Create gym session
            const gymSession = await this.prisma.gymSession.create({
                data: {
                    userId,
                    workoutPlanId: dto.workoutPlanId,
                    workoutDayIndex: dto.workoutDayIndex,
                },
            });
            // Create linked WorkoutSession for XP tracking
            await this.prisma.workoutSession.create({
                data: { userId, gymSessionId: gymSession.id },
            });
            // Pre-populate sets from plan or ad-hoc
            if (dto.workoutPlanId && dto.workoutDayIndex !== undefined) {
                const day = await this.prisma.workoutDay.findFirst({
                    where: { workoutPlanId: dto.workoutPlanId, dayIndex: dto.workoutDayIndex },
                    include: { plannedExercises: { orderBy: { orderIndex: 'asc' } } },
                });
                if (day) {
                    for (const pe of day.plannedExercises) {
                        for (let s = 1; s <= pe.targetSets; s++) {
                            await this.prisma.exerciseSet.create({
                                data: {
                                    gymSessionId: gymSession.id,
                                    exerciseId: pe.exerciseId,
                                    setNumber: s,
                                    targetReps: pe.targetReps,
                                    targetWeight: pe.targetWeight,
                                },
                            });
                        }
                    }
                }
            }
            else if (dto.adHocExercises) {
                for (const ex of dto.adHocExercises) {
                    for (let s = 1; s <= ex.targetSets; s++) {
                        await this.prisma.exerciseSet.create({
                            data: {
                                gymSessionId: gymSession.id,
                                exerciseId: ex.exerciseId,
                                setNumber: s,
                                targetReps: ex.targetReps,
                                targetWeight: ex.targetWeight,
                            },
                        });
                    }
                }
            }
            return this.prisma.gymSession.findUnique({
                where: { id: gymSession.id },
                include: { exerciseSets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
            });
        }
        async completeSet(sessionId, userId, dto) {
            const session = await this.prisma.gymSession.findUnique({ where: { id: sessionId } });
            if (!session)
                throw new NotFoundException('Session not found');
            if (session.userId !== userId)
                throw new ForbiddenException();
            return this.prisma.exerciseSet.update({
                where: { id: dto.setId },
                data: {
                    actualReps: dto.actualReps,
                    actualWeight: dto.actualWeight,
                    formScore: dto.formScore,
                    repData: dto.repData,
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });
        }
        async endSession(sessionId, userId) {
            const session = await this.prisma.gymSession.findUnique({
                where: { id: sessionId },
                include: { exerciseSets: true, workoutSession: true },
            });
            if (!session)
                throw new NotFoundException('Session not found');
            if (session.userId !== userId)
                throw new ForbiddenException();
            const completedSets = session.exerciseSets.filter((s) => s.status === 'COMPLETED');
            const totalReps = completedSets.reduce((sum, s) => sum + s.actualReps, 0);
            const avgForm = completedSets.length
                ? completedSets.reduce((sum, s) => sum + s.formScore, 0) / completedSets.length
                : 0;
            const elapsed = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
            // Update gym session
            const updated = await this.prisma.gymSession.update({
                where: { id: sessionId },
                data: {
                    completedAt: new Date(),
                    totalReps,
                    averageFormScore: Math.round(avgForm),
                    durationSeconds: elapsed,
                },
            });
            // Update linked workout session
            if (session.workoutSession) {
                await this.prisma.workoutSession.update({
                    where: { id: session.workoutSession.id },
                    data: {
                        completedAt: new Date(),
                        durationSeconds: elapsed,
                        accuracyScore: avgForm,
                    },
                });
            }
            // Update exercise history
            const exerciseGroups = new Map();
            for (const set of completedSets) {
                const arr = exerciseGroups.get(set.exerciseId) || [];
                arr.push(set);
                exerciseGroups.set(set.exerciseId, arr);
            }
            for (const [exerciseId, sets] of exerciseGroups) {
                const bestWeight = Math.max(...sets.map((s) => s.actualWeight ?? 0));
                const bestReps = Math.max(...sets.map((s) => s.actualReps));
                const avgScore = sets.reduce((s, r) => s + r.formScore, 0) / sets.length;
                const volume = sets.reduce((s, r) => s + r.actualReps * (r.actualWeight ?? 0), 0);
                await this.prisma.exerciseHistory.create({
                    data: { userId, exerciseId, bestWeight: bestWeight || null, bestReps, avgFormScore: avgScore, totalVolume: volume },
                });
            }
            // Calculate XP
            const completionRate = session.exerciseSets.length
                ? completedSets.length / session.exerciseSets.length
                : 0;
            const progressResult = await this.progressService.updateProgress(userId, {
                durationSeconds: elapsed,
                accuracyScore: avgForm,
                completedFullVideo: completionRate >= 0.8,
            });
            // Bonus XP for reps with good form
            const goodFormReps = completedSets
                .filter((s) => s.formScore >= 70)
                .reduce((sum, s) => sum + s.actualReps, 0);
            return { session: updated, progress: { ...progressResult, bonusRepXP: goodFormReps }, totalReps, avgForm };
        }
        async getMySessions(userId) {
            return this.prisma.gymSession.findMany({
                where: { userId },
                include: {
                    exerciseSets: { include: { exercise: { select: { nameCs: true } } } },
                    workoutPlan: { select: { nameCs: true } },
                },
                orderBy: { startedAt: 'desc' },
                take: 20,
            });
        }
        async getSession(sessionId) {
            const session = await this.prisma.gymSession.findUnique({
                where: { id: sessionId },
                include: { exerciseSets: { include: { exercise: true }, orderBy: { setNumber: 'asc' } } },
            });
            if (!session)
                throw new NotFoundException('Session not found');
            return session;
        }
    };
    __setFunctionName(_classThis, "GymSessionsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        GymSessionsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return GymSessionsService = _classThis;
})();
export { GymSessionsService };
//# sourceMappingURL=gym-sessions.service.js.map