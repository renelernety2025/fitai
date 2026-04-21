import { Module } from '@nestjs/common';
import { BloodworkController } from './bloodwork.controller';
import { BloodworkService } from './bloodwork.service';

@Module({
  controllers: [BloodworkController],
  providers: [BloodworkService],
})
export class BloodworkModule {}
