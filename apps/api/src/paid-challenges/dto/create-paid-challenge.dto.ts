import {
  IsString,
  IsInt,
  IsDateString,
  IsIn,
  MaxLength,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreatePaidChallengeDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsInt()
  @Min(0)
  @Max(5000)
  entryFeeXP!: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @IsIn(['total_reps', 'total_volume', 'total_sessions', 'streak_days'])
  metric!: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(1000)
  maxParticipants?: number;
}
