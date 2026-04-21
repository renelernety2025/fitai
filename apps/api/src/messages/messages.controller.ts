import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get(':conversationId')
  getMessages(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.messagesService.getMessages(
      req.user.id,
      conversationId,
      50,
      cursor,
    );
  }

  @Post(':conversationId')
  sendMessage(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(
      req.user.id,
      conversationId,
      dto.content,
    );
  }

  @Post('start/:userId')
  startConversation(
    @Request() req: any,
    @Param('userId') userId: string,
  ) {
    return this.messagesService.startConversation(req.user.id, userId);
  }

  @Put(':messageId/read')
  markRead(
    @Request() req: any,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.markRead(req.user.id, messageId);
  }
}
