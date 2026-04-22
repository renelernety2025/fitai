import { IsNumber, Min } from 'class-validator';

export class SubmitScoreDto {
  @IsNumber()
  @Min(0)
  score!: number;
}
