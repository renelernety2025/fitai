import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { StartGymSessionDto } from './dto/start-gym-session.dto';
import { CompleteSetDto } from './dto/complete-set.dto';
export declare class GymSessionsService {
    private prisma;
    private progressService;
    constructor(prisma: PrismaService, progressService: ProgressService);
    startSession(userId: string, dto: StartGymSessionDto): Promise<({
        exerciseSets: ({
            exercise: {
                id: string;
                name: string;
                nameCs: string;
                description: string;
                descriptionCs: string;
                muscleGroups: import(".prisma/client").$Enums.MuscleGroup[];
                difficulty: import(".prisma/client").$Enums.VideoDifficulty;
                phases: import("@prisma/client/runtime/library").JsonValue;
                thumbnailUrl: string | null;
                instructionUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            gymSessionId: string;
            startedAt: Date | null;
            completedAt: Date | null;
            exerciseId: string;
            targetReps: number;
            targetWeight: number | null;
            setNumber: number;
            actualReps: number;
            actualWeight: number | null;
            formScore: number;
            status: import(".prisma/client").$Enums.SetStatus;
            repData: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    } & {
        id: string;
        userId: string;
        workoutPlanId: string | null;
        durationSeconds: number;
        startedAt: Date;
        completedAt: Date | null;
        workoutDayIndex: number | null;
        totalReps: number;
        averageFormScore: number;
    }) | null>;
    completeSet(sessionId: string, userId: string, dto: CompleteSetDto): Promise<{
        id: string;
        gymSessionId: string;
        startedAt: Date | null;
        completedAt: Date | null;
        exerciseId: string;
        targetReps: number;
        targetWeight: number | null;
        setNumber: number;
        actualReps: number;
        actualWeight: number | null;
        formScore: number;
        status: import(".prisma/client").$Enums.SetStatus;
        repData: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    endSession(sessionId: string, userId: string): Promise<{
        session: {
            id: string;
            userId: string;
            workoutPlanId: string | null;
            durationSeconds: number;
            startedAt: Date;
            completedAt: Date | null;
            workoutDayIndex: number | null;
            totalReps: number;
            averageFormScore: number;
        };
        progress: {
            bonusRepXP: number;
            xpGained: number;
            totalXP: number;
            currentStreak: number;
            levelUp: boolean;
            levelName: "Začátečník" | "Pokročilý" | "Expert" | "Mistr" | "Legenda";
        };
        totalReps: number;
        avgForm: number;
    }>;
    getMySessions(userId: string): Promise<({
        exerciseSets: ({
            exercise: {
                nameCs: string;
            };
        } & {
            id: string;
            gymSessionId: string;
            startedAt: Date | null;
            completedAt: Date | null;
            exerciseId: string;
            targetReps: number;
            targetWeight: number | null;
            setNumber: number;
            actualReps: number;
            actualWeight: number | null;
            formScore: number;
            status: import(".prisma/client").$Enums.SetStatus;
            repData: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        workoutPlan: {
            nameCs: string;
        } | null;
    } & {
        id: string;
        userId: string;
        workoutPlanId: string | null;
        durationSeconds: number;
        startedAt: Date;
        completedAt: Date | null;
        workoutDayIndex: number | null;
        totalReps: number;
        averageFormScore: number;
    })[]>;
    getSession(sessionId: string): Promise<{
        exerciseSets: ({
            exercise: {
                id: string;
                name: string;
                nameCs: string;
                description: string;
                descriptionCs: string;
                muscleGroups: import(".prisma/client").$Enums.MuscleGroup[];
                difficulty: import(".prisma/client").$Enums.VideoDifficulty;
                phases: import("@prisma/client/runtime/library").JsonValue;
                thumbnailUrl: string | null;
                instructionUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            gymSessionId: string;
            startedAt: Date | null;
            completedAt: Date | null;
            exerciseId: string;
            targetReps: number;
            targetWeight: number | null;
            setNumber: number;
            actualReps: number;
            actualWeight: number | null;
            formScore: number;
            status: import(".prisma/client").$Enums.SetStatus;
            repData: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
    } & {
        id: string;
        userId: string;
        workoutPlanId: string | null;
        durationSeconds: number;
        startedAt: Date;
        completedAt: Date | null;
        workoutDayIndex: number | null;
        totalReps: number;
        averageFormScore: number;
    }>;
}
//# sourceMappingURL=gym-sessions.service.d.ts.map