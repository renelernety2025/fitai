import { IsString, IsIn, MaxLength } from 'class-validator';

export class CreateRehabDto {
  @IsString()
  @MaxLength(100)
  injuryType: string;

  @IsString()
  @MaxLength(100)
  bodyPart: string;

  @IsString()
  @IsIn(['mild', 'moderate', 'severe'])
  severity: string;
}
