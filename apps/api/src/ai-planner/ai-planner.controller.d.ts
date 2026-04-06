import { AIPlannerService } from './ai-planner.service';
export declare class AIPlannerController {
    private aiPlannerService;
    constructor(aiPlannerService: AIPlannerService);
    getProfile(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        daysPerWeek: number;
        notes: string | null;
        goal: import(".prisma/client").$Enums.FitnessGoal;
        experienceMonths: number;
        sessionMinutes: number;
        hasGymAccess: boolean;
        equipment: string[];
        injuries: string[];
    }>;
    updateProfile(req: any, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        daysPerWeek: number;
        notes: string | null;
        goal: import(".prisma/client").$Enums.FitnessGoal;
        experienceMonths: number;
        sessionMinutes: number;
        hasGymAccess: boolean;
        equipment: string[];
        injuries: string[];
    }>;
    generatePlan(req: any): Promise<{
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
    getBreakRecovery(req: any): Promise<{
        daysSinceLastWorkout: number;
        intensityMultiplier: number;
        message: string;
    } | null>;
    getAsymmetry(req: any): Promise<{
        asymmetries: {
            joint: string;
            count: number;
            recommendation: string;
        }[];
        fatigue: {
            earlySetAvgForm: number;
            lateSetAvgForm: number;
            dropPercentage: number;
            recommendation: string;
        };
    }>;
    getHomeAlternative(req: any): Promise<{
        message: string;
        exercises: {
            id: string;
            nameCs: string;
            descriptionCs: string;
            targetSets: number;
            targetReps: number;
            restSeconds: number;
        }[];
    }>;
}
//# sourceMappingURL=ai-planner.controller.d.ts.map