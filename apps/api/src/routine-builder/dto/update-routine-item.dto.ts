import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateRoutineItemDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  referenceName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
