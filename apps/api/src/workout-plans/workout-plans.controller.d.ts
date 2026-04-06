import { WorkoutPlansService } from './workout-plans.service';
export declare class WorkoutPlansController {
    private plansService;
    constructor(plansService: WorkoutPlansService);
    findAll(req: any): Promise<({
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
    findOne(id: string): Promise<{
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
    create(req: any, dto: any): Promise<{
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
    clone(id: string, req: any): Promise<{
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
    delete(id: string, req: any): Promise<{
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
//# sourceMappingURL=workout-plans.controller.d.ts.map