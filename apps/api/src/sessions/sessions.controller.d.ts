import { SessionsService } from './sessions.service';
import { EndSessionDto } from './dto/end-session.dto';
import { PoseSnapshotDto } from './dto/pose-snapshot.dto';
export declare class SessionsController {
    private sessionsService;
    constructor(sessionsService: SessionsService);
    start(req: any, videoId: string): Promise<{
        id: string;
        userId: string;
        durationSeconds: number;
        videoId: string | null;
        gymSessionId: string | null;
        startedAt: Date;
        completedAt: Date | null;
        accuracyScore: number;
        poseData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    end(id: string, req: any, dto: EndSessionDto): Promise<{
        session: {
            id: string;
            userId: string;
            durationSeconds: number;
            videoId: string | null;
            gymSessionId: string | null;
            startedAt: Date;
            completedAt: Date | null;
            accuracyScore: number;
            poseData: import("@prisma/client/runtime/library").JsonValue | null;
        };
        progress: {
            xpGained: number;
            totalXP: number;
            currentStreak: number;
            levelUp: boolean;
            levelName: "Začátečník" | "Pokročilý" | "Expert" | "Mistr" | "Legenda";
        };
    }>;
    poseSnap(id: string, req: any, dto: PoseSnapshotDto): Promise<{
        id: string;
        sessionId: string;
        timestamp: number;
        poseName: string;
        isCorrect: boolean;
        errorMessage: string | null;
        jointAngles: import("@prisma/client/runtime/library").JsonValue;
    } | {
        throttled: boolean;
    }>;
    getMySessions(req: any): Promise<({
        video: {
            thumbnailUrl: string;
            title: string;
            category: import(".prisma/client").$Enums.VideoCategory;
        } | null;
    } & {
        id: string;
        userId: string;
        durationSeconds: number;
        videoId: string | null;
        gymSessionId: string | null;
        startedAt: Date;
        completedAt: Date | null;
        accuracyScore: number;
        poseData: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getMyStats(req: any): Promise<{
        totalSessions: number;
        totalMinutes: number;
        averageAccuracy: number;
        currentStreak: number;
        longestStreak: number;
        totalXP: number;
        levelName: "Začátečník" | "Pokročilý" | "Expert" | "Mistr" | "Legenda";
        levelNumber: 1 | 2 | 4 | 3 | 5;
        weeklyActivity: {
            date: string;
            minutes: number;
        }[];
    }>;
}
//# sourceMappingURL=sessions.controller.d.ts.map