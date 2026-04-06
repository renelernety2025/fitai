import { CoachingService } from './coaching.service';
export declare class CoachingController {
    private coachingService;
    constructor(coachingService: CoachingService);
    generateFeedback(req: any, dto: any): Promise<{
        message: string;
        priority: "safety" | "correction" | "encouragement";
        audioBase64: string | null;
    }>;
    logSafetyEvent(req: any, dto: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        sessionId: string;
        sessionType: string;
        jointName: string;
        measuredAngle: number;
        safeMin: number;
        safeMax: number;
        exerciseName: string;
        severity: string;
    }>;
    synthesize(text: string): Promise<{
        text: string;
        audioBase64: string | null;
        fallbackToWebSpeech: boolean;
    }>;
    precache(): Promise<{
        cached: number;
        total: number;
    }>;
}
//# sourceMappingURL=coaching.controller.d.ts.map