import { PrismaService } from '../prisma/prisma.service';
export declare class MediaConvertService {
    private prisma;
    private readonly logger;
    private client;
    private bucket;
    private roleArn;
    private cloudfrontUrl;
    constructor(prisma: PrismaService);
    createTranscodeJob(s3RawKey: string, videoId: string): Promise<import("@aws-sdk/client-mediaconvert").CreateJobCommandOutput | {
        mock: boolean;
        videoId: string;
    }>;
    handleJobComplete(videoId: string): Promise<void>;
    handleJobError(videoId: string, errorMessage: string): Promise<void>;
    private hlsOutput;
}
//# sourceMappingURL=mediaconvert.service.d.ts.map