import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CalendarMonthDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must be YYYY-MM format' })
  month: string;
}

export class CreateScheduledWorkoutDto {
  @IsDateString()
  date: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  workoutPlanId?: string;

  @IsOptional()
  @IsInt()
  workoutDayIdx?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateScheduledWorkoutDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  workoutPlanId?: string;

  @IsOptional()
  @IsInt()
  workoutDayIdx?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompleteWorkoutDto {
  @IsOptional()
  @IsString()
  gymSessionId?: string;
}
