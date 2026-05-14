import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkillTreeService } from './skill-tree.service';

@Controller('skill-tree')
@UseGuards(JwtAuthGuard)
export class SkillTreeController {
  constructor(private service: SkillTreeService) {}

  @Get()
  getTree(@Request() req: any) {
    return this.service.getTree(req.user.id);
  }

  @Post('check')
  @Throttle({ default: { limit: 20, ttl: seconds(60) } })
  checkAndUnlock(@Request() req: any) {
    return this.service.checkAndUnlock(req.user.id);
  }
}
