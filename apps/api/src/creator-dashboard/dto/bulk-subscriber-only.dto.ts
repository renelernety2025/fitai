import { IsArray, IsBoolean, IsString } from 'class-validator';

export class BulkSubscriberOnlyDto {
  @IsArray()
  @IsString({ each: true })
  postIds: string[];

  @IsBoolean()
  isSubscriberOnly: boolean;
}
