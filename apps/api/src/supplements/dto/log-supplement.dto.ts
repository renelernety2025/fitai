import { IsString, MaxLength } from 'class-validator';

export class LogSupplementDto {
  @IsString()
  @MaxLength(100)
  userSupplementId!: string;
}
