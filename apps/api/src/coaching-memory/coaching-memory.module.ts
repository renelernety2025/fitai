import { Module } from '@nestjs/common';
import { CoachingMemoryController } from './coaching-memory.controller';
import { CoachingMemoryService } from './coaching-memory.service';

@Module({
  controllers: [CoachingMemoryController],
  providers: [CoachingMemoryService],
  exports: [CoachingMemoryService],
})
export class CoachingMemoryModule {}
