import { NotificationService } from './notification.service';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    getVapidKey(): {
        publicKey: string;
    };
    subscribe(req: any, dto: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        endpoint: string;
        p256dh: string;
        auth: string;
    }>;
    getPreferences(req: any): Promise<{
        id: string;
        userId: string;
        workoutReminder: boolean;
        streakWarning: boolean;
        achievements: boolean;
        quietHoursStart: number;
        quietHoursEnd: number;
    }>;
    updatePreferences(req: any, dto: any): Promise<{
        id: string;
        userId: string;
        workoutReminder: boolean;
        streakWarning: boolean;
        achievements: boolean;
        quietHoursStart: number;
        quietHoursEnd: number;
    }>;
    sendStreakReminders(): Promise<{
        sent: number;
        total: number;
    }>;
    testNotification(req: any): Promise<{
        sent: number;
        reason?: undefined;
    } | {
        sent: number;
        reason: string;
    }>;
}
//# sourceMappingURL=notification.controller.d.ts.map