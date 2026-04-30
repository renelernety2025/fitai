import {
  IsString,
  IsOptional,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const SOURCES = ['Doma', 'Restaurace', 'Obchod', 'Rozvoz'];

export class AddFoodDto {
  @IsIn(MEAL_TYPES)
  mealType: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsNumber()
  @Min(0)
  @Max(10000)
  kcal: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  proteinG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2000)
  carbsG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  fatG?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  servings?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  photoS3Key?: string;

  @IsOptional()
  @IsIn(SOURCES)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourceDetail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  ingredients?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;
}
