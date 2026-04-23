import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateGearDto {
  @IsString()
  @IsIn(['SHOES', 'BELT', 'GLOVES', 'WRAPS', 'CLOTHING', 'EQUIPMENT', 'OTHER_GEAR'])
  category!: string;

  @IsString()
  @MaxLength(100)
  brand!: string;

  @IsString()
  @MaxLength(100)
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
