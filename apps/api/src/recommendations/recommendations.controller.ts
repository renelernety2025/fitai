import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  @Get()
  get(@Request() req: any) {
    return this.service.getRecommendations(req.user.id);
  }
}
