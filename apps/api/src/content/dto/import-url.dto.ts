import { IsString, IsUrl, MaxLength } from 'class-validator';

export class ImportUrlDto {
  @IsString()
  @IsUrl({ require_tld: true, require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2000)
  sourceUrl: string;
}
