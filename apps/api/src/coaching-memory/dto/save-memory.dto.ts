import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SaveMemoryDto {
  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsString()
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
