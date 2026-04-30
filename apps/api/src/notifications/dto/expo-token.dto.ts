import { IsString, MaxLength } from 'class-validator';

export class ExpoTokenDto {
  @IsString()
  @MaxLength(200)
  token: string;
}
