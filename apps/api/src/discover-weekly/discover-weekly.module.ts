import { Module } from '@nestjs/common';
import { DiscoverWeeklyController } from './discover-weekly.controller';
import { DiscoverWeeklyService } from './discover-weekly.service';

@Module({
  controllers: [DiscoverWeeklyController],
  providers: [DiscoverWeeklyService],
})
export class DiscoverWeeklyModule {}
