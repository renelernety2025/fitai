import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AchievementsService } from './achievements.service';
import { UnlockByCodeDto } from './dto/unlock-by-code.dto';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private service: AchievementsService) {}

  @Get()
  getAll(@Request() req: any) {
    return this.service.getAll(req.user.id);
  }

  @Get('unlocked')
  getUnlocked(@Request() req: any) {
    return this.service.getUnlocked(req.user.id);
  }

  @Post('check')
  check(@Request() req: any) {
    return this.service.checkAndUnlock(req.user.id);
  }

  @Post('unlock')
  unlockByCode(@Request() req: any, @Body() dto: UnlockByCodeDto) {
    return this.service.unlockByCode(req.user.id, dto.code);
  }
}
