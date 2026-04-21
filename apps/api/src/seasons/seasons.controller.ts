import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SeasonsService } from './seasons.service';

@Controller('seasons')
@UseGuards(JwtAuthGuard)
export class SeasonsController {
  constructor(private service: SeasonsService) {}

  @Get('current')
  getCurrent(@Request() req: any) {
    return this.service.getCurrent(req.user.id);
  }

  @Post('join')
  join(@Request() req: any) {
    return this.service.joinSeason(req.user.id);
  }

  @Post('check-missions')
  checkMissions(@Request() req: any) {
    return this.service.checkMissions(req.user.id);
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.service.getHistory(req.user.id);
  }
}
