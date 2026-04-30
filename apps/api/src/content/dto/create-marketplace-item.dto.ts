import { IsString, IsOptional, IsNumber, IsIn, MaxLength, Min, Max } from 'class-validator';

const ITEM_TYPES = ['workout_plan', 'meal_plan', 'program', 'guide'];

export class CreateMarketplaceItemDto {
  @IsIn(ITEM_TYPES)
  type: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(200)
  titleCs: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  linkedId?: string;
}
