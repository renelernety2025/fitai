import { GymSessionsService } from './gym-sessions.service';
import { StartGymSessionDto } from './dto/start-gym-session.dto';
import { CompleteSetDto } from './dto/complete-set.dto';
export declare class GymSessionsController {
    private gymSessionsService;
    constructor(gymSessionsService: GymSessionsService);
    start(req: any, dto: StartGymSessionDto): Promise<({
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
    completeSet(id: string, req: any, dto: CompleteSetDto): Promise<{
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
    end(id: string, req: any): Promise<{
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
    getMySessions(req: any): Promise<({
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
    getSession(id: string): Promise<{
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
//# sourceMappingURL=gym-sessions.controller.d.ts.map