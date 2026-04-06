import { Module } from '@nestjs/common';
import { AIPlannerController } from './ai-planner.controller';
import { AIPlannerService } from './ai-planner.service';

@Module({
  controllers: [AIPlannerController],
  providers: [AIPlannerService],
  exports: [AIPlannerService],
})
export class AIPlannerModule {}
