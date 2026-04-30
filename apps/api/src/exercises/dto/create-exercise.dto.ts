import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(100)
  nameCs: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
  difficulty?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  muscleGroups?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  equipment?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionCs?: string;
}
