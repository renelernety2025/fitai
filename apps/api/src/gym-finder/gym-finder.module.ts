import { Module } from '@nestjs/common';
import { GymFinderController } from './gym-finder.controller';
import { GymFinderService } from './gym-finder.service';

@Module({
  controllers: [GymFinderController],
  providers: [GymFinderService],
})
export class GymFinderModule {}
