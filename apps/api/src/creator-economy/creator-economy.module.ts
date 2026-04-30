import { Module } from '@nestjs/common';
import { CreatorEconomyController } from './creator-economy.controller';
import { CreatorEconomyService } from './creator-economy.service';
import { CreatorEconomyProcessor } from './creator-economy.processor';

@Module({
  controllers: [CreatorEconomyController],
  providers: [CreatorEconomyService, CreatorEconomyProcessor],
  exports: [CreatorEconomyService],
})
export class CreatorEconomyModule {}
