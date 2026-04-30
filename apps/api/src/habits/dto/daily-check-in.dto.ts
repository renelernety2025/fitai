import { IsNumber, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';

export class DailyCheckInDto {
  @IsNumber()
  @Min(0)
  @Max(24)
  sleepHours: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  sleepQuality: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  hydrationL: number;

  @IsNumber()
  @Min(0)
  @Max(100000)
  steps: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  mood: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  energy: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  soreness: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  stress: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
