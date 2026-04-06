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
import { Injectable, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
let NotificationService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var NotificationService = _classThis = class {
        constructor(prisma) {
            this.prisma = prisma;
            this.logger = new Logger(NotificationService.name);
            this.vapidConfigured = false;
            const publicKey = process.env.VAPID_PUBLIC_KEY;
            const privateKey = process.env.VAPID_PRIVATE_KEY;
            if (publicKey && privateKey) {
                webpush.setVapidDetails('mailto:admin@fitai.com', publicKey, privateKey);
                this.vapidConfigured = true;
                this.logger.log('VAPID keys configured');
            }
            else {
                this.logger.warn('No VAPID keys — push notifications disabled. Generate with: npx web-push generate-vapid-keys');
            }
        }
        getVapidPublicKey() {
            return { publicKey: process.env.VAPID_PUBLIC_KEY || '' };
        }
        async subscribe(userId, subscription) {
            return this.prisma.pushSubscription.upsert({
                where: { userId_endpoint: { userId, endpoint: subscription.endpoint } },
                update: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
                create: {
                    userId,
                    endpoint: subscription.endpoint,
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
            });
        }
        async sendToUser(userId, payload) {
            if (!this.vapidConfigured) {
                this.logger.warn(`Push not configured — skipping notification to ${userId}`);
                return { sent: 0 };
            }
            // Check quiet hours
            const prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
            if (prefs) {
                const hour = new Date().getHours();
                if (prefs.quietHoursStart <= prefs.quietHoursEnd
                    ? hour >= prefs.quietHoursStart && hour < prefs.quietHoursEnd
                    : hour >= prefs.quietHoursStart || hour < prefs.quietHoursEnd) {
                    return { sent: 0, reason: 'quiet_hours' };
                }
            }
            const subscriptions = await this.prisma.pushSubscription.findMany({ where: { userId } });
            let sent = 0;
            for (const sub of subscriptions) {
                try {
                    await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload));
                    sent++;
                }
                catch (err) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
                    }
                }
            }
            return { sent };
        }
        async sendStreakReminders() {
            // Find users who haven't worked out today but have active streaks
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const usersWithStreaks = await this.prisma.userProgress.findMany({
                where: {
                    currentStreak: { gte: 2 },
                    lastWorkoutDate: { lt: today },
                },
                include: { user: true },
            });
            let sent = 0;
            for (const progress of usersWithStreaks) {
                const prefs = await this.prisma.notificationPreference.findUnique({
                    where: { userId: progress.userId },
                });
                if (prefs && !prefs.streakWarning)
                    continue;
                await this.sendToUser(progress.userId, {
                    title: `🔥 Série ${progress.currentStreak} dní!`,
                    body: `Neztrať sérii, ${progress.user.name}! Udělej dnes alespoň krátký trénink.`,
                    url: '/dashboard',
                    tag: 'streak-reminder',
                });
                sent++;
            }
            return { sent, total: usersWithStreaks.length };
        }
        async getPreferences(userId) {
            let prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
            if (!prefs) {
                prefs = await this.prisma.notificationPreference.create({ data: { userId } });
            }
            return prefs;
        }
        async updatePreferences(userId, data) {
            await this.getPreferences(userId);
            return this.prisma.notificationPreference.update({ where: { userId }, data });
        }
    };
    __setFunctionName(_classThis, "NotificationService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationService = _classThis;
})();
export { NotificationService };
//# sourceMappingURL=notification.service.js.map