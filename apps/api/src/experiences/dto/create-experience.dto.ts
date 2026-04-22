import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsString()
  @MaxLength(500)
  locationAddress!: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsDateString()
  dateTime!: string;

  @IsInt()
  @Min(15)
  @Max(480)
  durationMinutes!: number;

  @IsInt()
  @Min(1)
  @Max(100)
  capacity!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceXP?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priceKc?: number;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cancellationPolicy?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
