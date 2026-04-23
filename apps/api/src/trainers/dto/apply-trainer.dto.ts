import { IsString, IsArray, ArrayMaxSize, MaxLength } from 'class-validator';

export class ApplyTrainerDto {
  @IsString()
  @MaxLength(2000)
  bio!: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  certifications!: string[];

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  specializations!: string[];
}
