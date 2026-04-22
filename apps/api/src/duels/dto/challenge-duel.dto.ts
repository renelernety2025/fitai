import { IsEnum, IsInt, IsString, Max, Min } from 'class-validator';

export class ChallengeDuelDto {
  @IsString()
  challengedId!: string;

  @IsString()
  type!: string;

  @IsString()
  metric!: string;

  @IsString()
  duration!: string;

  @IsInt()
  @Min(0)
  @Max(500)
  xpBet!: number;
}
