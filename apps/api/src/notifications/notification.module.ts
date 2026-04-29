import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AiInsightsModule } from '../ai-insights/ai-insights.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [AiInsightsModule, EmailModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
