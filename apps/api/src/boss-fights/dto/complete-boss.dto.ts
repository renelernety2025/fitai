import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CompleteBossDto {
  @IsInt()
  @Min(0)
  score: number;

  @IsBoolean()
  defeated: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSec?: number;
}
