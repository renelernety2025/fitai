import { PrismaService } from '../prisma/prisma.service';
export declare class PreprocessingService {
    private prisma;
    private readonly logger;
    private s3Client;
    private bucket;
    private cloudfrontUrl;
    constructor(prisma: PrismaService);
    startPipeline(videoId: string): Promise<{
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
    private runPipeline;
    private stepTranscribe;
    private stepExtractChoreography;
    private stepSaveResult;
}
//# sourceMappingURL=preprocessing.service.d.ts.map