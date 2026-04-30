import { IsString, IsOptional, IsInt, IsArray, MaxLength, Min, Max } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameCs?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;

  @IsOptional()
  @IsArray()
  days?: unknown[];
}
