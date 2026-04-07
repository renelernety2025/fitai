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
}
