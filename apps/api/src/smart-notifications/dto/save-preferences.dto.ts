import { IsBoolean, IsOptional } from 'class-validator';

export class SavePreferencesDto {
  @IsBoolean() @IsOptional() workoutReminder?: boolean;
  @IsBoolean() @IsOptional() streakWarning?: boolean;
  @IsBoolean() @IsOptional() achievements?: boolean;
  @IsBoolean() @IsOptional() socialActivity?: boolean;
  @IsBoolean() @IsOptional() recoveryReady?: boolean;
}
