import { IsString, IsIn } from 'class-validator';

export class CreateRehabDto {
  @IsString()
  injuryType: string;

  @IsString()
  bodyPart: string;

  @IsString()
  @IsIn(['mild', 'moderate', 'severe'])
  severity: string;
}
