import { IsString, MaxLength } from 'class-validator';

export class CommentClipDto {
  @IsString()
  @MaxLength(1000)
  text!: string;
}
