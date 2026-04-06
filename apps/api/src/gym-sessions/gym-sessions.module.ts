import { Module } from '@nestjs/common';
import { GymSessionsController } from './gym-sessions.controller';
import { GymSessionsService } from './gym-sessions.service';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [ProgressModule],
  controllers: [GymSessionsController],
  providers: [GymSessionsService],
})
export class GymSessionsModule {}
