import { IsString, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CompleteSetDto {
  @IsString()
  setId: string;

  @IsInt()
  @Min(0)
  actualReps: number;

  @IsOptional()
  @IsNumber()
  actualWeight?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  formScore: number;

  @IsOptional()
  repData?: any;
}
