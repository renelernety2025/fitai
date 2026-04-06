import { AdaptiveService } from './adaptive.service';
export declare class AdaptiveController {
    private adaptiveService;
    constructor(adaptiveService: AdaptiveService);
    getRecommendation(req: any, exerciseId: string): Promise<{
        exerciseId: string;
        currentWeight: number | null;
        recommendedWeight: number | null;
        reason: string;
        reasonCs: string;
    }>;
}
//# sourceMappingURL=adaptive.controller.d.ts.map