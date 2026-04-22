import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GearReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  text?: string;
}
