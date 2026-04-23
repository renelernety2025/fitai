import { Controller, Get, Post, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DailyQuestsService } from './daily-quests.service';

@Controller('daily-quests')
@UseGuards(JwtAuthGuard)
export class DailyQuestsController {
  constructor(private readonly service: DailyQuestsService) {}

  @Get('today')
  getToday(@Req() req: any) {
    return this.service.getTodayQuests(req.user.id);
  }

  @Post(':id/complete')
  complete(@Req() req: any, @Param('id') id: string) {
    return this.service.completeQuest(req.user.id, id);
  }
}
