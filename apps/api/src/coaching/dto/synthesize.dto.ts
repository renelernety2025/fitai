import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SynthesizeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  text: string;

  @IsOptional()
  @IsIn(['mp3', 'pcm'])
  audioFormat?: 'mp3' | 'pcm';
}
