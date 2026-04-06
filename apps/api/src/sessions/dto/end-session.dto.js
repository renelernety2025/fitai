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
import { IsInt, IsNumber, Min, Max } from 'class-validator';
let EndSessionDto = (() => {
    var _a;
    let _durationSeconds_decorators;
    let _durationSeconds_initializers = [];
    let _durationSeconds_extraInitializers = [];
    let _accuracyScore_decorators;
    let _accuracyScore_initializers = [];
    let _accuracyScore_extraInitializers = [];
    return _a = class EndSessionDto {
            constructor() {
                this.durationSeconds = __runInitializers(this, _durationSeconds_initializers, void 0);
                this.accuracyScore = (__runInitializers(this, _durationSeconds_extraInitializers), __runInitializers(this, _accuracyScore_initializers, void 0));
                __runInitializers(this, _accuracyScore_extraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _durationSeconds_decorators = [IsInt(), Min(0)];
            _accuracyScore_decorators = [IsNumber(), Min(0), Max(100)];
            __esDecorate(null, null, _durationSeconds_decorators, { kind: "field", name: "durationSeconds", static: false, private: false, access: { has: obj => "durationSeconds" in obj, get: obj => obj.durationSeconds, set: (obj, value) => { obj.durationSeconds = value; } }, metadata: _metadata }, _durationSeconds_initializers, _durationSeconds_extraInitializers);
            __esDecorate(null, null, _accuracyScore_decorators, { kind: "field", name: "accuracyScore", static: false, private: false, access: { has: obj => "accuracyScore" in obj, get: obj => obj.accuracyScore, set: (obj, value) => { obj.accuracyScore = value; } }, metadata: _metadata }, _accuracyScore_initializers, _accuracyScore_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export { EndSessionDto };
//# sourceMappingURL=end-session.dto.js.map