import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateChallengeDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  type!: string;

  @IsInt()
  @Min(1)
  @Max(100000)
  targetValue!: number;

  @IsInt()
  @Min(1)
  @Max(30)
  durationDays!: number;
}
