import { PrismaService } from '../prisma/prisma.service';
import { ElevenLabsService } from './elevenlabs.service';
interface FeedbackRequest {
    userId: string;
    sessionType: 'video' | 'gym';
    sessionId: string;
    exerciseName: string;
    currentPhase: string;
    formScore: number;
    repCount: number;
    targetReps: number;
    jointAngles: {
        joint: string;
        angle: number;
    }[];
    recentErrors: string[];
}
export declare class CoachingService {
    private prisma;
    private elevenLabs;
    private readonly logger;
    constructor(prisma: PrismaService, elevenLabs: ElevenLabsService);
    generateFeedback(req: FeedbackRequest): Promise<{
        message: string;
        priority: "safety" | "correction" | "encouragement";
        audioBase64: string | null;
    }>;
    logSafetyEvent(data: {
        userId: string;
        sessionType: string;
        sessionId: string;
        jointName: string;
        measuredAngle: number;
        exerciseName: string;
        severity: string;
    }): Promise<{
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
    precache(): Promise<{
        cached: number;
        total: number;
    }>;
    synthesize(text: string): Promise<{
        text: string;
        audioBase64: string | null;
        fallbackToWebSpeech: boolean;
    }>;
    private buildContext;
    private callClaude;
    private getStaticFeedback;
    private logMessage;
}
export {};
//# sourceMappingURL=coaching.service.d.ts.map