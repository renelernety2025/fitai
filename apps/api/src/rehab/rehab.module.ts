import { Module } from '@nestjs/common';
import { RehabController } from './rehab.controller';
import { RehabService } from './rehab.service';

@Module({
  controllers: [RehabController],
  providers: [RehabService],
})
export class RehabModule {}
