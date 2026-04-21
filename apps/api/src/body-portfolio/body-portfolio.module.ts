import { Module } from '@nestjs/common';
import { BodyPortfolioController } from './body-portfolio.controller';
import { BodyPortfolioService } from './body-portfolio.service';

@Module({
  controllers: [BodyPortfolioController],
  providers: [BodyPortfolioService],
})
export class BodyPortfolioModule {}
