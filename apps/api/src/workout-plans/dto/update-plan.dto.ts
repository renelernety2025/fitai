import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class UpdatePlannedExerciseDto {
  @IsUUID()
  exerciseId!: string;

  @IsInt()
  @Min(0)
  orderIndex!: number;

  @IsInt()
  @Min(1)
  targetSets!: number;

  @IsInt()
  @Min(1)
  targetReps!: number;

  @IsOptional()
  @IsNumber()
  targetWeight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  restSeconds?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsOptional()
  @IsString()
  groupType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  groupOrder?: number;
}

class UpdateWorkoutDayDto {
  @IsInt()
  @Min(0)
  dayIndex!: number;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameCs?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePlannedExerciseDto)
  exercises!: UpdatePlannedExerciseDto[];
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameCs?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkoutDayDto)
  days?: UpdateWorkoutDayDto[];
}
