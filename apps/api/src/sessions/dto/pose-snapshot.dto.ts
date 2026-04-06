import { IsInt, IsString, IsBoolean, IsOptional, IsObject, Min } from 'class-validator';

export class PoseSnapshotDto {
  @IsInt()
  @Min(0)
  timestamp: number;

  @IsString()
  poseName: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsObject()
  jointAngles: Record<string, number>;
}
