import { IsNumber, Min, Max } from 'class-validator';

export class SubmitScoreDto {
  @IsNumber()
  @Min(0)
  @Max(10000)
  score!: number;
}
