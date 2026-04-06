import { IsString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { VideoCategory, VideoDifficulty } from '@prisma/client';

export class CreateVideoDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(VideoCategory)
  category: VideoCategory;

  @IsEnum(VideoDifficulty)
  difficulty: VideoDifficulty;

  @IsInt()
  @Min(1)
  durationSeconds: number;

  @IsString()
  thumbnailUrl: string;

  @IsString()
  s3RawKey: string;

  @IsOptional()
  @IsString()
  choreographyUrl?: string;
}
