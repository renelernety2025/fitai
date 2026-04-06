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
import { Injectable } from '@nestjs/common';
import { getLevelForXP } from './xp-levels';
let ProgressService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProgressService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
        }
        async updateProgress(userId, sessionData) {
            let progress = await this.prisma.userProgress.findUnique({ where: { userId } });
            if (!progress) {
                progress = await this.prisma.userProgress.create({ data: { userId } });
            }
            // XP calculation
            const minutes = Math.floor(sessionData.durationSeconds / 60);
            let xpGained = minutes * 10;
            if (sessionData.accuracyScore >= 80)
                xpGained += 20;
            if (sessionData.completedFullVideo)
                xpGained += 50;
            // Streak logic
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let newStreak = progress.currentStreak;
            if (progress.lastWorkoutDate) {
                const last = new Date(progress.lastWorkoutDate);
                last.setHours(0, 0, 0, 0);
                const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    newStreak += 1;
                }
                else if (diffDays === 0) {
                    // same day, no change
                }
                else {
                    newStreak = 1;
                }
            }
            else {
                newStreak = 1;
            }
            const newLongest = Math.max(progress.longestStreak, newStreak);
            const newTotalXP = progress.totalXP + xpGained;
            const oldLevel = getLevelForXP(progress.totalXP);
            const newLevel = getLevelForXP(newTotalXP);
            const levelUp = newLevel.level > oldLevel.level;
            await this.prisma.userProgress.update({
                where: { userId },
                data: {
                    totalXP: newTotalXP,
                    currentStreak: newStreak,
                    longestStreak: newLongest,
                    lastWorkoutDate: new Date(),
                    totalSessions: progress.totalSessions + 1,
                    totalMinutes: progress.totalMinutes + minutes,
                },
            });
            return {
                xpGained,
                totalXP: newTotalXP,
                currentStreak: newStreak,
                levelUp,
                levelName: newLevel.name,
            };
        }
        async getProgress(userId) {
            let progress = await this.prisma.userProgress.findUnique({ where: { userId } });
            if (!progress) {
                progress = await this.prisma.userProgress.create({ data: { userId } });
            }
            const level = getLevelForXP(progress.totalXP);
            return { ...progress, levelName: level.name, levelNumber: level.level };
        }
        async getReminderStatus(userId) {
            const progress = await this.getProgress(userId);
            if (!progress.lastWorkoutDate) {
                return {
                    shouldRemind: true,
                    daysSinceLastWorkout: null,
                    message: 'Začni cvičit ještě dnes a nastartuj svou sérii!',
                };
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const last = new Date(progress.lastWorkoutDate);
            last.setHours(0, 0, 0, 0);
            const days = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            if (days <= 1) {
                return {
                    shouldRemind: false,
                    daysSinceLastWorkout: days,
                    message: `Pokračuj v sérii! Cvičíš už ${progress.currentStreak} dní po sobě.`,
                };
            }
            if (days === 2) {
                return {
                    shouldRemind: true,
                    daysSinceLastWorkout: days,
                    message: 'Nezapomeň procvičit! Naposledy jsi cvičil/a před 2 dny.',
                };
            }
            return {
                shouldRemind: true,
                daysSinceLastWorkout: days,
                message: `Chybíš nám! Série přerušena. Začni znovu ještě dnes.`,
            };
        }
    };
    __setFunctionName(_classThis, "ProgressService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProgressService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProgressService = _classThis;
})();
export { ProgressService };
//# sourceMappingURL=progress.service.js.map