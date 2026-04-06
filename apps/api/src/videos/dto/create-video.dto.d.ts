import { VideoCategory, VideoDifficulty } from '@prisma/client';
export declare class CreateVideoDto {
    title: string;
    description: string;
    category: VideoCategory;
    difficulty: VideoDifficulty;
    durationSeconds: number;
    thumbnailUrl: string;
    s3RawKey: string;
    choreographyUrl?: string;
}
//# sourceMappingURL=create-video.dto.d.ts.map