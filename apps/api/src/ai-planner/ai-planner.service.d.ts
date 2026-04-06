import { PrismaService } from '../prisma/prisma.service';
import { FitnessGoal } from '@prisma/client';
export declare class AIPlannerService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getOrCreateProfile(userId: string): Promise<{
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
    updateProfile(userId: string, data: {
        goal?: FitnessGoal;
        experienceMonths?: number;
        daysPerWeek?: number;
        sessionMinutes?: number;
        hasGymAccess?: boolean;
        equipment?: string[];
        injuries?: string[];
        notes?: string;
    }): Promise<{
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
    generatePlan(userId: string): Promise<{
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
    getBreakRecoveryPlan(userId: string): Promise<{
        daysSinceLastWorkout: number;
        intensityMultiplier: number;
        message: string;
    } | null>;
    getAsymmetryReport(userId: string): Promise<{
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
    getHomeAlternative(userId: string): Promise<{
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
    private buildPlanPrompt;
    private callClaude;
    private getMockPlan;
    private createPlanFromAI;
}
//# sourceMappingURL=ai-planner.service.d.ts.map