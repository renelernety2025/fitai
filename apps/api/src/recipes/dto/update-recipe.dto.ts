import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsArray()
  ingredients?: any[]; // [{name, amount, unit}]

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  instructions?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  prepMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  cookMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  servings?: number;

  @IsOptional()
  @IsInt()
  kcalPerServing?: number;

  @IsOptional()
  @IsNumber()
  proteinG?: number;

  @IsOptional()
  @IsNumber()
  carbsG?: number;

  @IsOptional()
  @IsNumber()
  fatG?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}
