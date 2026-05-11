import { IsUUID } from 'class-validator';

export class StartPreprocessingDto {
  @IsUUID()
  videoId: string;
}
