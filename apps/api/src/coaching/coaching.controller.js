var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
let CoachingController = (() => {
    let _classDecorators = [Controller('coaching'), UseGuards(JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _generateFeedback_decorators;
    let _logSafetyEvent_decorators;
    let _synthesize_decorators;
    let _precache_decorators;
    var CoachingController = _classThis = class {
        constructor(coachingService) {
            this.coachingService = (__runInitializers(this, _instanceExtraInitializers), coachingService);
        }
        generateFeedback(req, dto) {
            return this.coachingService.generateFeedback({
                userId: req.user.id,
                ...dto,
            });
        }
        logSafetyEvent(req, dto) {
            return this.coachingService.logSafetyEvent({
                userId: req.user.id,
                ...dto,
            });
        }
        synthesize(text) {
            return this.coachingService.synthesize(text);
        }
        precache() {
            return this.coachingService.precache();
        }
    };
    __setFunctionName(_classThis, "CoachingController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _generateFeedback_decorators = [Post('feedback')];
        _logSafetyEvent_decorators = [Post('safety-event')];
        _synthesize_decorators = [Post('tts')];
        _precache_decorators = [Post('precache')];
        __esDecorate(_classThis, null, _generateFeedback_decorators, { kind: "method", name: "generateFeedback", static: false, private: false, access: { has: obj => "generateFeedback" in obj, get: obj => obj.generateFeedback }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _logSafetyEvent_decorators, { kind: "method", name: "logSafetyEvent", static: false, private: false, access: { has: obj => "logSafetyEvent" in obj, get: obj => obj.logSafetyEvent }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _synthesize_decorators, { kind: "method", name: "synthesize", static: false, private: false, access: { has: obj => "synthesize" in obj, get: obj => obj.synthesize }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _precache_decorators, { kind: "method", name: "precache", static: false, private: false, access: { has: obj => "precache" in obj, get: obj => obj.precache }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CoachingController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CoachingController = _classThis;
})();
export { CoachingController };
//# sourceMappingURL=coaching.controller.js.map