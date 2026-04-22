import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClipsController } from './clips.controller';
import { ClipsService } from './clips.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClipsController],
  providers: [ClipsService],
  exports: [ClipsService],
})
export class ClipsModule {}
