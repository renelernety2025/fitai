import { PrismaService } from '../prisma/prisma.service';
import { MuscleGroup, VideoDifficulty } from '@prisma/client';
export declare class ExercisesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        muscleGroup?: MuscleGroup;
        difficulty?: VideoDifficulty;
    }): Promise<{
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
    findById(id: string): Promise<{
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
    create(data: any): Promise<{
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
    update(id: string, data: any): Promise<{
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
//# sourceMappingURL=exercises.service.d.ts.map