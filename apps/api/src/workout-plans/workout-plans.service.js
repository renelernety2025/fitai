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
let WorkoutPlansService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var WorkoutPlansService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
        }
        async findAll(userId) {
            return this.prisma.workoutPlan.findMany({
                where: { OR: [{ isTemplate: true }, { userId }] },
                include: { days: { include: { plannedExercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } }, orderBy: { dayIndex: 'asc' } } },
                orderBy: { createdAt: 'desc' },
            });
        }
        async findById(id) {
            const plan = await this.prisma.workoutPlan.findUnique({
                where: { id },
                include: { days: { include: { plannedExercises: { include: { exercise: true }, orderBy: { orderIndex: 'asc' } } }, orderBy: { dayIndex: 'asc' } } },
            });
            if (!plan)
                throw new NotFoundException('Workout plan not found');
            return plan;
        }
        async create(userId, data) {
            const { days, ...planData } = data;
            return this.prisma.workoutPlan.create({
                data: {
                    ...planData,
                    userId,
                    days: days ? {
                        create: days.map((day, i) => ({
                            dayIndex: i,
                            name: day.name,
                            nameCs: day.nameCs,
                            plannedExercises: {
                                create: day.exercises.map((ex, j) => ({
                                    exerciseId: ex.exerciseId,
                                    orderIndex: j,
                                    targetSets: ex.targetSets,
                                    targetReps: ex.targetReps,
                                    targetWeight: ex.targetWeight,
                                    restSeconds: ex.restSeconds || 90,
                                })),
                            },
                        })),
                    } : undefined,
                },
                include: { days: { include: { plannedExercises: true } } },
            });
        }
        async clone(id, userId) {
            const source = await this.findById(id);
            return this.create(userId, {
                name: `${source.name} (kopie)`,
                nameCs: `${source.nameCs} (kopie)`,
                description: source.description,
                type: 'CUSTOM',
                difficulty: source.difficulty,
                daysPerWeek: source.daysPerWeek,
                days: source.days.map((day) => ({
                    name: day.name,
                    nameCs: day.nameCs,
                    exercises: day.plannedExercises.map((pe) => ({
                        exerciseId: pe.exerciseId,
                        targetSets: pe.targetSets,
                        targetReps: pe.targetReps,
                        targetWeight: pe.targetWeight,
                        restSeconds: pe.restSeconds,
                    })),
                })),
            });
        }
        async delete(id, userId) {
            const plan = await this.findById(id);
            if (plan.userId !== userId)
                throw new ForbiddenException();
            return this.prisma.workoutPlan.delete({ where: { id } });
        }
    };
    __setFunctionName(_classThis, "WorkoutPlansService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        WorkoutPlansService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return WorkoutPlansService = _classThis;
})();
export { WorkoutPlansService };
//# sourceMappingURL=workout-plans.service.js.map