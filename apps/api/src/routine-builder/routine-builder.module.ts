import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RoutineBuilderController } from './routine-builder.controller';
import { RoutineBuilderService } from './routine-builder.service';

@Module({
  imports: [PrismaModule],
  controllers: [RoutineBuilderController],
  providers: [RoutineBuilderService],
  exports: [RoutineBuilderService],
})
export class RoutineBuilderModule {}
