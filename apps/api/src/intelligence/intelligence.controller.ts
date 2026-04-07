import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('intelligence')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(private intelligenceService: IntelligenceService) {}

  @Get('insights')
  getInsights(@Request() req: any) {
    return this.intelligenceService.getInsights(req.user.id);
  }

  @Get('plateaus')
  getPlateaus(@Request() req: any) {
    return this.intelligenceService.detectPlateaus(req.user.id);
  }

  @Get('recovery')
  getRecovery(@Request() req: any) {
    return this.intelligenceService.analyzeRecovery(req.user.id);
  }

  @Get('weak-points')
  getWeakPoints(@Request() req: any) {
    return this.intelligenceService.detectWeakPoints(req.user.id);
  }

  @Put('priority-muscles')
  updatePriorityMuscles(@Request() req: any, @Body('muscles') muscles: string[]) {
    return this.intelligenceService.updatePriorityMuscles(req.user.id, muscles || []);
  }
}
