import { Module } from '@nestjs/common';
import { FitnessScoreController } from './fitness-score.controller';
import { FitnessScoreService } from './fitness-score.service';

@Module({
  controllers: [FitnessScoreController],
  providers: [FitnessScoreService],
  exports: [FitnessScoreService],
})
export class FitnessScoreModule {}
