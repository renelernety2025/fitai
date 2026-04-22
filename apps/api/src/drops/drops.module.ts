import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DropsController } from './drops.controller';
import { DropsService } from './drops.service';

@Module({
  imports: [PrismaModule],
  controllers: [DropsController],
  providers: [DropsService],
  exports: [DropsService],
})
export class DropsModule {}
