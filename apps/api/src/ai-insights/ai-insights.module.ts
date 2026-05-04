import { Module } from '@nestjs/common';
import { AiInsightsController } from './ai-insights.controller';
import { AiInsightsService } from './ai-insights.service';
import { HistoryQueryService } from './history-query.service';

@Module({
  controllers: [AiInsightsController],
  providers: [AiInsightsService, HistoryQueryService],
  exports: [AiInsightsService, HistoryQueryService],
})
export class AiInsightsModule {}
