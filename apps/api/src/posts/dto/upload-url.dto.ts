import { IsInt, IsIn, Min, Max } from 'class-validator';

export class UploadUrlDto {
  @IsInt()
  @Min(1)
  @Max(4)
  count: number;

  @IsIn(['image/jpeg', 'image/png', 'image/heic'])
  contentType: string;
}
