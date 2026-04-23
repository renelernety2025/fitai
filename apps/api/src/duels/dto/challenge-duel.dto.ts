import { IsIn, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class ChallengeDuelDto {
  @IsString()
  challengedId!: string;

  @IsString()
  @MaxLength(50)
  @IsIn(['MAX_REPS', 'HEAVIEST_LIFT', 'LONGEST_HOLD', 'FASTEST_DISTANCE'])
  type!: string;

  @IsString()
  @MaxLength(200)
  metric!: string;

  @IsString()
  @MaxLength(50)
  @IsIn(['HOUR_1', 'HOUR_6', 'HOUR_24', 'HOUR_48', 'WEEK'])
  duration!: string;

  @IsInt()
  @Min(0)
  @Max(500)
  xpBet!: number;
}
