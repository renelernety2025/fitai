import { IsString, MaxLength, MinLength } from 'class-validator';

export class UnlockByCodeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  code: string;
}
