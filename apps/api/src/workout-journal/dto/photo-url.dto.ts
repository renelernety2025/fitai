import { IsString, Matches } from 'class-validator';

export class PhotoUrlDto {
  @IsString()
  @Matches(/^image\/(jpeg|png|heic)$/, {
    message: 'contentType must be image/jpeg, image/png or image/heic',
  })
  contentType: string;
}
