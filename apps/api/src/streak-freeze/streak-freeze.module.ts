import { Module } from '@nestjs/common';
import { StreakFreezeController } from './streak-freeze.controller';
import { StreakFreezeService } from './streak-freeze.service';

@Module({
  controllers: [StreakFreezeController],
  providers: [StreakFreezeService],
})
export class StreakFreezeModule {}
