import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  MaxLength,
  Min,
  Max,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class JointAngleDto {
  @IsString()
  @MaxLength(50)
  joint: string;

  @IsNumber()
  @Min(-360)
  @Max(360)
  angle: number;
}

export class CoachingFeedbackDto {
  @IsIn(['video', 'gym'])
  sessionType: 'video' | 'gym';

  @IsString()
  @MaxLength(100)
  sessionId: string;

  @IsString()
  @MaxLength(100)
  exerciseName: string;

  @IsString()
  @MaxLength(50)
  currentPhase: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  formScore: number;

  @IsNumber()
  @Min(0)
  @Max(10000)
  repCount: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  targetReps: number;

  @IsArray()
  @ArrayMaxSize(33)
  @ValidateNested({ each: true })
  @Type(() => JointAngleDto)
  jointAngles: JointAngleDto[];

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  recentErrors: string[];
}
