import { IsString, IsNumber, IsIn, MaxLength, Min, Max } from 'class-validator';

export class SafetyEventDto {
  @IsIn(['video', 'gym'])
  sessionType: 'video' | 'gym';

  @IsString()
  @MaxLength(100)
  sessionId: string;

  @IsString()
  @MaxLength(50)
  jointName: string;

  @IsNumber()
  @Min(-360)
  @Max(360)
  measuredAngle: number;

  @IsString()
  @MaxLength(100)
  exerciseName: string;

  @IsIn(['warning', 'critical'])
  severity: 'warning' | 'critical';
}
