import { IsIn, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class SaveMemoryDto {
  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsString()
  @MaxLength(5000)
  insight!: string;

  @IsString()
  @MaxLength(50)
  @IsIn(['FORM', 'TECHNIQUE', 'RECOVERY', 'NUTRITION', 'MINDSET'])
  category!: string;

  @IsOptional()
  @IsNumber()
  metricBefore?: number;

  @IsOptional()
  @IsNumber()
  metricAfter?: number;
}
