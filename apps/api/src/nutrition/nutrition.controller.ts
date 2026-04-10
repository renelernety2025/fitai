import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NutritionService } from './nutrition.service';

@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private service: NutritionService) {}

  @Get('goals')
  getGoals(@Request() req: any) {
    return this.service.getGoals(req.user.id);
  }

  @Put('goals')
  setGoals(@Request() req: any, @Body() body: any) {
    return this.service.setGoals(req.user.id, body);
  }

  @Post('goals/auto')
  autoCalculate(@Request() req: any) {
    return this.service.autoCalculateGoals(req.user.id);
  }

  @Get('today')
  today(@Request() req: any) {
    return this.service.getTodaySummary(req.user.id);
  }

  @Get('log')
  getLog(@Request() req: any, @Query('date') date?: string) {
    return this.service.getLog(req.user.id, date);
  }

  @Post('log')
  addFood(@Request() req: any, @Body() body: any) {
    return this.service.addFood(req.user.id, body);
  }

  @Delete('log/:id')
  deleteFood(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteFood(req.user.id, id);
  }

  @Get('quick-foods')
  quickFoods() {
    return this.service.getQuickFoods();
  }

  // ── Section L: Generative Meal Planning ──

  /** Get current week's meal plan or null */
  @Get('meal-plan/current')
  currentMealPlan(@Request() req: any) {
    return this.service.getCurrentMealPlan(req.user.id);
  }

  /** List recent meal plans */
  @Get('meal-plan/history')
  mealPlanHistory(@Request() req: any, @Query('limit') limit?: string) {
    return this.service.listMealPlans(req.user.id, limit ? parseInt(limit, 10) : 8);
  }

  /** Generate (or regenerate) plan for current week. Pass preferences/allergies/cuisine in body.
   * Heavy Claude call — ~10k tokens. Real use case is 1x/week, 3/day is debug safety. */
  @Post('meal-plan/generate')
  @Throttle({ default: { limit: 3, ttl: seconds(86400) } }) // 3/day
  generateMealPlan(
    @Request() req: any,
    @Body()
    body: {
      weekStart?: string;
      preferences?: string;
      allergies?: string[];
      cuisine?: string;
    } = {},
  ) {
    return this.service.generateMealPlan(req.user.id, body);
  }

  @Delete('meal-plan/:id')
  deleteMealPlan(@Request() req: any, @Param('id') id: string) {
    return this.service.deleteMealPlan(req.user.id, id);
  }

  // ── Photo Food Recognition ──

  /** Get presigned S3 URL for food photo upload */
  @Post('photo-upload-url')
  getFoodPhotoUploadUrl(@Request() req: any) {
    return this.service.getFoodPhotoUploadUrl(req.user.id);
  }

  /** Analyze uploaded food photo via Claude Vision → return estimated macros */
  @Post('analyze-photo')
  @Throttle({ default: { limit: 20, ttl: seconds(86400) } })
  analyzeFoodPhoto(@Request() req: any, @Body() body: { s3Key: string }) {
    return this.service.analyzeFoodPhoto(body.s3Key);
  }
}
