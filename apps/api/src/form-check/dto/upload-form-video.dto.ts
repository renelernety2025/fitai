import { IsIn, IsString } from 'class-validator';

export class UploadFormVideoDto {
  @IsString()
  fileName!: string;

  @IsString()
  @IsIn(['video/mp4', 'video/quicktime', 'video/webm'])
  contentType!: string;
}
