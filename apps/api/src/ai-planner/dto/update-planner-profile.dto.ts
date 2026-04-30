import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsIn,
  MaxLength,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator';
import { FitnessGoal } from '@prisma/client';

const FITNESS_GOALS: FitnessGoal[] = ['STRENGTH', 'HYPERTROPHY', 'ENDURANCE', 'WEIGHT_LOSS', 'GENERAL_FITNESS', 'MOBILITY'];

export class UpdatePlannerProfileDto {
  @IsOptional()
  @IsIn(FITNESS_GOALS)
  goal?: FitnessGoal;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(600)
  experienceMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;

  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(240)
  sessionMinutes?: number;

  @IsOptional()
  @IsBoolean()
  hasGymAccess?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  equipment?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  injuries?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
