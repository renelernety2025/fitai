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
import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
let SessionsController = (() => {
    let _classDecorators = [Controller('sessions'), UseGuards(JwtAuthGuard)];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _start_decorators;
    let _end_decorators;
    let _poseSnap_decorators;
    let _getMySessions_decorators;
    let _getMyStats_decorators;
    var SessionsController = _classThis = class {
        constructor(sessionsService) {
            this.sessionsService = (__runInitializers(this, _instanceExtraInitializers), sessionsService);
        }
        start(req, videoId) {
            return this.sessionsService.startSession(req.user.id, videoId);
        }
        end(id, req, dto) {
            return this.sessionsService.endSession(id, req.user.id, dto);
        }
        poseSnap(id, req, dto) {
            return this.sessionsService.savePoseSnapshot(id, req.user.id, dto);
        }
        getMySessions(req) {
            return this.sessionsService.getMySessions(req.user.id);
        }
        getMyStats(req) {
            return this.sessionsService.getMyStats(req.user.id);
        }
    };
    __setFunctionName(_classThis, "SessionsController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _start_decorators = [Post('start')];
        _end_decorators = [Post(':id/end')];
        _poseSnap_decorators = [Post(':id/pose-snap')];
        _getMySessions_decorators = [Get('my')];
        _getMyStats_decorators = [Get('my/stats')];
        __esDecorate(_classThis, null, _start_decorators, { kind: "method", name: "start", static: false, private: false, access: { has: obj => "start" in obj, get: obj => obj.start }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _end_decorators, { kind: "method", name: "end", static: false, private: false, access: { has: obj => "end" in obj, get: obj => obj.end }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _poseSnap_decorators, { kind: "method", name: "poseSnap", static: false, private: false, access: { has: obj => "poseSnap" in obj, get: obj => obj.poseSnap }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMySessions_decorators, { kind: "method", name: "getMySessions", static: false, private: false, access: { has: obj => "getMySessions" in obj, get: obj => obj.getMySessions }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyStats_decorators, { kind: "method", name: "getMyStats", static: false, private: false, access: { has: obj => "getMyStats" in obj, get: obj => obj.getMyStats }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SessionsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SessionsController = _classThis;
})();
export { SessionsController };
//# sourceMappingURL=sessions.controller.js.map