import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveMemoryDto {
  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsString()
  @MaxLength(5000)
  insight!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsNumber()
  metricBefore?: number;

  @IsOptional()
  @IsNumber()
  metricAfter?: number;
}
