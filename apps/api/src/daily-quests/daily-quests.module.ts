import { Module } from '@nestjs/common';
import { DailyQuestsController } from './daily-quests.controller';
import { DailyQuestsService } from './daily-quests.service';

@Module({
  controllers: [DailyQuestsController],
  providers: [DailyQuestsService],
})
export class DailyQuestsModule {}
