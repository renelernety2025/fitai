import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const CHALLENGE_TYPES = ['workout', 'reps', 'volume', 'streak', 'minutes', 'sessions'] as const;

export class CreateChallengeDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsIn(CHALLENGE_TYPES)
  type!: typeof CHALLENGE_TYPES[number];

  @IsInt()
  @Min(1)
  @Max(100000)
  targetValue!: number;

  @IsInt()
  @Min(1)
  @Max(30)
  durationDays!: number;
}
