import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StreakFreezeService } from './streak-freeze.service';

@Controller('streak-freeze')
@UseGuards(JwtAuthGuard)
export class StreakFreezeController {
  constructor(private service: StreakFreezeService) {}

  @Get('status')
  getStatus(@Request() req: any) {
    return this.service.getStatus(req.user.id);
  }

  @Post('use')
  useFreeze(@Request() req: any) {
    return this.service.useFreeze(req.user.id);
  }
}
