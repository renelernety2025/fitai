import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateClipDto {
  @IsString()
  @MaxLength(500)
  s3Key!: string;

  @IsInt()
  @Min(1)
  @Max(300)
  durationSeconds!: number;

  @IsOptional()
  @IsString()
  exerciseId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;
}
