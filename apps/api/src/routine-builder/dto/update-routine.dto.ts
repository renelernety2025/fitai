import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
