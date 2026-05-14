import { Module } from '@nestjs/common';
import { GymSessionsController } from './gym-sessions.controller';
import { GymSessionsService } from './gym-sessions.service';
import { ProgressModule } from '../progress/progress.module';
import { LeaguesModule } from '../leagues/leagues.module';
import { SeasonsModule } from '../seasons/seasons.module';
import { SkillTreeModule } from '../skill-tree/skill-tree.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [ProgressModule, LeaguesModule, SeasonsModule, SkillTreeModule, AchievementsModule],
  controllers: [GymSessionsController],
  providers: [GymSessionsService],
})
export class GymSessionsModule {}
