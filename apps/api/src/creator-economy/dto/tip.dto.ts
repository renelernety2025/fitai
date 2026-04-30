import { IsInt, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

export class TipDto {
  @IsInt()
  @Min(10)
  @Max(5000)
  xpAmount: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;
}
