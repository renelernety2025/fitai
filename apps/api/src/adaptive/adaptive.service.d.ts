import { PrismaService } from '../prisma/prisma.service';
export declare class AdaptiveService {
    private prisma;
    constructor(prisma: PrismaService);
    getRecommendation(userId: string, exerciseId: string): Promise<{
        exerciseId: string;
        currentWeight: number | null;
        recommendedWeight: number | null;
        reason: string;
        reasonCs: string;
    }>;
}
//# sourceMappingURL=adaptive.service.d.ts.map