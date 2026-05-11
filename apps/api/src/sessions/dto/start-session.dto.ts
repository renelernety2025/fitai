import { IsOptional, IsUUID } from 'class-validator';

export class StartSessionDto {
  @IsOptional()
  @IsUUID()
  videoId?: string;
}
