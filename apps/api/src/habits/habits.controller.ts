import { Body, Controller, Get, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HabitsService } from './habits.service';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private service: HabitsService) {}

  @Get('today')
  today(@Request() req: any) {
    return this.service.getToday(req.user.id);
  }

  @Put('today')
  upsert(@Request() req: any, @Body() body: any) {
    return this.service.upsertToday(req.user.id, body);
  }

  @Get('history')
  history(@Request() req: any, @Query('days') days?: string) {
    return this.service.getHistory(req.user.id, days ? parseInt(days) : 30);
  }

  @Get('stats')
  stats(@Request() req: any) {
    return this.service.getStats(req.user.id);
  }
}
