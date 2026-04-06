import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationService {
    private prisma;
    private readonly logger;
    private vapidConfigured;
    constructor(prisma: PrismaService);
    getVapidPublicKey(): {
        publicKey: string;
    };
    subscribe(userId: string, subscription: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        endpoint: string;
        p256dh: string;
        auth: string;
    }>;
    sendToUser(userId: string, payload: {
        title: string;
        body: string;
        url?: string;
        tag?: string;
    }): Promise<{
        sent: number;
        reason?: undefined;
    } | {
        sent: number;
        reason: string;
    }>;
    sendStreakReminders(): Promise<{
        sent: number;
        total: number;
    }>;
    getPreferences(userId: string): Promise<{
        id: string;
        userId: string;
        workoutReminder: boolean;
        streakWarning: boolean;
        achievements: boolean;
        quietHoursStart: number;
        quietHoursEnd: number;
    }>;
    updatePreferences(userId: string, data: {
        workoutReminder?: boolean;
        streakWarning?: boolean;
        achievements?: boolean;
        quietHoursStart?: number;
        quietHoursEnd?: number;
    }): Promise<{
        id: string;
        userId: string;
        workoutReminder: boolean;
        streakWarning: boolean;
        achievements: boolean;
        quietHoursStart: number;
        quietHoursEnd: number;
    }>;
}
//# sourceMappingURL=notification.service.d.ts.map