import { Module } from '@nestjs/common';
import { BossFightsController } from './boss-fights.controller';
import { BossFightsService } from './boss-fights.service';

@Module({
  controllers: [BossFightsController],
  providers: [BossFightsService],
})
export class BossFightsModule {}
