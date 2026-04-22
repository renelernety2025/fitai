import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class AddRoutineItemDto {
  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsString()
  @MaxLength(200)
  referenceName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
