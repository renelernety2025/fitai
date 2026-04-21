import { IsIn, IsString } from 'class-validator';

export class ReactDto {
  @IsString()
  @IsIn(['feed_item', 'story'])
  targetType!: string;

  @IsString()
  targetId!: string;

  @IsString()
  @IsIn(['fire', 'muscle', 'clap', 'heart', 'hundred'])
  emoji!: string;
}
