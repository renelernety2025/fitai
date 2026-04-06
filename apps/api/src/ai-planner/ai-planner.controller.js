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
import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
let AIPlannerController = (() => {
    let _classDecorators = [Controller('ai-planner'), UseGuards(JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getProfile_decorators;
    let _updateProfile_decorators;
    let _generatePlan_decorators;
    let _getBreakRecovery_decorators;
    let _getAsymmetry_decorators;
    let _getHomeAlternative_decorators;
    var AIPlannerController = _classThis = class {
        constructor(aiPlannerService) {
            this.aiPlannerService = (__runInitializers(this, _instanceExtraInitializers), aiPlannerService);
        }
        getProfile(req) {
            return this.aiPlannerService.getOrCreateProfile(req.user.id);
        }
        updateProfile(req, dto) {
            return this.aiPlannerService.updateProfile(req.user.id, dto);
        }
        generatePlan(req) {
            return this.aiPlannerService.generatePlan(req.user.id);
        }
        getBreakRecovery(req) {
            return this.aiPlannerService.getBreakRecoveryPlan(req.user.id);
        }
        getAsymmetry(req) {
            return this.aiPlannerService.getAsymmetryReport(req.user.id);
        }
        getHomeAlternative(req) {
            return this.aiPlannerService.getHomeAlternative(req.user.id);
        }
    };
    __setFunctionName(_classThis, "AIPlannerController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getProfile_decorators = [Get('profile')];
        _updateProfile_decorators = [Put('profile')];
        _generatePlan_decorators = [Post('generate')];
        _getBreakRecovery_decorators = [Get('break-recovery')];
        _getAsymmetry_decorators = [Get('asymmetry')];
        _getHomeAlternative_decorators = [Get('home-alternative')];
        __esDecorate(_classThis, null, _getProfile_decorators, { kind: "method", name: "getProfile", static: false, private: false, access: { has: obj => "getProfile" in obj, get: obj => obj.getProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProfile_decorators, { kind: "method", name: "updateProfile", static: false, private: false, access: { has: obj => "updateProfile" in obj, get: obj => obj.updateProfile }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _generatePlan_decorators, { kind: "method", name: "generatePlan", static: false, private: false, access: { has: obj => "generatePlan" in obj, get: obj => obj.generatePlan }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getBreakRecovery_decorators, { kind: "method", name: "getBreakRecovery", static: false, private: false, access: { has: obj => "getBreakRecovery" in obj, get: obj => obj.getBreakRecovery }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getAsymmetry_decorators, { kind: "method", name: "getAsymmetry", static: false, private: false, access: { has: obj => "getAsymmetry" in obj, get: obj => obj.getAsymmetry }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getHomeAlternative_decorators, { kind: "method", name: "getHomeAlternative", static: false, private: false, access: { has: obj => "getHomeAlternative" in obj, get: obj => obj.getHomeAlternative }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AIPlannerController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AIPlannerController = _classThis;
})();
export { AIPlannerController };
//# sourceMappingURL=ai-planner.controller.js.map