import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AdaptiveService } from './adaptive.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('adaptive')
@UseGuards(JwtAuthGuard)
export class AdaptiveController {
  constructor(private adaptiveService: AdaptiveService) {}

  @Get('recommendations/:exerciseId')
  getRecommendation(@Request() req: any, @Param('exerciseId') exerciseId: string) {
    return this.adaptiveService.getRecommendation(req.user.id, exerciseId);
  }
}
