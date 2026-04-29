import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FitnessScoreService } from './fitness-score.service';

@Controller('fitness-score')
@UseGuards(JwtAuthGuard)
export class FitnessScoreController {
  constructor(private service: FitnessScoreService) {}

  @Get()
  getScore(@Request() req: any) {
    return this.service.calculateScore(req.user.id);
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.service.getHistory(req.user.id);
  }
}
