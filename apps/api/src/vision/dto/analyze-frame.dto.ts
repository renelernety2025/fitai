import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class JointAngleDto {
  @IsString()
  @MaxLength(40)
  joint: string;

  @IsNumber()
  @Min(-360)
  @Max(360)
  angle: number;
}

export class AnalyzeFrameDto {
  @IsString()
  @MaxLength(80)
  exerciseName: string;

  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => JointAngleDto)
  jointAngles: JointAngleDto[];

  @IsOptional()
  @IsString()
  @MaxLength(2_000_000)
  imageBase64?: string;
}

export class DetectExerciseDto {
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => JointAngleDto)
  jointAngles: JointAngleDto[];
}

export class EstimateWeightDto {
  @IsString()
  @MaxLength(2_000_000)
  imageBase64: string;
}
