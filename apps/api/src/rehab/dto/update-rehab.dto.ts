import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRehabDto {
  @IsOptional()
  @IsString()
  @IsIn(['active', 'completed', 'paused'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
