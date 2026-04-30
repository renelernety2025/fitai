import { IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PushKeysDto {
  @IsString()
  @MaxLength(200)
  p256dh: string;

  @IsString()
  @MaxLength(200)
  auth: string;
}

export class PushSubscribeDto {
  @IsString()
  @MaxLength(500)
  endpoint: string;

  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}
