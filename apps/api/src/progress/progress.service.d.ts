import { PrismaService } from '../prisma/prisma.service';
interface SessionData {
    durationSeconds: number;
    accuracyScore: number;
    completedFullVideo: boolean;
}
export declare class ProgressService {
    private prisma;
    constructor(prisma: PrismaService);
    updateProgress(userId: string, sessionData: SessionData): Promise<{
        xpGained: number;
        totalXP: number;
        currentStreak: number;
        levelUp: boolean;
        levelName: "Začátečník" | "Pokročilý" | "Expert" | "Mistr" | "Legenda";
    }>;
    getProgress(userId: string): Promise<{
        levelName: "Začátečník" | "Pokročilý" | "Expert" | "Mistr" | "Legenda";
        levelNumber: 1 | 2 | 4 | 3 | 5;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        totalXP: number;
        currentStreak: number;
        longestStreak: number;
        lastWorkoutDate: Date | null;
        totalSessions: number;
        totalMinutes: number;
    }>;
    getReminderStatus(userId: string): Promise<{
        shouldRemind: boolean;
        daysSinceLastWorkout: null;
        message: string;
    } | {
        shouldRemind: boolean;
        daysSinceLastWorkout: number;
        message: string;
    }>;
}
export {};
//# sourceMappingURL=progress.service.d.ts.map