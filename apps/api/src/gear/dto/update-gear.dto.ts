import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateGearDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
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
