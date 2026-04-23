import { IsEnum, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class ChallengeDuelDto {
  @IsString()
  challengedId!: string;

  @IsString()
  type!: string;

  @IsString()
  @MaxLength(200)
  metric!: string;

  @IsString()
  duration!: string;

  @IsInt()
  @Min(0)
  @Max(500)
  xpBet!: number;
}
