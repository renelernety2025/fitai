import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiInsightsService } from './ai-insights.service';

/**
 * AI endpoints hit Claude Haiku — each call costs real money. All endpoints
 * already cache for 1-24h per user, so realistic legitimate call rate is
 * 1-3 per hour. Tight throttle protects against runaway bugs and abuse.
 */
@Controller('ai-insights')
@UseGuards(JwtAuthGuard)
export class AiInsightsController {
  constructor(private service: AiInsightsService) {}

  @Get('recovery-tips')
  @Throttle({ default: { limit: 10, ttl: seconds(3600) } }) // 10/hour
  recoveryTips(@Request() req: any) {
    return this.service.getRecoveryTips(req.user.id);
  }

  @Get('weekly-review')
  @Throttle({ default: { limit: 10, ttl: seconds(3600) } }) // 10/hour
  weeklyReview(@Request() req: any) {
    return this.service.getWeeklyReview(req.user.id);
  }

  @Get('nutrition-tips')
  @Throttle({ default: { limit: 10, ttl: seconds(3600) } }) // 10/hour
  nutritionTips(@Request() req: any) {
    return this.service.getNutritionTips(req.user.id);
  }

  /** AI Coach Daily Brief — flagship hero. Reads everything we know
   * about the user and returns a structured workout for today.
   * 24h cache, so 5 calls/hour is plenty even with debug bursts. */
  @Get('daily-brief')
  @Throttle({ default: { limit: 5, ttl: seconds(3600) } }) // 5/hour
  dailyBrief(@Request() req: any) {
    return this.service.getDailyBrief(req.user.id);
  }
}
