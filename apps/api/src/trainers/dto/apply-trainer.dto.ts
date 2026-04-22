import { IsString, IsArray, MaxLength } from 'class-validator';

export class ApplyTrainerDto {
  @IsString()
  @MaxLength(2000)
  bio!: string;

  @IsArray()
  @IsString({ each: true })
  certifications!: string[];

  @IsArray()
  @IsString({ each: true })
  specializations!: string[];
}
