import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;
}
