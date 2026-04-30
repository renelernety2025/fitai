import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  workoutReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  streakWarning?: boolean;

  @IsOptional()
  @IsBoolean()
  achievements?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  quietHoursStart?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  quietHoursEnd?: number;
}
