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
let NotificationController = (() => {
    let _classDecorators = [Controller('notifications')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _getVapidKey_decorators;
    let _subscribe_decorators;
    let _getPreferences_decorators;
    let _updatePreferences_decorators;
    let _sendStreakReminders_decorators;
    let _testNotification_decorators;
    var NotificationController = _classThis = class {
        constructor(notificationService) {
            this.notificationService = (__runInitializers(this, _instanceExtraInitializers), notificationService);
        }
        getVapidKey() {
            return this.notificationService.getVapidPublicKey();
        }
        subscribe(req, dto) {
            return this.notificationService.subscribe(req.user.id, dto);
        }
        getPreferences(req) {
            return this.notificationService.getPreferences(req.user.id);
        }
        updatePreferences(req, dto) {
            return this.notificationService.updatePreferences(req.user.id, dto);
        }
        sendStreakReminders() {
            return this.notificationService.sendStreakReminders();
        }
        async testNotification(req) {
            return this.notificationService.sendToUser(req.user.id, {
                title: 'FitAI Test',
                body: 'Push notifikace fungují! 💪',
                url: '/dashboard',
            });
        }
    };
    __setFunctionName(_classThis, "NotificationController");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getVapidKey_decorators = [Get('vapid-public-key')];
        _subscribe_decorators = [Post('subscribe'), UseGuards(JwtAuthGuard)];
        _getPreferences_decorators = [Get('preferences'), UseGuards(JwtAuthGuard)];
        _updatePreferences_decorators = [Put('preferences'), UseGuards(JwtAuthGuard)];
        _sendStreakReminders_decorators = [Post('send-streak-reminders'), UseGuards(JwtAuthGuard)];
        _testNotification_decorators = [Post('test'), UseGuards(JwtAuthGuard)];
        __esDecorate(_classThis, null, _getVapidKey_decorators, { kind: "method", name: "getVapidKey", static: false, private: false, access: { has: obj => "getVapidKey" in obj, get: obj => obj.getVapidKey }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _subscribe_decorators, { kind: "method", name: "subscribe", static: false, private: false, access: { has: obj => "subscribe" in obj, get: obj => obj.subscribe }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPreferences_decorators, { kind: "method", name: "getPreferences", static: false, private: false, access: { has: obj => "getPreferences" in obj, get: obj => obj.getPreferences }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updatePreferences_decorators, { kind: "method", name: "updatePreferences", static: false, private: false, access: { has: obj => "updatePreferences" in obj, get: obj => obj.updatePreferences }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _sendStreakReminders_decorators, { kind: "method", name: "sendStreakReminders", static: false, private: false, access: { has: obj => "sendStreakReminders" in obj, get: obj => obj.sendStreakReminders }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _testNotification_decorators, { kind: "method", name: "testNotification", static: false, private: false, access: { has: obj => "testNotification" in obj, get: obj => obj.testNotification }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationController = _classThis;
})();
export { NotificationController };
//# sourceMappingURL=notification.controller.js.map