import { IsString } from 'class-validator';

export class UploadClipUrlDto {
  @IsString()
  fileName!: string;

  @IsString()
  contentType!: string;
}
