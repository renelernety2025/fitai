import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class UpdateTrainerDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];
}
