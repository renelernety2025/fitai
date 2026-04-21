import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BodyPortfolioService } from './body-portfolio.service';

@Controller('body-portfolio')
@UseGuards(JwtAuthGuard)
export class BodyPortfolioController {
  constructor(private service: BodyPortfolioService) {}

  @Get()
  getPortfolio(@Request() req: any) {
    return this.service.getPortfolio(req.user.id);
  }
}
