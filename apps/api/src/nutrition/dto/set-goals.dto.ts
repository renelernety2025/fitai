import { IsNumber, Min, Max } from 'class-validator';

export class SetGoalsDto {
  @IsNumber()
  @Min(0)
  @Max(20000)
  dailyKcal: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  dailyProteinG: number;

  @IsNumber()
  @Min(0)
  @Max(2000)
  dailyCarbsG: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  dailyFatG: number;
}
