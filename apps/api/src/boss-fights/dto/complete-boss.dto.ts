import { IsBoolean, IsInt, Min } from 'class-validator';

export class CompleteBossDto {
  @IsInt()
  @Min(0)
  score: number;

  @IsBoolean()
  defeated: boolean;
}
