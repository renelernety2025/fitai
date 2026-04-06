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
import { IsString, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';
let CompleteSetDto = (() => {
    var _a;
    let _setId_decorators;
    let _setId_initializers = [];
    let _setId_extraInitializers = [];
    let _actualReps_decorators;
    let _actualReps_initializers = [];
    let _actualReps_extraInitializers = [];
    let _actualWeight_decorators;
    let _actualWeight_initializers = [];
    let _actualWeight_extraInitializers = [];
    let _formScore_decorators;
    let _formScore_initializers = [];
    let _formScore_extraInitializers = [];
    let _repData_decorators;
    let _repData_initializers = [];
    let _repData_extraInitializers = [];
    return _a = class CompleteSetDto {
            constructor() {
                this.setId = __runInitializers(this, _setId_initializers, void 0);
                this.actualReps = (__runInitializers(this, _setId_extraInitializers), __runInitializers(this, _actualReps_initializers, void 0));
                this.actualWeight = (__runInitializers(this, _actualReps_extraInitializers), __runInitializers(this, _actualWeight_initializers, void 0));
                this.formScore = (__runInitializers(this, _actualWeight_extraInitializers), __runInitializers(this, _formScore_initializers, void 0));
                this.repData = (__runInitializers(this, _formScore_extraInitializers), __runInitializers(this, _repData_initializers, void 0));
                __runInitializers(this, _repData_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _setId_decorators = [IsString()];
            _actualReps_decorators = [IsInt(), Min(0)];
            _actualWeight_decorators = [IsOptional(), IsNumber()];
            _formScore_decorators = [IsNumber(), Min(0), Max(100)];
            _repData_decorators = [IsOptional()];
            __esDecorate(null, null, _setId_decorators, { kind: "field", name: "setId", static: false, private: false, access: { has: obj => "setId" in obj, get: obj => obj.setId, set: (obj, value) => { obj.setId = value; } }, metadata: _metadata }, _setId_initializers, _setId_extraInitializers);
            __esDecorate(null, null, _actualReps_decorators, { kind: "field", name: "actualReps", static: false, private: false, access: { has: obj => "actualReps" in obj, get: obj => obj.actualReps, set: (obj, value) => { obj.actualReps = value; } }, metadata: _metadata }, _actualReps_initializers, _actualReps_extraInitializers);
            __esDecorate(null, null, _actualWeight_decorators, { kind: "field", name: "actualWeight", static: false, private: false, access: { has: obj => "actualWeight" in obj, get: obj => obj.actualWeight, set: (obj, value) => { obj.actualWeight = value; } }, metadata: _metadata }, _actualWeight_initializers, _actualWeight_extraInitializers);
            __esDecorate(null, null, _formScore_decorators, { kind: "field", name: "formScore", static: false, private: false, access: { has: obj => "formScore" in obj, get: obj => obj.formScore, set: (obj, value) => { obj.formScore = value; } }, metadata: _metadata }, _formScore_initializers, _formScore_extraInitializers);
            __esDecorate(null, null, _repData_decorators, { kind: "field", name: "repData", static: false, private: false, access: { has: obj => "repData" in obj, get: obj => obj.repData, set: (obj, value) => { obj.repData = value; } }, metadata: _metadata }, _repData_initializers, _repData_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { CompleteSetDto };
//# sourceMappingURL=complete-set.dto.js.map