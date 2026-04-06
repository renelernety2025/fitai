import { IsInt, IsNumber, Min, Max } from 'class-validator';

export class EndSessionDto {
  @IsInt()
  @Min(0)
  durationSeconds: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  accuracyScore: number;
}
