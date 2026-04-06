import { Module } from '@nestjs/common';
import { PreprocessingController } from './preprocessing.controller';
import { PreprocessingService } from './preprocessing.service';

@Module({
  controllers: [PreprocessingController],
  providers: [PreprocessingService],
  exports: [PreprocessingService],
})
export class PreprocessingModule {}
