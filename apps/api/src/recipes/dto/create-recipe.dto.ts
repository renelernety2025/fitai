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

export class CreateRecipeDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsArray()
  ingredients!: any[]; // [{name, amount, unit}]

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
}
