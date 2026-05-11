import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class InviteToChallengeDto {
  @IsUUID()
  userId: string;
}

export class FlashUpdateDto {
  @IsInt()
  @Min(0)
  @Max(100000)
  value: number;
}
