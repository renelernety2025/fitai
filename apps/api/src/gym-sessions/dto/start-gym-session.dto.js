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
import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
let StartGymSessionDto = (() => {
    var _a;
    let _workoutPlanId_decorators;
    let _workoutPlanId_initializers = [];
    let _workoutPlanId_extraInitializers = [];
    let _workoutDayIndex_decorators;
    let _workoutDayIndex_initializers = [];
    let _workoutDayIndex_extraInitializers = [];
    let _adHocExercises_decorators;
    let _adHocExercises_initializers = [];
    let _adHocExercises_extraInitializers = [];
    return _a = class StartGymSessionDto {
            constructor() {
                this.workoutPlanId = __runInitializers(this, _workoutPlanId_initializers, void 0);
                this.workoutDayIndex = (__runInitializers(this, _workoutPlanId_extraInitializers), __runInitializers(this, _workoutDayIndex_initializers, void 0));
                this.adHocExercises = (__runInitializers(this, _workoutDayIndex_extraInitializers), __runInitializers(this, _adHocExercises_initializers, void 0));
                __runInitializers(this, _adHocExercises_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _workoutPlanId_decorators = [IsOptional(), IsString()];
            _workoutDayIndex_decorators = [IsOptional(), IsInt()];
            _adHocExercises_decorators = [IsOptional(), IsArray()];
            __esDecorate(null, null, _workoutPlanId_decorators, { kind: "field", name: "workoutPlanId", static: false, private: false, access: { has: obj => "workoutPlanId" in obj, get: obj => obj.workoutPlanId, set: (obj, value) => { obj.workoutPlanId = value; } }, metadata: _metadata }, _workoutPlanId_initializers, _workoutPlanId_extraInitializers);
            __esDecorate(null, null, _workoutDayIndex_decorators, { kind: "field", name: "workoutDayIndex", static: false, private: false, access: { has: obj => "workoutDayIndex" in obj, get: obj => obj.workoutDayIndex, set: (obj, value) => { obj.workoutDayIndex = value; } }, metadata: _metadata }, _workoutDayIndex_initializers, _workoutDayIndex_extraInitializers);
            __esDecorate(null, null, _adHocExercises_decorators, { kind: "field", name: "adHocExercises", static: false, private: false, access: { has: obj => "adHocExercises" in obj, get: obj => obj.adHocExercises, set: (obj, value) => { obj.adHocExercises = value; } }, metadata: _metadata }, _adHocExercises_initializers, _adHocExercises_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { StartGymSessionDto };
//# sourceMappingURL=start-gym-session.dto.js.map