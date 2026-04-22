import { IsString, IsOptional, IsInt, IsDateString, Min, Max, MaxLength } from 'class-validator';

export class CreateDropDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  category!: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  totalEditions!: number;

  @IsInt()
  @Min(0)
  priceXP!: number;

  @IsDateString()
  releaseDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
