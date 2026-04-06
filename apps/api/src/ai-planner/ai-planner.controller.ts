import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AIPlannerService } from './ai-planner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai-planner')
@UseGuards(JwtAuthGuard)
export class AIPlannerController {
  constructor(private aiPlannerService: AIPlannerService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.aiPlannerService.getOrCreateProfile(req.user.id);
  }

  @Put('profile')
  updateProfile(@Request() req: any, @Body() dto: any) {
    return this.aiPlannerService.updateProfile(req.user.id, dto);
  }

  @Post('generate')
  generatePlan(@Request() req: any) {
    return this.aiPlannerService.generatePlan(req.user.id);
  }

  @Get('break-recovery')
  getBreakRecovery(@Request() req: any) {
    return this.aiPlannerService.getBreakRecoveryPlan(req.user.id);
  }

  @Get('asymmetry')
  getAsymmetry(@Request() req: any) {
    return this.aiPlannerService.getAsymmetryReport(req.user.id);
  }

  @Get('home-alternative')
  getHomeAlternative(@Request() req: any) {
    return this.aiPlannerService.getHomeAlternative(req.user.id);
  }
}
