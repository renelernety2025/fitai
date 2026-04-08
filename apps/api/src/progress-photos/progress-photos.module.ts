import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProgressPhotosController } from './progress-photos.controller';
import { ProgressPhotosService } from './progress-photos.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProgressPhotosController],
  providers: [ProgressPhotosService],
  exports: [ProgressPhotosService],
})
export class ProgressPhotosModule {}
