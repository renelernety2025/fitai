import { IsEnum, IsOptional } from 'class-validator';

export enum LeagueTierParam {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
  LEGEND = 'LEGEND',
}

export class LeaderboardQueryDto {
  @IsOptional()
  @IsEnum(LeagueTierParam)
  tier?: LeagueTierParam;
}
