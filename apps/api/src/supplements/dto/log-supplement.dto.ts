import { IsString } from 'class-validator';

export class LogSupplementDto {
  @IsString()
  userSupplementId!: string;
}
