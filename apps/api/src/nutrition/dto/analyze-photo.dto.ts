import { IsString, MaxLength } from 'class-validator';

export class AnalyzePhotoDto {
  @IsString()
  @MaxLength(500)
  s3Key: string;
}
