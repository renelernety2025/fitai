import { IsIn, IsString } from 'class-validator';

export class ShareDto {
  @IsString()
  @IsIn(['workout', 'pr', 'journal', 'recipe'])
  type!: string;

  @IsString()
  referenceId!: string;
}
