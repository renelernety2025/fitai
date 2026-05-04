import { IsString, MaxLength, MinLength } from 'class-validator';

export class HistoryQueryDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  query!: string;
}
