import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class LogRehabSessionDto {
  @IsArray()
  exercises: { name: string; sets?: number; reps?: number; notes?: string }[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  painLevel?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
