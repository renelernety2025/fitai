import { PrismaService } from '../prisma/prisma.service';
export declare class WorkoutPlansService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
        days: ({
            plannedExercises: ({
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
                orderIndex: number;
                workoutDayId: string;
                exerciseId: string;
                targetSets: number;
                targetReps: number;
                targetWeight: number | null;
                restSeconds: number;
                notes: string | null;
            })[];
        } & {
            id: string;
            name: string;
            nameCs: string;
            createdAt: Date;
            workoutPlanId: string;
            dayIndex: number;
        })[];
    } & {
        id: string;
        name: string;
        nameCs: string;
        description: string;
        difficulty: import(".prisma/client").$Enums.VideoDifficulty;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        type: import(".prisma/client").$Enums.WorkoutPlanType;
        isTemplate: boolean;
        daysPerWeek: number;
    })[]>;
    findById(id: string): Promise<{
        days: ({
            plannedExercises: ({
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
                orderIndex: number;
                workoutDayId: string;
                exerciseId: string;
                targetSets: number;
                targetReps: number;
                targetWeight: number | null;
                restSeconds: number;
                notes: string | null;
            })[];
        } & {
            id: string;
            name: string;
            nameCs: string;
            createdAt: Date;
            workoutPlanId: string;
            dayIndex: number;
        })[];
    } & {
        id: string;
        name: string;
        nameCs: string;
        description: string;
        difficulty: import(".prisma/client").$Enums.VideoDifficulty;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        type: import(".prisma/client").$Enums.WorkoutPlanType;
        isTemplate: boolean;
        daysPerWeek: number;
    }>;
    create(userId: string, data: any): Promise<{
        days: ({
            plannedExercises: {
                id: string;
                orderIndex: number;
                workoutDayId: string;
                exerciseId: string;
                targetSets: number;
                targetReps: number;
                targetWeight: number | null;
                restSeconds: number;
                notes: string | null;
            }[];
        } & {
            id: string;
            name: string;
            nameCs: string;
            createdAt: Date;
            workoutPlanId: string;
            dayIndex: number;
        })[];
    } & {
        id: string;
        name: string;
        nameCs: string;
        description: string;
        difficulty: import(".prisma/client").$Enums.VideoDifficulty;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        type: import(".prisma/client").$Enums.WorkoutPlanType;
        isTemplate: boolean;
        daysPerWeek: number;
    }>;
    clone(id: string, userId: string): Promise<{
        days: ({
            plannedExercises: {
                id: string;
                orderIndex: number;
                workoutDayId: string;
                exerciseId: string;
                targetSets: number;
                targetReps: number;
                targetWeight: number | null;
                restSeconds: number;
                notes: string | null;
            }[];
        } & {
            id: string;
            name: string;
            nameCs: string;
            createdAt: Date;
            workoutPlanId: string;
            dayIndex: number;
        })[];
    } & {
        id: string;
        name: string;
        nameCs: string;
        description: string;
        difficulty: import(".prisma/client").$Enums.VideoDifficulty;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        type: import(".prisma/client").$Enums.WorkoutPlanType;
        isTemplate: boolean;
        daysPerWeek: number;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        name: string;
        nameCs: string;
        description: string;
        difficulty: import(".prisma/client").$Enums.VideoDifficulty;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        type: import(".prisma/client").$Enums.WorkoutPlanType;
        isTemplate: boolean;
        daysPerWeek: number;
    }>;
}
//# sourceMappingURL=workout-plans.service.d.ts.map