import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateGearDto {
  @IsString()
  category!: string;

  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsOptional()
  @IsString()
  purchaseDate?: string;

  @IsOptional()
  @IsNumber()
  priceKc?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxSessions?: number;
}
