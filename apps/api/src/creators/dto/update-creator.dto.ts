import {
  IsString,
  IsOptional,
  IsArray,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';

export class UpdateCreatorDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  specializations?: string[];
}
