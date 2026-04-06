import type { CoachingFeedbackResponse } from '@fitai/shared';
interface CoachingRequestParams {
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
export declare function requestCoachingFeedback(params: CoachingRequestParams): Promise<CoachingFeedbackResponse | null>;
export declare function resetCoachingThrottle(): void;
export {};
//# sourceMappingURL=coaching-client.d.ts.map