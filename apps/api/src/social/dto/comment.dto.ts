import { IsString, MaxLength, MinLength } from 'class-validator';

export class CommentDto {
  @IsString()
  feedItemId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content!: string;
}
