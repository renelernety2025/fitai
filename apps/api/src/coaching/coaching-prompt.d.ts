export interface CoachingContext {
    userName: string;
    level: string;
    totalXP: number;
    currentStreak: number;
    daysSinceLastWorkout: number | null;
    weakJoints: string[];
    currentExercise: string;
    currentPhase: string;
    recentFormScores: number[];
    repCount: number;
    targetReps: number;
    safetyAlerts: string[];
    recentMessages: string[];
}
export declare function buildCoachingSystemPrompt(ctx: CoachingContext): string;
export declare function buildCoachingUserMessage(ctx: CoachingContext): string;
//# sourceMappingURL=coaching-prompt.d.ts.map