import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';

@Module({
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule implements OnApplicationBootstrap {
  constructor(private service: AchievementsService) {}
  async onApplicationBootstrap() {
    await this.service.seedIfNeeded().catch(() => {});
  }
}
