import {
  IsString,
  IsOptional,
  IsArray,
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
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;
}
