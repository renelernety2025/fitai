import { PreprocessingService } from './preprocessing.service';
export declare class PreprocessingController {
    private preprocessingService;
    constructor(preprocessingService: PreprocessingService);
    start(videoId: string): Promise<{
        jobId: `${string}-${string}-${string}-${string}-${string}`;
        status: string;
        message: string;
    }>;
    getStatus(videoId: string): Promise<{
        id: string;
        choreographyUrl: string | null;
        preprocessingStatus: import(".prisma/client").$Enums.PreprocessingStatus;
        preprocessingError: string | null;
        preprocessingJobId: string | null;
    }>;
}
//# sourceMappingURL=preprocessing.controller.d.ts.map