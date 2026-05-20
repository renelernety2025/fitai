import { Global, Module } from '@nestjs/common';
import { CronTrackingController } from './cron-tracking.controller';
import { CronTrackingService } from './cron-tracking.service';

@Global()
@Module({
  controllers: [CronTrackingController],
  providers: [CronTrackingService],
  exports: [CronTrackingService],
})
export class CronTrackingModule {}
