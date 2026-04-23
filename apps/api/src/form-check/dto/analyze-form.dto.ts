import { IsString, MaxLength } from 'class-validator';

export class AnalyzeFormDto {
  @IsString()
  @MaxLength(500)
  s3Key!: string;

  @IsString()
  exerciseId!: string;
}
