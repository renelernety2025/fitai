import { Module } from '@nestjs/common';
import { SupplementsController } from './supplements.controller';
import { SupplementsService } from './supplements.service';

@Module({
  controllers: [SupplementsController],
  providers: [SupplementsService],
  exports: [SupplementsService],
})
export class SupplementsModule {}
