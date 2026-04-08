import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiInsightsService } from './ai-insights.service';

@Controller('ai-insights')
@UseGuards(JwtAuthGuard)
export class AiInsightsController {
  constructor(private service: AiInsightsService) {}

  @Get('recovery-tips')
  recoveryTips(@Request() req: any) {
    return this.service.getRecoveryTips(req.user.id);
  }

  @Get('weekly-review')
  weeklyReview(@Request() req: any) {
    return this.service.getWeeklyReview(req.user.id);
  }

  @Get('nutrition-tips')
  nutritionTips(@Request() req: any) {
    return this.service.getNutritionTips(req.user.id);
  }

  /** AI Coach Daily Brief — flagship hero. Reads everything we know
   * about the user (recovery, weekly volume, plateau, injuries, profile,
   * recent history) and returns a structured workout for today. */
  @Get('daily-brief')
  dailyBrief(@Request() req: any) {
    return this.service.getDailyBrief(req.user.id);
  }
}
