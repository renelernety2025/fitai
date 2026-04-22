import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateRoutineDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
