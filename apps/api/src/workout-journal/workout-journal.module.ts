import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkoutJournalController } from './workout-journal.controller';
import { WorkoutJournalService } from './workout-journal.service';

@Module({
  imports: [PrismaModule],
  controllers: [WorkoutJournalController],
  providers: [WorkoutJournalService],
  exports: [WorkoutJournalService],
})
export class WorkoutJournalModule {}
