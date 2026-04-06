import { ExercisesService } from './exercises.service';
import { MuscleGroup, VideoDifficulty } from '@prisma/client';
export declare class ExercisesController {
    private exercisesService;
    constructor(exercisesService: ExercisesService);
    findAll(muscleGroup?: MuscleGroup, difficulty?: VideoDifficulty): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    create(dto: any): Promise<{
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
    }>;
    update(id: string, dto: any): Promise<{
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
    }>;
    delete(id: string): Promise<{
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
    }>;
}
//# sourceMappingURL=exercises.controller.d.ts.map