import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateRehabDto {
  @IsOptional()
  @IsString()
  @IsIn(['active', 'completed', 'paused'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
