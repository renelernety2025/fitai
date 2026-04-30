import {
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class GenerateMealPlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  weekStart?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  preferences?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cuisine?: string;
}
