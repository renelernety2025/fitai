export declare class S3Service {
    private readonly logger;
    private client;
    private bucket;
    constructor();
    getPresignedUploadUrl(filename: string, contentType: string): Promise<{
        uploadUrl: string;
        s3Key: string;
    }>;
}
//# sourceMappingURL=s3.service.d.ts.map